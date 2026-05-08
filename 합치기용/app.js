const storageKey = "travel-diary-club.entries";
const feedStorageKey = "travel-diary-club.feed";
const currentDiaryLocationKey = "korea-worldmap.current-diary-location";

const form = document.querySelector("#diaryForm");
const titleInput = document.querySelector("#diaryTitle");
const placeInput = document.querySelector("#diaryPlace");
const dateInput = document.querySelector("#diaryDate");
const memoInput = document.querySelector("#diaryMemo");
const photoInput = document.querySelector("#diaryPhoto");
const moodInput = document.querySelector("#diaryMood");
const toneInput = document.querySelector("#diaryTone");
const textureInput = document.querySelector("#diaryTexture");
const stickerInput = document.querySelector("#diarySticker");
const frameInput = document.querySelector("#diaryFrame");
const resetFormButton = document.querySelector("#resetForm");
const previewCanvas = document.querySelector("#previewCanvas");
const diaryBoard = document.querySelector("#diaryBoard");
const calendarWrap = document.querySelector("#calendarWrap");
const diaryCalendar = document.querySelector("#diaryCalendar");
const calendarTitle = document.querySelector("#calendarTitle");
const prevMonth = document.querySelector("#prevMonth");
const nextMonth = document.querySelector("#nextMonth");
const feedList = document.querySelector("#feedList");
const statusMessage = document.querySelector("#statusMessage");

let currentView = "cards";
let calendarCursor = new Date();
let draftPhoto = "";

const pixelIcons = {
  cloud: ["0000000000", "0001100000", "0011110010", "0111111110", "1111111111", "0111111110", "0000000000"],
  home: ["0001100000", "0011110000", "0111111000", "1111111100", "0010010000", "0011110000", "0010010000"],
  camera: ["0000000000", "0011111000", "0111111100", "1101100110", "1110011110", "0111111100", "0000000000"],
  bolt: ["0001110000", "0011100000", "0111110000", "0001111000", "0011110000", "0111000000", "0100000000"],
  swirl: ["0011110000", "0110011000", "1101111100", "1101101100", "0110001100", "0011111000", "0000000000"],
  waves: ["1010101010", "0101010101", "0000000000", "1010101010", "0101010101", "0000000000", "1010101010"],
  music: ["0000111000", "0000101000", "0000101000", "0000101000", "0111101000", "1111000000", "0110000000"],
  tennis: ["0011110000", "0110011000", "1101101100", "1110011100", "0110011000", "0011110000", "0000100000"],
  soccer: ["0011110000", "0101101000", "1011110100", "1110011100", "1011110100", "0101101000", "0011110000"],
  shoe: ["0000000000", "0000011000", "0000111000", "0011111100", "1111111110", "1111111110", "0000000000"],
  flag: ["0011111000", "0010101000", "0011111000", "0010000000", "0010000000", "0010000000", "1111100000"],
  bus: ["0011111100", "0111111110", "1101101011", "1111111111", "0110110110", "0100000010", "0000000000"],
  train: ["0011111000", "0111111100", "1101100110", "1111111110", "0111111100", "0100000100", "1110001110"],
  car: ["0000000000", "0011110000", "0111111000", "1111111100", "1101101100", "0110011000", "0000000000"],
  shop: ["1111111110", "1010101010", "1111111110", "0111111000", "0101101000", "0101101000", "0111111000"],
  parking: ["0111111000", "1100001100", "1101101100", "1101101100", "1101111000", "1100000000", "1100000000"],
  food: ["1001001000", "1001001000", "1111001000", "0010001000", "0010001000", "0010001000", "0010001000"],
  cup: ["0111110000", "0100011000", "0100011000", "0111110000", "0011100000", "1111111000", "0000000000"],
  martini: ["1111111000", "0111110000", "0011100000", "0001000000", "0001000000", "0011100000", "0111110000"],
  burger: ["0011110000", "0111111000", "1111111100", "1000000100", "1111111100", "0111111000", "0000000000"],
  phone: ["0011110000", "0110011000", "0110011000", "0110011000", "0110011000", "0111111000", "0011110000"],
  tv: ["0111111100", "1100000110", "1101110110", "1100000110", "0111111100", "0010010000", "0111111000"],
  gift: ["0010010000", "0111111000", "1111111100", "1011110100", "1111111100", "1011110100", "1111111100"],
  heart: ["0110011000", "1111111100", "1111111100", "0111111000", "0011110000", "0001100000", "0000000000"],
  brokenHeart: ["0110011000", "1111111100", "1111011100", "0110111000", "0011010000", "0001100000", "0000000000"],
  smile: ["0000000000", "0100001000", "0000000000", "1000000100", "0100001000", "0011110000", "0000000000"],
  fire: ["0001000000", "0011000000", "0011100000", "0110110000", "1111111000", "1111111000", "0111110000"],
  sleep: ["1111100000", "0001000000", "0010000000", "0100000000", "1111100000", "0000000000", "1111110000"],
  alert: ["0001100000", "0001100000", "0001100000", "0001100000", "0000000000", "0001100000", "0001100000"],
  moon: ["0011110000", "0111000000", "1110000000", "1110000000", "0111000000", "0011110000", "0000000000"],
  sun: ["1001001000", "0011100000", "0111110000", "1111111000", "0111110000", "0011100000", "1001001000"],
  star: ["0001000000", "0101010000", "0011100000", "1111111000", "0011100000", "0101010000", "0001000000"],
  plane: ["0001000000", "0001100000", "1111111000", "0111110000", "0011100000", "0110110000", "0100010000"],
  building: ["0111110000", "0101010000", "0111110000", "0101010000", "0111110000", "0101010000", "0111110000"],
  hospital: ["0111111000", "0100010000", "0101010000", "0111110000", "0101010000", "0100010000", "0111111000"],
  game: ["0111111000", "1100001100", "1101101100", "1110011100", "1101101100", "0111111000", "0000000000"],
  headphone: ["0011110000", "0110011000", "1100001100", "1100001100", "1101101100", "0101101000", "0000000000"],
  duck: ["0001110000", "0011111000", "0011011100", "0111111000", "1111110000", "0111100000", "0000000000"],
  tower: ["0001100000", "0011110000", "0001100000", "0011110000", "0111111000", "0001100000", "0011110000"],
  ticket: ["1111111100", "1000000100", "1011110100", "1010010100", "1011110100", "1000000100", "1111111100"],
  mail: ["1111111100", "1000000100", "1100001100", "1010010100", "1001100100", "1000000100", "1111111100"],
  clock: ["0011110000", "0110011000", "1100101100", "1100111100", "1100001100", "0110011000", "0011110000"],
  one: ["0001100000", "0011100000", "0001100000", "0001100000", "0001100000", "0111111000", "0000000000"],
  two: ["0111110000", "1100011000", "0000110000", "0001100000", "0011000000", "1111111000", "0000000000"],
  three: ["0111110000", "1100011000", "0001110000", "0000011000", "1100011000", "0111110000", "0000000000"],
  four: ["0001110000", "0011110000", "0110110000", "1111111000", "0000110000", "0000110000", "0000000000"],
  five: ["1111111000", "1100000000", "1111110000", "0000011000", "1100011000", "0111110000", "0000000000"],
  cursor: ["1000000000", "1100000000", "1110000000", "1111000000", "1111100000", "1100000000", "1000000000"],
};

const pixelPalette = ["#204c9a", "#e4482f", "#f09a19", "#6bb852", "#111111"];

function boot() {
  dateInput.valueAsDate = new Date();
  renderPixelIcons();
  bindEvents();
  renderAll();
}

function renderPixelIcons() {
  document.querySelectorAll(".pixel-icon").forEach((icon, iconIndex) => {
    const pattern = pixelIcons[icon.dataset.icon] || pixelIcons.star;
    const color = pixelPalette[iconIndex % pixelPalette.length];
    icon.innerHTML = pattern
      .flatMap((row) =>
        [...row].map((cell) => `<i style="${cell === "1" ? `background:${color}` : ""}"></i>`),
      )
      .join("");
  });
}

function bindEvents() {
  form.addEventListener("submit", saveDiary);
  resetFormButton.addEventListener("click", resetComposer);

  [titleInput, placeInput, dateInput, memoInput, moodInput, toneInput, textureInput, stickerInput, frameInput].forEach(
    (control) => {
      control.addEventListener("input", renderPreview);
      control.addEventListener("change", renderPreview);
    },
  );

  photoInput.addEventListener("change", async () => {
    draftPhoto = await readPhoto(photoInput.files[0]);
    renderPreview();
  });

  document.querySelectorAll(".view-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      currentView = button.dataset.view;
      document.querySelectorAll(".view-toggle").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      renderArchive();
    });
  });

  prevMonth.addEventListener("click", () => {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1);
    renderCalendar(getEntries());
  });

  nextMonth.addEventListener("click", () => {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1);
    renderCalendar(getEntries());
  });

  diaryBoard.addEventListener("click", handleDiaryAction);
  feedList.addEventListener("click", handleFeedAction);
}

function renderAll() {
  renderPreview();
  renderArchive();
  renderFeed();
}

function getEntries() {
  return JSON.parse(localStorage.getItem(storageKey) || "[]").map(normalizeEntry);
}

function saveEntries(entries) {
  localStorage.setItem(storageKey, JSON.stringify(entries));
}

function getFeed() {
  return JSON.parse(localStorage.getItem(feedStorageKey) || "[]").map(normalizeEntry);
}

function saveFeed(posts) {
  localStorage.setItem(feedStorageKey, JSON.stringify(posts));
}

function getDraftEntry() {
  return normalizeEntry({
    id: "preview",
    title: titleInput.value.trim() || "LOCAL TRIP",
    place: placeInput.value.trim() || "아직 장소를 정하지 않았어요",
    dateISO: dateInput.value || toISODate(new Date()),
    mood: moodInput.value,
    tone: toneInput.value,
    texture: textureInput.value,
    sticker: stickerInput.value,
    frame: frameInput.value,
    memo: memoInput.value.trim() || "여행 중 좋았던 장면, 먹었던 것, 다시 가고 싶은 이유를 적어보세요.",
    photo: draftPhoto,
    author: "나의 여행지도",
  });
}

function normalizeEntry(entry) {
  return {
    id: entry.id || createId(),
    title: entry.title || "제목 없는 여행",
    place: entry.place || "장소 미정",
    dateISO: entry.dateISO || toISODate(new Date()),
    mood: entry.mood || "느긋함",
    tone: entry.tone || "sage",
    texture: entry.texture || "grid",
    sticker: entry.sticker || "flower",
    frame: entry.frame || "polaroid",
    memo: entry.memo || "",
    photo: entry.photo || "",
    likes: entry.likes || 0,
    comments: entry.comments || [],
    author: entry.author || "나의 여행지도",
    cityKey: entry.cityKey || "",
    lng: Number.isFinite(Number(entry.lng)) ? Number(entry.lng) : null,
    lat: Number.isFinite(Number(entry.lat)) ? Number(entry.lat) : null,
    mapLabel: entry.mapLabel || "",
    createdAt: entry.createdAt || new Date().toISOString(),
    worldMapMarker: entry.worldMapMarker === true,
  };
}

function getCurrentDiaryLocation() {
  try {
    const location = JSON.parse(localStorage.getItem(currentDiaryLocationKey) || "null");
    return location && typeof location === "object" ? location : {};
  } catch {
    return {};
  }
}

function createId() {
  return window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function renderPreview() {
  previewCanvas.innerHTML = renderDiarySpread(getDraftEntry(), {
    preview: true,
    actions: false,
  });
}

async function saveDiary(event) {
  event.preventDefault();
  const location = getCurrentDiaryLocation();
  const entry = {
    ...getDraftEntry(),
    id: createId(),
    cityKey: location.cityKey || "",
    lng: Number.isFinite(Number(location.lng)) ? Number(location.lng) : null,
    lat: Number.isFinite(Number(location.lat)) ? Number(location.lat) : null,
    mapLabel: location.label || "",
    createdAt: new Date().toISOString(),
    worldMapMarker: true,
  };
  const entries = getEntries();
  entries.unshift(entry);
  saveEntries(entries);
  calendarCursor = new Date(`${entry.dateISO}T00:00:00`);
  setStatus("다이어리를 저장했어요.");
  resetComposer({ keepStatus: true });
  renderAll();
}

function resetComposer(options = {}) {
  form.reset();
  dateInput.valueAsDate = new Date();
  draftPhoto = "";
  photoInput.value = "";
  renderPreview();
  if (!options.keepStatus) setStatus("입력값을 초기화했어요.");
}

function renderArchive() {
  const entries = getEntries();
  diaryBoard.hidden = currentView !== "cards";
  calendarWrap.hidden = currentView !== "calendar";

  if (currentView === "calendar") {
    renderCalendar(entries);
    return;
  }

  if (entries.length === 0) {
    diaryBoard.innerHTML = `
      <article class="empty-panel">
        <strong>아직 저장된 다이어리가 없어요</strong>
        <span>오른쪽 미리보기를 보면서 첫 여행 기록을 만들어보세요.</span>
      </article>
    `;
    return;
  }

  diaryBoard.innerHTML = entries
    .map((entry, index) =>
      renderDiarySpread(entry, {
        index,
        actions: true,
      }),
    )
    .join("");
}

function renderDiarySpread(entry, options = {}) {
  const title = escapeHtml(entry.title);
  const place = escapeHtml(entry.place);
  const memo = escapeHtml(entry.memo);
  const mood = escapeHtml(entry.mood);
  const actionButtons = options.actions
    ? `
      <div class="diary-actions">
        <button type="button" data-action="share" data-index="${options.index}">공유</button>
        <button type="button" data-action="publish" data-index="${options.index}">피드</button>
        <button type="button" data-action="edit" data-index="${options.index}">편집</button>
        <button type="button" data-action="delete" data-index="${options.index}">삭제</button>
      </div>
    `
    : "";

  return `
    <article class="diary-spread diary-spread--${entry.tone} diary-texture--${entry.texture}">
      ${actionButtons}
      <section class="diary-page diary-page--left">
        <p class="hand-label">${options.preview ? "PREVIEW" : "DAY NOTE"}</p>
        <h3>${title}</h3>
        <small>${place} · ${formatFullDate(entry.dateISO)}</small>
        <p class="diary-line">${memo}</p>
        <div class="photo-frame photo-frame--${entry.frame}">
          ${
            entry.photo
              ? `<img src="${entry.photo}" alt="${title} 사진" />`
              : `<div class="sample-photo">photo</div>`
          }
          <span>${mood}</span>
        </div>
      </section>
      <section class="diary-page diary-page--right">
        <div class="boarding-pass">
          <span>TRAVEL MEMORY</span>
          <strong>${place}</strong>
          <small>${formatFullDate(entry.dateISO)}</small>
        </div>
        <div class="ticket-memo">
          <b>${mood}</b>
          <p>${memo}</p>
        </div>
        <p class="hand-note">기록은 저장하고 피드에 올려 친구들과 나눌 수 있어요.</p>
      </section>
    </article>
  `;
}

function handleDiaryAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const index = Number(button.dataset.index);
  const entries = getEntries();
  const entry = entries[index];

  if (button.dataset.action === "delete") {
    entries.splice(index, 1);
    saveEntries(entries);
    renderArchive();
    setStatus("다이어리를 삭제했어요.");
    return;
  }

  if (button.dataset.action === "publish") {
    publishEntry(entry);
    return;
  }

  if (button.dataset.action === "share") {
    shareEntry(entry);
    return;
  }

  if (button.dataset.action === "edit") {
    loadEntryIntoComposer(entry);
  }
}

function loadEntryIntoComposer(entry) {
  titleInput.value = entry.title;
  placeInput.value = entry.place;
  dateInput.value = entry.dateISO;
  memoInput.value = entry.memo;
  moodInput.value = entry.mood;
  toneInput.value = entry.tone;
  textureInput.value = entry.texture;
  stickerInput.value = entry.sticker;
  frameInput.value = entry.frame;
  draftPhoto = entry.photo;
  renderPreview();
  setStatus("기록을 편집창으로 불러왔어요. 수정 후 새 다이어리로 저장할 수 있어요.");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function shareEntry(entry) {
  try {
    setStatus("다이어리 이미지를 생성 중입니다...");

    // html2canvas 라이브러리 확인
    if (typeof html2canvas === "undefined") {
      setStatus("이미지 라이브러리를 로드할 수 없습니다. 페이지를 새로고침해주세요.");
      console.error("html2canvas not loaded");
      return;
    }

    // 항상 새로운 컨테이너에 렌더링 (외부 CSS 영향 제거)
    const container = document.createElement("div");
    container.style.cssText = "position: fixed; left: -9999px; top: -9999px; width: 800px; z-index: -9999;";

    // 기본 HTML 구조만 생성
    const htmlContent = renderDiarySpread(entry, { actions: false });

    // HTML 정리: 복잡한 클래스 제거
    const cleanedHTML = htmlContent
      .replace(/diary-spread--\w+/g, "")
      .replace(/diary-texture--\w+/g, "")
      .replace(/photo-frame--\w+/g, "");

    container.innerHTML = cleanedHTML;

    // 모든 외부 스타일 시트 제거
    const allStyleSheets = document.styleSheets;
    const disabledSheets = [];
    for (let i = 0; i < allStyleSheets.length; i++) {
      try {
        if (allStyleSheets[i].href && allStyleSheets[i].href.includes("styles.css")) {
          allStyleSheets[i].disabled = true;
          disabledSheets.push(i);
        }
      } catch (e) {
        // CORS 제약이 있을 수 있음
      }
    }

    // 기본 스타일만 적용
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      * { margin: 0; padding: 0; box-sizing: border-box; }

      .diary-spread {
        background: white;
        color: #333;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        padding: 40px;
        max-width: 100%;
      }

      .diary-page { margin-bottom: 20px; }
      .diary-page h3 { font-size: 24px; margin: 0 0 8px 0; color: #333; }
      .diary-page small { display: block; font-size: 12px; color: #666; margin-bottom: 12px; }
      .diary-page p { font-size: 14px; line-height: 1.6; color: #333; margin: 0 0 16px 0; }

      .photo-frame {
        width: 100%;
        height: 300px;
        background: #f0f0f0;
        margin: 16px 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: #999;
        border: 1px solid #ddd;
      }

      .photo-frame img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .photo-frame span {
        position: absolute;
        bottom: 8px;
        right: 8px;
        font-size: 11px;
        color: #666;
        background: rgba(255,255,255,0.9);
        padding: 2px 6px;
      }

      .sample-photo { width: 100%; height: 100%; }
      .diary-actions { display: none; }
      .hand-label { font-size: 11px; color: #999; margin-bottom: 8px; }
    `;
    container.appendChild(styleElement);

    document.body.appendChild(container);
    const diaryElement = container.querySelector(".diary-spread");

    // CSS 파싱 완료 대기
    await new Promise(resolve => setTimeout(resolve, 300));

    // html2canvas 실행
    try {
      const canvas = await html2canvas(diaryElement, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        foreignObjectRendering: false,
      });

      // 스타일시트 복구
      for (const index of disabledSheets) {
        try {
          document.styleSheets[index].disabled = false;
        } catch (e) {}
      }

      document.body.removeChild(container);
      await convertCanvasToImage(canvas, entry);
    } catch (error) {
      console.error("html2canvas error:", error);

      // 스타일시트 복구
      for (const index of disabledSheets) {
        try {
          document.styleSheets[index].disabled = false;
        } catch (e) {}
      }

      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }

      setStatus("이미지 생성에 실패했어요. 다시 시도해주세요.");
    }
  } catch (error) {
    console.error("Error in shareEntry:", error);
    setStatus("다이어리 이미지 생성에 실패했어요.");
  }
}

async function convertCanvasToImage(canvas, entry) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setStatus("이미지 변환에 실패했어요.");
          reject(new Error("Blob creation failed"));
          return;
        }

        const fileName = `${entry.title.replace(/[^\w\s]/g, "").replace(/\s+/g, "_")}_${entry.dateISO}.jpg`;

        try {
          // Web Share API로 공유 시도
          if (navigator.share) {
            const file = new File([blob], fileName, { type: "image/jpeg" });

            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: entry.title,
                text: getShareText(entry),
                files: [file],
              });
              setStatus("다이어리 이미지를 공유했어요!");
              resolve();
              return;
            }
          }

          // Web Share API 미지원 또는 실패 시 다운로드
          downloadDiaryImage(blob, fileName);
          setStatus("다이어리 이미지가 다운로드되었어요. 원하는 곳에 공유하세요!");
          resolve();
        } catch (error) {
          console.error("Share error:", error);
          if (error.name !== "AbortError") {
            downloadDiaryImage(blob, fileName);
            setStatus("다이어리 이미지가 다운로드되었어요. 원하는 곳에 공유하세요!");
            resolve();
          } else {
            setStatus("공유가 취소되었어요.");
            reject(error);
          }
        }
      },
      "image/jpeg",
      0.92
    );
  });
}

function downloadDiaryImage(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function publishEntry(entry) {
  const posts = getFeed();
  posts.unshift({
    ...entry,
    id: createId(),
    likes: 0,
    comments: [],
    publishedAt: new Date().toISOString(),
  });
  saveFeed(posts);
  renderFeed();
  setStatus("다이어리를 피드에 올렸어요.");
}

function renderFeed() {
  const posts = getFeed();
  if (posts.length === 0) {
    feedList.innerHTML = `
      <article class="empty-panel">
        <strong>아직 공유된 다이어리가 없어요</strong>
        <span>내 다이어리에서 피드 버튼을 눌러 첫 게시물을 올려보세요.</span>
      </article>
    `;
    return;
  }

  feedList.innerHTML = posts
    .map((post, index) => {
      const title = escapeHtml(post.title);
      const comments = post.comments || [];
      return `
        <article class="feed-card feed-card--${post.tone} diary-texture--${post.texture}">
          <header>
            <div>
              <strong>${escapeHtml(post.author)}</strong>
              <span>${escapeHtml(post.place)} · ${formatFullDate(post.dateISO)}</span>
            </div>
            <button type="button" data-feed-action="delete" data-index="${index}">삭제</button>
          </header>
          ${
            post.photo
              ? `<img src="${post.photo}" alt="${title} 사진" />`
              : `<div class="feed-photo-placeholder">${escapeHtml(post.mood)}</div>`
          }
          <h4>${title}</h4>
          <p>${escapeHtml(post.memo)}</p>
          <div class="feed-actions">
            <button type="button" data-feed-action="like" data-index="${index}">좋아요 ${post.likes || 0}</button>
            <button type="button" data-feed-action="share" data-index="${index}">다이어리 공유</button>
          </div>
          <form class="comment-form" data-index="${index}">
            <input type="text" placeholder="댓글을 남겨보세요" aria-label="${title} 댓글" />
            <button type="submit">등록</button>
          </form>
          <div class="comments">
            ${comments.map((comment) => `<span>${escapeHtml(comment)}</span>`).join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function handleFeedAction(event) {
  const commentForm = event.target.closest(".comment-form");
  if (commentForm && event.type === "submit") return;

  const actionButton = event.target.closest("[data-feed-action]");
  if (!actionButton) return;

  const posts = getFeed();
  const index = Number(actionButton.dataset.index);
  const action = actionButton.dataset.feedAction;

  if (action === "like") {
    posts[index].likes = (posts[index].likes || 0) + 1;
    saveFeed(posts);
    renderFeed();
    return;
  }

  if (action === "delete") {
    posts.splice(index, 1);
    saveFeed(posts);
    renderFeed();
    setStatus("피드 게시물을 삭제했어요.");
    return;
  }

  if (action === "share") {
    shareEntry(posts[index]);
    return;
  }
}

feedList.addEventListener("submit", (event) => {
  const formElement = event.target.closest(".comment-form");
  if (!formElement) return;

  event.preventDefault();
  const input = formElement.querySelector("input");
  const value = input.value.trim();
  if (!value) return;

  const posts = getFeed();
  const index = Number(formElement.dataset.index);
  posts[index].comments = [...(posts[index].comments || []), value];
  saveFeed(posts);
  renderFeed();
});

function renderCalendar(entries) {
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

  calendarTitle.textContent = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
  }).format(calendarCursor);

  diaryCalendar.innerHTML = `
    <div class="calendar-grid">
      ${weekdays.map((day) => `<div class="calendar-weekday">${day}</div>`).join("")}
      ${Array.from({ length: totalCells }, (_, cellIndex) => {
        const dayNumber = cellIndex - startOffset + 1;
        const inMonth = dayNumber >= 1 && dayNumber <= lastDay.getDate();
        const dateISO = inMonth ? toISODate(new Date(year, month, dayNumber)) : "";
        const dayEntries = entries.filter((entry) => entry.dateISO === dateISO);

        return `
          <article class="calendar-cell ${inMonth ? "" : "is-muted"}">
            ${inMonth ? `<strong>${dayNumber}</strong>` : ""}
            ${dayEntries
              .map((entry) => `<span class="calendar-entry calendar-entry--${entry.tone}">${escapeHtml(entry.title)}</span>`)
              .join("")}
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function getShareText(entry) {
  return [
    entry.title,
    `${entry.place} · ${formatFullDate(entry.dateISO)} · ${entry.mood}`,
    entry.memo || "여행의 작은 장면을 기록했어요.",
    "여행 다이어리 클럽에서 만든 기록",
  ].join("\n");
}

function setStatus(message) {
  statusMessage.textContent = message;
}

function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character],
  );
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatFullDate(dateValue) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${dateValue}T00:00:00`));
}

function readPhoto(file) {
  if (!file) return Promise.resolve("");
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

boot();
