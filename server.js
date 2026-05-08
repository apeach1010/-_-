const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 8000);
const ROOT = __dirname;

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
const OVERPASS_ENDPOINT = process.env.OVERPASS_ENDPOINT || "https://overpass-api.de/api/interpreter";
const OSRM_PROFILE = process.env.OSRM_PROFILE || "driving";

const MARGINAL_CULTURE_HINTS = [
  "독립서점",
  "작은 책방",
  "작은 갤러리",
  "소규모 전시",
  "생활문화센터",
  "동네 문화공간",
  "로컬 문화공간",
  "지역문화 공간",
  "독립 출판",
  "작업실",
  "공방",
  "소극장",
  "작은 공연장",
  "아카이브",
  "커뮤니티 공간",
  "전통 공방",
  "문화재",
  "기념관",
  "근대문화유산"
];

const MARGINAL_MODIFIERS = ["독립", "작은", "생활문화", "로컬", "소규모", "동네", "골목", "지역"];
const MARGINAL_TYPES = ["문화공간", "전시", "갤러리", "책방", "서점", "공방", "소극장", "공연장", "문화재", "기념관", "아카이브"];

app.use(express.static(ROOT));

app.get("/", (req, res) => {
  res.sendFile(path.join(ROOT, "leaflet.html"));
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    naverConfigured: Boolean(NAVER_CLIENT_ID && NAVER_CLIENT_SECRET)
  });
});

app.get("/api/search-place", async (req, res, next) => {
  try {
    const query = cleanQuery(req.query.query);
    if (!query) return res.json({ places: [] });

    const places = rankByQueryRelevance(await searchNaverLocal(query, 20, "sim"), query).slice(0, 5);
    res.json({ places });
  } catch (error) {
    next(error);
  }
});

app.get("/api/route", async (req, res, next) => {
  try {
    const start = {
      lat: Number(req.query.startLat),
      lng: Number(req.query.startLng)
    };
    const end = {
      lat: Number(req.query.endLat),
      lng: Number(req.query.endLng)
    };

    if (!isValidCoord(start) || !isValidCoord(end)) {
      return res.status(400).json({ error: "startLat/startLng/endLat/endLng are required" });
    }

    try {
      const route = await fetchOsrmRoute(start, end);
      res.json(route);
    } catch (error) {
      console.warn("Route provider failed. Returning straight fallback route.", error.message);
      res.json({
        source: "straight",
        usedFallback: true,
        distanceMeters: Math.round(haversineKm(start.lat, start.lng, end.lat, end.lng) * 1000),
        durationSeconds: 0,
        coordinates: [start, end]
      });
    }
  } catch (error) {
    next(error);
  }
});

app.get("/api/places", async (req, res, next) => {
  try {
    const query = cleanQuery(req.query.query || req.query.q || "문화공간");
    const center = {
      lat: Number(req.query.lat),
      lng: Number(req.query.lng)
    };
    const context = {
      startName: cleanQuery(req.query.startName),
      endName: cleanQuery(req.query.endName),
      startAddress: cleanQuery(req.query.startAddress),
      endAddress: cleanQuery(req.query.endAddress),
      startLat: Number(req.query.startLat),
      startLng: Number(req.query.startLng),
      endLat: Number(req.query.endLat),
      endLng: Number(req.query.endLng),
      detourKm: Number(req.query.detourKm || 1.2),
      route: parseRouteParam(req.query.route)
    };

    const places = await searchRecommendedPlaces(query, center, context);
    res.json({ places, source: "naver" });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    error: error.message || "Internal server error"
  });
});

app.listen(PORT, () => {
  console.log(`Hidden culture map running at http://127.0.0.1:${PORT}/leaflet.html`);
});

async function searchRecommendedPlaces(query, center, context = {}) {
  const routePoints = Array.isArray(context.route) && context.route.length
    ? context.route
    : buildFallbackRoutePoints(context);
  const anchors = dedupe([
    context.startName,
    context.endName,
    stripStationSuffix(context.startName),
    stripStationSuffix(context.endName),
    ...extractSearchAnchors(context.startAddress),
    ...extractSearchAnchors(context.endAddress)
  ]).filter(Boolean);
  const variants = buildMarginalCultureQueries(query, anchors);

  const results = [];
  for (const variant of variants) {
    try {
      const display = variant.profile === "broad" ? 10 : 5;
      const places = await searchNaverLocal(variant.query, display);
      results.push(...places.map((place) => ({
        ...place,
        queryProfiles: [variant.profile],
        broadHits: variant.profile === "broad" ? 1 : 0,
        nicheHits: variant.profile === "niche" ? 1 : 0,
        broadExposure: variant.profile === "broad" ? exposureWeight(place.searchRank, display) : 0,
        nicheExposure: variant.profile === "niche" ? exposureWeight(place.searchRank, display) : 0
      })));
    } catch (error) {
      console.warn(`Naver query failed and was skipped: ${variant.query}`, error.message);
    }
  }

  return dedupePlaces(results)
    .map((place) => ({
      ...place,
      distanceFromCenter: isFinite(center.lat) && isFinite(center.lng)
        ? haversineKm(center.lat, center.lng, place.lat, place.lng)
        : 0,
      distanceFromRouteKm: routePoints.length ? distanceToRouteKm(place, routePoints) : 0,
      routeProgress: routePoints.length ? routeProgressKm(place, routePoints) : 0
    }))
    .filter((place) => !routePoints.length || place.distanceFromRouteKm <= (context.detourKm || 1.2))
    .sort((a, b) => (a.distanceFromRouteKm - b.distanceFromRouteKm) || (a.distanceFromCenter - b.distanceFromCenter))
    .slice(0, 60);
}

function buildMarginalCultureQueries(query, anchors) {
  const baseQuery = cleanQuery(query);
  const queryWords = splitQuery(baseQuery);
  const anchorTerms = anchors.length ? anchors : queryWords;
  const nicheQueries = dedupe([
    baseQuery,
    ...anchorTerms.map((anchor) => `${anchor} ${baseQuery}`),
    ...anchorTerms.flatMap((anchor) => MARGINAL_CULTURE_HINTS.map((hint) => `${anchor} ${hint}`)),
    ...anchorTerms.flatMap((anchor) => MARGINAL_MODIFIERS.flatMap((modifier) => MARGINAL_TYPES.map((type) => `${anchor} ${modifier} ${type}`))),
    ...MARGINAL_CULTURE_HINTS,
    ...queryWords.flatMap((word) => MARGINAL_MODIFIERS.map((modifier) => `${word} ${modifier} 문화공간`))
  ]).slice(0, 24).map((item) => ({ query: item, profile: "niche" }));
  const broadQueries = dedupe(anchorTerms.flatMap((anchor) => [
    `${anchor} 전시`,
    `${anchor} 문화공간`,
    `${anchor} 박물관`,
    `${anchor} 갤러리`,
    `${anchor} 공연`,
    `${anchor} 놀거리`,
    `${anchor} 핫플`,
    `${anchor} 관광명소`
  ])).slice(0, 16).map((item) => ({ query: item, profile: "broad" }));

  return [...nicheQueries, ...broadQueries];
}

function exposureWeight(rank, display) {
  const safeRank = Math.max(1, Number(rank) || display);
  const safeDisplay = Math.max(1, Number(display) || 5);
  return Math.max(0, (safeDisplay - safeRank + 1) / safeDisplay);
}

async function searchNaverLocal(query, display = 5, sort = "comment") {
  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    throw new Error("NAVER_CLIENT_ID and NAVER_CLIENT_SECRET must be set in .env");
  }

  const params = new URLSearchParams({
    query,
    display: String(display),
    start: "1",
    sort
  });

  const response = await fetch(`https://openapi.naver.com/v1/search/local.json?${params.toString()}`, {
    headers: {
      "X-Naver-Client-Id": NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": NAVER_CLIENT_SECRET
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Naver local search failed: ${response.status} ${body}`);
  }

  const data = await response.json();
  return (data.items || [])
    .map((item, index) => normalizeNaverItem(item, index + 1))
    .filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lng));
}

async function fetchOsrmRoute(start, end) {
  const url = [
    `https://router.project-osrm.org/route/v1/${OSRM_PROFILE}`,
    `${start.lng},${start.lat};${end.lng},${end.lat}`,
    "?overview=full&geometries=geojson&steps=false"
  ].join("");

  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OSRM route failed: ${response.status} ${body}`);
  }

  const data = await response.json();
  const route = data.routes && data.routes[0];
  if (!route || !route.geometry || !Array.isArray(route.geometry.coordinates)) {
    throw new Error("OSRM route response did not include coordinates");
  }

  return {
    source: "osrm",
    distanceMeters: Math.round(route.distance || 0),
    durationSeconds: Math.round(route.duration || 0),
    coordinates: route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }))
  };
}

async function searchOverpassCulturePlaces(routePoints, detourKm) {
  if (!routePoints.length) return [];
  const radius = Math.round(clampNumber(detourKm || 1.2, 0.3, 3) * 1000);
  const bbox = routeBoundingBox(routePoints, radius / 1000);
  const query = `
    [out:json][timeout:12];
    (
      node[~"^(tourism|historic|amenity|leisure)$"~"^(museum|gallery|artwork|attraction|monument|memorial|archaeological_site|arts_centre|library|theatre|cultural_centre)$"](${bbox});
      way[~"^(tourism|historic|amenity|leisure)$"~"^(museum|gallery|artwork|attraction|monument|memorial|archaeological_site|arts_centre|library|theatre|cultural_centre)$"](${bbox});
      relation[~"^(tourism|historic|amenity|leisure)$"~"^(museum|gallery|artwork|attraction|monument|memorial|archaeological_site|arts_centre|library|theatre|cultural_centre)$"](${bbox});
    );
    out center tags 40;
  `;

  const response = await fetch(OVERPASS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
    body: new URLSearchParams({ data: query })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Overpass failed: ${response.status} ${body.slice(0, 160)}`);
  }

  const data = await response.json();
  return (data.elements || []).map(normalizeOverpassElement).filter(Boolean);
}

function normalizeOverpassElement(element) {
  const tags = element.tags || {};
  const lat = Number(element.lat ?? element.center?.lat);
  const lng = Number(element.lon ?? element.center?.lon);
  const name = tags.name || tags["name:ko"] || tags["name:en"];
  if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const category = tags.tourism || tags.historic || tags.amenity || tags.leisure || "culture";
  const address = [
    tags["addr:province"],
    tags["addr:city"],
    tags["addr:district"],
    tags["addr:street"],
    tags["addr:housenumber"]
  ].filter(Boolean).join(" ");

  return {
    name,
    category: overpassCategoryLabel(category),
    address,
    lat,
    lng,
    reviewCount: 0,
    description: tags.description || tags.inscription || tags.wikipedia || "",
    tags: guessTags(`${name} ${category} ${address} ${tags.description || ""}`),
    source: "openstreetmap",
    osmId: `${element.type}/${element.id}`,
    rawCategory: category
  };
}

function rankByQueryRelevance(places, query) {
  const normalizedQuery = normalizeSearchText(query);
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

  return [...places].sort((a, b) => relevanceScore(b, normalizedQuery, queryTokens) - relevanceScore(a, normalizedQuery, queryTokens));
}

function relevanceScore(place, normalizedQuery, queryTokens) {
  const name = normalizeSearchText(place.name);
  const category = normalizeSearchText(place.category);
  const address = normalizeSearchText(place.address);
  let score = 0;

  if (name === normalizedQuery) score += 100;
  if (name.includes(normalizedQuery)) score += 70;
  if (normalizedQuery.includes(name) && name.length >= 2) score += 45;

  for (const token of queryTokens) {
    if (name.includes(token)) score += 16;
    if (category.includes(token)) score += 6;
    if (address.includes(token)) score += 4;
  }

  if (/(역|터미널|정류장)$/.test(normalizedQuery) && /(지하철|전철|교통|운수)/.test(category)) score += 35;
  if (/(역|터미널|정류장)$/.test(normalizedQuery) && !/(지하철|전철|교통|운수)/.test(category)) score -= 20;

  return score;
}

function normalizeSearchText(value) {
  return cleanQuery(value)
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeNaverItem(item, searchRank = 0) {
  const description = stripHtml(item.description || item.category || "");
  const address = stripHtml(item.roadAddress || item.address || "");
  return {
    name: stripHtml(item.title),
    category: stripHtml(item.category || "장소"),
    address,
    lat: Number(item.mapy) / 10000000,
    lng: Number(item.mapx) / 10000000,
    reviewCount: 0,
    description,
    tags: guessTags(`${item.title} ${item.category} ${description} ${address}`),
    link: item.link || "",
    source: "naver",
    searchRank,
    raw: {
      title: item.title || "",
      category: item.category || "",
      description: item.description || "",
      address: item.address || "",
      roadAddress: item.roadAddress || "",
      mapx: item.mapx,
      mapy: item.mapy,
      link: item.link || ""
    }
  };
}

function parseRouteParam(value) {
  try {
    const parsed = JSON.parse(String(value || "[]"));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((point) => ({ lat: Number(point.lat), lng: Number(point.lng) }))
      .filter(isValidCoord)
      .slice(0, 80);
  } catch {
    return [];
  }
}

function buildFallbackRoutePoints(context = {}) {
  const start = { lat: Number(context.startLat), lng: Number(context.startLng) };
  const end = { lat: Number(context.endLat), lng: Number(context.endLng) };
  return isValidCoord(start) && isValidCoord(end) ? [start, end] : [];
}

function isValidCoord(point) {
  return point && Number.isFinite(point.lat) && Number.isFinite(point.lng);
}

function sampleRoutePoints(points, limit) {
  if (points.length <= limit) return points;
  const sampled = [];
  for (let index = 0; index < limit; index += 1) {
    const sourceIndex = Math.round(index * (points.length - 1) / (limit - 1));
    sampled.push(points[sourceIndex]);
  }
  return sampled;
}

function routeBoundingBox(points, paddingKm) {
  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  const centerLat = lats.reduce((sum, lat) => sum + lat, 0) / lats.length;
  const latPad = paddingKm / 111.32;
  const lngPad = paddingKm / (111.32 * Math.cos(toRadians(centerLat)));
  const south = Math.min(...lats) - latPad;
  const north = Math.max(...lats) + latPad;
  const west = Math.min(...lngs) - lngPad;
  const east = Math.max(...lngs) + lngPad;
  return [south, west, north, east].map((value) => value.toFixed(6)).join(",");
}

function distanceToRouteKm(place, routePoints) {
  if (!routePoints.length) return 0;
  if (routePoints.length === 1) return haversineKm(place.lat, place.lng, routePoints[0].lat, routePoints[0].lng);

  let best = Infinity;
  for (let index = 0; index < routePoints.length - 1; index += 1) {
    best = Math.min(best, distanceToSegmentKm(place, routePoints[index], routePoints[index + 1]));
  }
  return best;
}

function routeProgressKm(place, routePoints) {
  if (routePoints.length < 2) return 0;
  const segmentLengths = [];
  let total = 0;
  for (let index = 0; index < routePoints.length - 1; index += 1) {
    const length = haversineKm(routePoints[index].lat, routePoints[index].lng, routePoints[index + 1].lat, routePoints[index + 1].lng);
    segmentLengths.push(length);
    total += length;
  }
  if (!total) return 0;

  let best = { distance: Infinity, progressKm: 0 };
  let walked = 0;
  for (let index = 0; index < routePoints.length - 1; index += 1) {
    const projection = projectToSegment(place, routePoints[index], routePoints[index + 1]);
    const distance = haversineKm(place.lat, place.lng, projection.lat, projection.lng);
    if (distance < best.distance) {
      best = { distance, progressKm: walked + segmentLengths[index] * projection.t };
    }
    walked += segmentLengths[index];
  }
  return clampNumber(best.progressKm / total, 0, 1);
}

function distanceToSegmentKm(point, start, end) {
  const projection = projectToSegment(point, start, end);
  return haversineKm(point.lat, point.lng, projection.lat, projection.lng);
}

function projectToSegment(point, start, end) {
  const latScale = 111.32;
  const lngScale = 111.32 * Math.cos(toRadians((start.lat + end.lat) / 2));
  const px = point.lng * lngScale;
  const py = point.lat * latScale;
  const ax = start.lng * lngScale;
  const ay = start.lat * latScale;
  const bx = end.lng * lngScale;
  const by = end.lat * latScale;
  const dx = bx - ax;
  const dy = by - ay;
  const length = dx * dx + dy * dy;
  const t = length ? clampNumber(((px - ax) * dx + (py - ay) * dy) / length, 0, 1) : 0;
  return {
    lat: start.lat + (end.lat - start.lat) * t,
    lng: start.lng + (end.lng - start.lng) * t,
    t
  };
}

function overpassCategoryLabel(category) {
  return {
    museum: "박물관",
    gallery: "갤러리",
    artwork: "공공미술",
    attraction: "문화명소",
    monument: "기념물",
    memorial: "기념공간",
    archaeological_site: "유적",
    arts_centre: "문화예술공간",
    library: "도서관",
    theatre: "공연장",
    cultural_centre: "문화센터"
  }[category] || category || "문화공간";
}

function cleanQuery(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function splitQuery(query) {
  return cleanQuery(query).split(/[\s,]+/).filter((word) => word.length >= 2);
}

function stripStationSuffix(value) {
  return cleanQuery(value).replace(/\s*\d+호선\s*$/g, "").replace(/역\s*$/g, "");
}

function extractSearchAnchors(value) {
  const cleaned = cleanQuery(value).replace(/[(),]/g, " ");
  if (!cleaned) return [];
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const anchors = [];
  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    if (/(시|군|구|동|읍|면|로|길)$/.test(part) && part.length >= 2) anchors.push(part);
    if (index > 0 && /(구|동|읍|면)$/.test(part)) anchors.push(`${parts[index - 1]} ${part}`);
  }
  return dedupe(anchors).slice(0, 5);
}

function dedupe(values) {
  return [...new Set(values.map(cleanQuery).filter(Boolean))];
}

function dedupePlaces(places) {
  const seen = new Map();
  const unique = [];
  for (const place of places) {
    const key = `${place.name}|${place.address}|${place.lat.toFixed(6)}|${place.lng.toFixed(6)}`;
    if (seen.has(key)) {
      const existing = seen.get(key);
      existing.broadHits = (existing.broadHits || 0) + (place.broadHits || 0);
      existing.nicheHits = (existing.nicheHits || 0) + (place.nicheHits || 0);
      existing.broadExposure = (existing.broadExposure || 0) + (place.broadExposure || 0);
      existing.nicheExposure = (existing.nicheExposure || 0) + (place.nicheExposure || 0);
      existing.queryProfiles = dedupe([...(existing.queryProfiles || []), ...(place.queryProfiles || [])]);
      continue;
    }
    seen.set(key, place);
    unique.push(place);
  }
  return unique;
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, "\"")
    .replace(/&amp;/g, "&")
    .trim();
}

function guessTags(text) {
  const value = String(text || "").toLowerCase();
  const tags = [];
  if (/(로컬|지역|동네|골목|마을|시장)/.test(value)) tags.push("local");
  if (/(독립|인디|창작|작가|공방|소규모)/.test(value)) tags.push("indie");
  if (/(전통|문화재|역사|근대|한옥|공예)/.test(value)) tags.push("tradition");
  if (/(전시|갤러리|미술|아트|박물관|문화공간)/.test(value)) tags.push("exhibition");
  if (/(책|서점|책방|출판|문학)/.test(value)) tags.push("book");
  return tags.length ? tags : ["local"];
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const r = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value) {
  return value * Math.PI / 180;
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}
