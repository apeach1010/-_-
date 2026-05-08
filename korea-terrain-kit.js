(function (global) {
  "use strict";

  const MAINLAND_LL = [
    [126.58, 37.95], [126.94, 38.12], [127.28, 38.25], [128.05, 38.25],
    [128.55, 38.18], [129.02, 37.98], [129.28, 37.68], [129.15, 37.28],
    [129.18, 36.95], [129.35, 36.55], [129.50, 36.05], [129.50, 35.58],
    [129.36, 35.18], [129.10, 34.88], [128.72, 34.68], [128.24, 34.52],
    [127.70, 34.42], [127.12, 34.35], [126.62, 34.38], [126.20, 34.50],
    [125.90, 34.72], [125.86, 35.08], [126.05, 35.46], [126.24, 35.82],
    [126.42, 36.20], [126.30, 36.55], [126.18, 36.92], [126.24, 37.24],
    [126.38, 37.55],
  ];

  const ISLANDS = [
    { key: "JejuIsland", lon: 126.53, lat: 33.38, rx: 300, rz: 145, angle: -8 },
  ];

  const DEFAULT_CITY_POINTS = {
    Seoul: { lon: 126.9780, lat: 37.5665 },
    Incheon: { lon: 126.7052, lat: 37.4563 },
    Suwon: { lon: 127.0286, lat: 37.2636 },
    Chuncheon: { lon: 127.7298, lat: 37.8813 },
    Gangneung: { lon: 128.8761, lat: 37.7519 },
    Cheongju: { lon: 127.4890, lat: 36.6424 },
    Sejong: { lon: 127.2890, lat: 36.4800 },
    Daejeon: { lon: 127.3845, lat: 36.3504 },
    Jeonju: { lon: 127.1480, lat: 35.8242 },
    Gwangju: { lon: 126.8526, lat: 35.1595 },
    Mokpo: { lon: 126.3922, lat: 34.8118 },
    Daegu: { lon: 128.6014, lat: 35.8714 },
    Andong: { lon: 128.7294, lat: 36.5684 },
    Pohang: { lon: 129.3650, lat: 36.0190 },
    Ulsan: { lon: 129.3114, lat: 35.5384 },
    Busan: { lon: 129.0756, lat: 35.1796 },
    Jinju: { lon: 128.1076, lat: 35.1800 },
    Yeosu: { lon: 127.6622, lat: 34.7604 },
    Jeju: { lon: 126.5312, lat: 33.4996 },
  };

  const DEFAULT_ROADS = [
    ["Seoul", "Incheon"], ["Seoul", "Suwon"], ["Seoul", "Chuncheon"],
    ["Chuncheon", "Gangneung"], ["Suwon", "Cheongju"], ["Cheongju", "Sejong"],
    ["Sejong", "Daejeon"], ["Daejeon", "Jeonju"], ["Jeonju", "Gwangju"],
    ["Gwangju", "Mokpo"], ["Gwangju", "Yeosu"], ["Daejeon", "Daegu"],
    ["Cheongju", "Andong"], ["Andong", "Daegu"], ["Andong", "Pohang"],
    ["Daegu", "Pohang"], ["Daegu", "Ulsan"], ["Ulsan", "Busan"],
    ["Daegu", "Busan"], ["Daegu", "Jinju"], ["Jinju", "Yeosu"], ["Jinju", "Busan"],
  ];

  const PIXEL_NATURE_ANCHORS = [
    { type: "flower", lon: 127.18, lat: 37.36 },
    { type: "grass", lon: 126.86, lat: 37.42 },
    { type: "flower", lon: 126.72, lat: 37.34 },
    { type: "grass", lon: 127.26, lat: 37.50 },
    { type: "tree", lon: 126.58, lat: 37.64 },
    { type: "tree", lon: 127.35, lat: 37.32 },
    { type: "flower", lon: 127.45, lat: 37.58 },
    { type: "tree", lon: 128.62, lat: 37.55 },
    { type: "flower", lon: 128.84, lat: 37.35 },
    { type: "tree", lon: 127.04, lat: 35.56 },
    { type: "flower", lon: 126.76, lat: 35.34 },
    { type: "grass", lon: 127.78, lat: 35.54 },
    { type: "tree", lon: 128.32, lat: 35.34 },
    { type: "flower", lon: 129.05, lat: 35.45 },
    { type: "grass", lon: 128.78, lat: 35.78 },
    { type: "tree", lon: 127.64, lat: 34.98 },
  ];

  const DEFAULT_OPTIONS = {
    minLon: 125.0,
    maxLon: 130.1,
    minLat: 33.0,
    maxLat: 38.35,
    worldW: 5500,
    worldD: 7250,
    landY: 7,
    includeSea: true,
    includeJeju: true,
    grassBlockSize: 72,
    groundDetailCount: 190,
    grassTuftCount: 74,
    treeCount: 28,
    flowerPatchCount: 36,
    colors: {
      land: 0x69b86a,
      landIsland: 0x77c875,
      landEdge: 0x39764b,
      sea: 0x469fca,
    },
  };

  function mergeOptions(options) {
    const merged = Object.assign({}, DEFAULT_OPTIONS, options || {});
    merged.colors = Object.assign({}, DEFAULT_OPTIONS.colors, (options && options.colors) || {});
    return merged;
  }

  function seededUnit(seed) {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
  }

  function makeMaterial(THREE, color, roughness = 0.66, metalness = 0.02) {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness });
  }

  function addBox(THREE, group, size, pos, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }

  function createPixelTexture(THREE, palette, block = 8, size = 128, seedOffset = 0) {
    if (!global.document) {
      return null;
    }

    const canvas = global.document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    for (let y = 0; y < size; y += block) {
      for (let x = 0; x < size; x += block) {
        const seed = seedOffset + x * 17 + y * 31;
        const color = palette[Math.floor(seededUnit(seed) * palette.length) % palette.length];
        const shade = 0.86 + seededUnit(seed + 3) * 0.24;
        const c = new THREE.Color(color).multiplyScalar(shade);
        ctx.fillStyle = `#${c.getHexString()}`;
        ctx.fillRect(x, y, block, block);

        if (seededUnit(seed + 7) > 0.72) {
          const hi = c.clone().multiplyScalar(1.12);
          ctx.fillStyle = `#${hi.getHexString()}`;
          ctx.fillRect(x + block * 0.25, y + block * 0.25, block * 0.5, block * 0.5);
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestMipmapNearestFilter || THREE.NearestFilter;
    if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  function createProjector(THREE, config) {
    function project(lon, lat) {
      const x = ((lon - config.minLon) / (config.maxLon - config.minLon) - 0.5) * config.worldW;
      const z = ((config.maxLat - lat) / (config.maxLat - config.minLat) - 0.5) * config.worldD;
      return new THREE.Vector3(x, config.landY, z);
    }

    function lonLatFromWorld(x, z) {
      const lon = ((x / config.worldW) + 0.5) * (config.maxLon - config.minLon) + config.minLon;
      const lat = config.maxLat - ((z / config.worldD) + 0.5) * (config.maxLat - config.minLat);
      return [lon, lat];
    }

    return { project, lonLatFromWorld };
  }

  function pointInPolygon(lon, lat, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];
      const intersect = ((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function shapeFromLonLat(THREE, project, points) {
    const shape = new THREE.Shape();
    points.forEach(([lon, lat], index) => {
      const p = project(lon, lat);
      if (index === 0) shape.moveTo(p.x, p.z);
      else shape.lineTo(p.x, p.z);
    });
    shape.closePath();
    return shape;
  }

  function islandShape(THREE, project, island, steps = 48) {
    const center = project(island.lon, island.lat);
    const shape = new THREE.Shape();
    const angle = island.angle * Math.PI / 180;
    for (let i = 0; i <= steps; i += 1) {
      const t = Math.PI * 2 * i / steps;
      const px = Math.cos(t) * island.rx;
      const pz = Math.sin(t) * island.rz;
      const x = center.x + px * Math.cos(angle) - pz * Math.sin(angle);
      const z = center.z + px * Math.sin(angle) + pz * Math.cos(angle);
      if (i === 0) shape.moveTo(x, z);
      else shape.lineTo(x, z);
    }
    return shape;
  }

  function makeLandMesh(THREE, group, shape, color, edgeColor, grassTexture, config) {
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 12,
      bevelEnabled: true,
      bevelSize: 2.8,
      bevelThickness: 2.2,
      bevelSegments: 4,
    });
    geometry.rotateX(Math.PI / 2);
    geometry.translate(0, config.landY - 6, 0);

    const material = new THREE.MeshStandardMaterial({
      color: grassTexture ? 0xffffff : color,
      map: grassTexture,
      roughness: 0.9,
      metalness: 0.02,
      flatShading: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    const edgeGeometry = new THREE.EdgesGeometry(geometry, 24);
    const edge = new THREE.LineSegments(
      edgeGeometry,
      new THREE.LineBasicMaterial({ color: edgeColor, transparent: true, opacity: 0.52 })
    );
    group.add(edge);
    return mesh;
  }

  function insideIslandWorld(THREE, project, x, z, island) {
    const c = project(island.lon, island.lat);
    const angle = -island.angle * Math.PI / 180;
    const dx = x - c.x;
    const dz = z - c.z;
    const rx = dx * Math.cos(angle) - dz * Math.sin(angle);
    const rz = dx * Math.sin(angle) + dz * Math.cos(angle);
    return (rx * rx) / (island.rx * island.rx) + (rz * rz) / (island.rz * island.rz) <= 1;
  }

  function distanceToSegment2D(x, z, a, b) {
    const abx = b.x - a.x;
    const abz = b.z - a.z;
    const apx = x - a.x;
    const apz = z - a.z;
    const lengthSq = abx * abx + abz * abz;
    if (lengthSq === 0) return Math.hypot(apx, apz);
    const t = Math.max(0, Math.min(1, (apx * abx + apz * abz) / lengthSq));
    const px = a.x + abx * t;
    const pz = a.z + abz * t;
    return Math.hypot(x - px, z - pz);
  }

  function normalizeCityPoints(THREE, project, cityInput) {
    const source = cityInput || DEFAULT_CITY_POINTS;
    const output = {};
    Object.entries(source).forEach(([key, value]) => {
      let lon;
      let lat;
      if (Array.isArray(value)) {
        lon = value[2];
        lat = value[3];
      } else {
        lon = value.lon;
        lat = value.lat;
      }
      if (Number.isFinite(lon) && Number.isFinite(lat)) {
        output[key] = { lon, lat, position: project(lon, lat) };
      }
    });
    return output;
  }

  function createKoreaTerrain(THREE, scene, options) {
    if (!THREE) throw new Error("THREE is required.");
    if (!scene || typeof scene.add !== "function") throw new Error("A THREE.Scene or THREE.Group is required.");

    const config = mergeOptions(options);
    const { project, lonLatFromWorld } = createProjector(THREE, config);
    const islands = config.includeJeju === false ? [] : ISLANDS.slice();
    const cityPoints = normalizeCityPoints(THREE, project, config.cities);
    const roads = config.roads || DEFAULT_ROADS;

    const root = new THREE.Group();
    const coastGroup = new THREE.Group();
    const terrainGroup = new THREE.Group();
    root.add(coastGroup, terrainGroup);
    scene.add(root);

    const grassTexture = createPixelTexture(THREE, [0x73c864, 0x7bd06a, 0x68b85c, 0x86d872, 0x5fae58], 8, 128, 11);
    if (grassTexture) grassTexture.repeat.set(0.018, 0.018);

    const waterTexture = createPixelTexture(THREE, [0x42a8cb, 0x58b8d4, 0x2f91b5, 0x6ec5dd], 8, 128, 41);
    if (waterTexture) waterTexture.repeat.set(80, 80);

    let sea = null;
    if (config.includeSea) {
      sea = new THREE.Mesh(
        new THREE.PlaneGeometry(14000, 14000, 96, 96),
        new THREE.MeshStandardMaterial({
          color: waterTexture ? 0xffffff : config.colors.sea,
          map: waterTexture,
          roughness: 0.82,
          metalness: 0.03,
        })
      );
      sea.rotation.x = -Math.PI / 2;
      sea.receiveShadow = true;
      root.add(sea);
    }

    function isLand(x, z) {
      const [lon, lat] = lonLatFromWorld(x, z);
      if (pointInPolygon(lon, lat, MAINLAND_LL)) return true;
      return islands.some((island) => insideIslandWorld(THREE, project, x, z, island));
    }

    function decorNearCity(x, z, radius = 230) {
      return Object.values(cityPoints).some((city) => Math.hypot(city.position.x - x, city.position.z - z) < radius);
    }

    function decorNearRoad(x, z, radius = 78) {
      return roads.some(([a, b]) => {
        if (!cityPoints[a] || !cityPoints[b]) return false;
        return distanceToSegment2D(x, z, cityPoints[a].position, cityPoints[b].position) < radius;
      });
    }

    function quietDecorSpot(x, z, cityRadius = 230, roadRadius = 78) {
      return isLand(x, z) && !decorNearCity(x, z, cityRadius) && !decorNearRoad(x, z, roadRadius);
    }

    function seededLandPoint(seedBase, attempt) {
      const lon = config.minLon + seededUnit(seedBase + attempt * 5) * (config.maxLon - config.minLon);
      const lat = config.minLat + seededUnit(seedBase + attempt * 7 + 3) * (config.maxLat - config.minLat);
      return project(lon, lat);
    }

    function addPixelGrassSurface() {
      const cells = [];
      const half = config.grassBlockSize / 2;
      for (let x = -config.worldW / 2 + half; x <= config.worldW / 2 - half; x += config.grassBlockSize) {
        for (let z = -config.worldD / 2 + half; z <= config.worldD / 2 - half; z += config.grassBlockSize) {
          if (!isLand(x, z)) continue;
          const seed = Math.floor((x + config.worldW) * 0.19 + (z + config.worldD) * 0.23);
          const shade = seededUnit(seed);
          const color = shade < 0.22 ? 0x70c463 : shade < 0.5 ? 0x7acc68 : shade < 0.78 ? 0x82d06d : 0x6fc260;
          cells.push({ x, z, color });
        }
      }

      const geometry = new THREE.BoxGeometry(config.grassBlockSize * 1.01, 0.9, config.grassBlockSize * 1.01);
      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.96,
        metalness: 0,
        flatShading: true,
      });
      const mesh = new THREE.InstancedMesh(geometry, material, cells.length);
      const matrix = new THREE.Matrix4();
      cells.forEach((cell, index) => {
        matrix.makeTranslation(cell.x, config.landY + 0.5, cell.z);
        mesh.setMatrixAt(index, matrix);
        mesh.setColorAt(index, new THREE.Color(cell.color));
      });
      mesh.receiveShadow = true;
      terrainGroup.add(mesh);
      return mesh;
    }

    function addGroundDetails() {
      const detailColors = [0x68bc5c, 0x74c965, 0x84d26a, 0x63b65a, 0x8bd66f];
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.98,
        metalness: 0,
        flatShading: true,
      });
      const mesh = new THREE.InstancedMesh(geometry, material, config.groundDetailCount);
      const matrix = new THREE.Matrix4();
      let placed = 0;
      for (let attempt = 0; attempt < 1300 && placed < config.groundDetailCount; attempt += 1) {
        const point = seededLandPoint(13100, attempt);
        if (!quietDecorSpot(point.x, point.z, 120, 44)) continue;
        const width = 10 + seededUnit(attempt + 4) * 30;
        const depth = 6 + seededUnit(attempt + 7) * 18;
        const angle = Math.round(seededUnit(attempt + 9) * 3) * Math.PI / 2;
        matrix.compose(
          new THREE.Vector3(point.x, config.landY + 1.05, point.z),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, angle, 0)),
          new THREE.Vector3(width, 0.45, depth)
        );
        mesh.setMatrixAt(placed, matrix);
        mesh.setColorAt(placed, new THREE.Color(detailColors[Math.floor(seededUnit(attempt + 12) * detailColors.length) % detailColors.length]));
        placed += 1;
      }
      mesh.count = placed;
      mesh.receiveShadow = true;
      terrainGroup.add(mesh);
      return mesh;
    }

    function addBlockTree(x, z, scale, seed) {
      const tree = new THREE.Group();
      const trunkMat = makeMaterial(THREE, 0x8a6134, 0.92);
      const leafColors = [0x276b45, 0x2f7d4b, 0x3f8f4c, 0x1f5a48];
      const leafMat = makeMaterial(THREE, leafColors[Math.floor(seededUnit(seed) * leafColors.length) % leafColors.length], 0.95);
      addBox(THREE, tree, [10 * scale, 28 * scale, 10 * scale], [0, 14 * scale, 0], trunkMat);
      addBox(THREE, tree, [34 * scale, 22 * scale, 34 * scale], [0, 36 * scale, 0], leafMat);
      addBox(THREE, tree, [24 * scale, 18 * scale, 24 * scale], [-12 * scale, 48 * scale, 8 * scale], leafMat);
      addBox(THREE, tree, [24 * scale, 18 * scale, 24 * scale], [13 * scale, 49 * scale, -7 * scale], leafMat);
      addBox(THREE, tree, [20 * scale, 16 * scale, 20 * scale], [0, 60 * scale, 0], leafMat);
      tree.position.set(x, config.landY + 2, z);
      tree.rotation.y = Math.round(seededUnit(seed + 4) * 3) * Math.PI / 2;
      terrainGroup.add(tree);
      return tree;
    }

    function addFlowerPatch(x, z, scale, seed) {
      const patch = new THREE.Group();
      const stemMat = makeMaterial(THREE, 0x4f9a45, 0.9);
      const blossomColors = [0xffd0da, 0xfff1a6, 0xf58c94, 0xffffff];
      const count = 3 + Math.floor(seededUnit(seed + 1) * 3);
      for (let i = 0; i < count; i += 1) {
        const angle = i * 2.18 + seededUnit(seed + i) * 0.9;
        const dist = (8 + seededUnit(seed + i * 3) * 22) * scale;
        const fx = Math.cos(angle) * dist;
        const fz = Math.sin(angle) * dist;
        const flowerColor = blossomColors[Math.floor(seededUnit(seed + i * 9) * blossomColors.length) % blossomColors.length];
        addBox(THREE, patch, [3 * scale, 8 * scale, 3 * scale], [fx, 4 * scale, fz], stemMat);
        addBox(THREE, patch, [8 * scale, 4 * scale, 8 * scale], [fx, 10 * scale, fz], makeMaterial(THREE, flowerColor, 0.82));
      }
      patch.position.set(x, config.landY + 2.5, z);
      terrainGroup.add(patch);
      return patch;
    }

    function addGrassTuft(x, z, scale, seed) {
      const tuft = new THREE.Group();
      const grassColors = [0x397d43, 0x4b9b4d, 0x6aae4e, 0x2f7042];
      const count = 5 + Math.floor(seededUnit(seed + 1) * 5);
      for (let i = 0; i < count; i += 1) {
        const angle = i * 2.28 + seededUnit(seed + i * 3) * 0.8;
        const dist = (3 + seededUnit(seed + i * 5) * 14) * scale;
        const height = (10 + seededUnit(seed + i * 7) * 12) * scale;
        const width = (2.4 + seededUnit(seed + i * 11) * 1.8) * scale;
        const gx = Math.cos(angle) * dist;
        const gz = Math.sin(angle) * dist;
        const blade = addBox(
          THREE,
          tuft,
          [width, height, width],
          [gx, height / 2, gz],
          makeMaterial(THREE, grassColors[Math.floor(seededUnit(seed + i * 13) * grassColors.length) % grassColors.length], 0.94)
        );
        blade.rotation.y = angle;
        blade.rotation.z = (seededUnit(seed + i * 17) - 0.5) * 0.28;
      }
      tuft.position.set(x, config.landY + 2.4, z);
      tuft.rotation.y = Math.round(seededUnit(seed + 21) * 3) * Math.PI / 2;
      terrainGroup.add(tuft);
      return tuft;
    }

    function addPixelNature() {
      addGroundDetails();

      PIXEL_NATURE_ANCHORS.forEach((anchor, index) => {
        const point = project(anchor.lon, anchor.lat);
        if (!isLand(point.x, point.z)) return;
        if (decorNearCity(point.x, point.z, 130) || decorNearRoad(point.x, point.z, 36)) return;
        if (anchor.type === "tree") {
          addBlockTree(point.x, point.z, 0.74 + seededUnit(index + 511) * 0.2, index + 401);
        } else if (anchor.type === "grass") {
          addGrassTuft(point.x, point.z, 0.78 + seededUnit(index + 711) * 0.16, index + 601);
        } else {
          addFlowerPatch(point.x, point.z, 0.72 + seededUnit(index + 611) * 0.18, index + 501);
        }
      });

      let treeCount = 0;
      for (let attempt = 0; attempt < 420 && treeCount < config.treeCount; attempt += 1) {
        const point = seededLandPoint(2700, attempt);
        if (!quietDecorSpot(point.x, point.z)) continue;
        addBlockTree(point.x, point.z, 0.72 + seededUnit(attempt + 15) * 0.28, attempt + 81);
        treeCount += 1;
      }

      let tuftCount = 0;
      for (let attempt = 0; attempt < 780 && tuftCount < config.grassTuftCount; attempt += 1) {
        const point = seededLandPoint(17100, attempt);
        if (!quietDecorSpot(point.x, point.z, 150, 50)) continue;
        addGrassTuft(point.x, point.z, 0.72 + seededUnit(attempt + 43) * 0.24, attempt + 331);
        tuftCount += 1;
      }

      let flowerCount = 0;
      for (let attempt = 0; attempt < 520 && flowerCount < config.flowerPatchCount; attempt += 1) {
        const point = seededLandPoint(9200, attempt);
        if (!quietDecorSpot(point.x, point.z, 170, 58)) continue;
        addFlowerPatch(point.x, point.z, 0.72 + seededUnit(attempt + 31) * 0.22, attempt + 211);
        flowerCount += 1;
      }
    }

    makeLandMesh(
      THREE,
      coastGroup,
      shapeFromLonLat(THREE, project, MAINLAND_LL),
      config.colors.land,
      config.colors.landEdge,
      grassTexture,
      config
    );

    islands.forEach((island) => {
      makeLandMesh(
        THREE,
        coastGroup,
        islandShape(THREE, project, island),
        config.colors.landIsland,
        config.colors.landEdge,
        grassTexture,
        config
      );
    });

    const grassSurface = addPixelGrassSurface();
    addPixelNature();

    return {
      root,
      groups: { coastGroup, terrainGroup },
      meshes: { sea, grassSurface },
      project,
      lonLatFromWorld,
      isLand,
      addBlockTree,
      addFlowerPatch,
      addGrassTuft,
      data: {
        MAINLAND_LL,
        ISLANDS,
        DEFAULT_CITY_POINTS,
        DEFAULT_ROADS,
        PIXEL_NATURE_ANCHORS,
      },
    };
  }

  const api = {
    createKoreaTerrain,
    MAINLAND_LL,
    ISLANDS,
    DEFAULT_CITY_POINTS,
    DEFAULT_ROADS,
    PIXEL_NATURE_ANCHORS,
  };

  global.KoreaTerrainKit = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
