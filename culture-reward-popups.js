/*
  CultureRewardPopups
  - 서울, 대전, 광주, 부산, 제주 미니게임 클리어 보상 팝업.
  - 첫 팝업: "지역 의상 획득!" + 인벤토리 이미지 표시.
  - 첫 팝업 X 클릭 시 두 번째 팝업: "축제를 실제로 즐기는 법!"
  - 제주만 두 번째 팝업에 festival/제주도.jpg 이미지 표시.
  - 인벤토리 추가는 onInventoryAdd(reward) 콜백으로 연결 가능.

  사용 예시:
    <script src="./culture-reward-popups.js"></script>
    <script>
      const rewardPopups = CultureRewardPopups.init({
        onInventoryAdd(reward) {
          // 기존 인벤토리 시스템에 reward 넣기
        }
      });

      // 미니게임 성공 시
      rewardPopups.showReward("Jeju");
    </script>

  이벤트 방식:
    document.dispatchEvent(new CustomEvent("culture:minigame-clear", {
      detail: { regionKey: "Jeju" }
    }));
*/
(function (global) {
  "use strict";

  const STYLE_ID = "culture-reward-popups-style";
  const COMPLETE_EVENT = "culture:minigame-clear";
  const INVENTORY_EVENT = "culture:inventory-add";

  const DEFAULT_REGIONS = {
    Seoul: {
      label: "서울",
      itemName: "서울 의상",
      costumeImage: "items/서울_인벤토리.png",
    },
    Daejeon: {
      label: "대전",
      itemName: "대전 의상",
      costumeImage: "items/대전_인벤토리.png",
    },
    Gwangju: {
      label: "광주",
      itemName: "광주 의상",
      costumeImage: "items/광주_인벤토리.png",
    },
    Busan: {
      label: "부산",
      itemName: "부산 의상",
      costumeImage: "items/부산_인벤토리.png",
    },
    Jeju: {
      label: "제주",
      itemName: "제주 의상",
      costumeImage: "items/제주도_인벤토리.png",
      festivalImage: "festival/제주도.jpg",
      festivalAlt: "제주 축제 이미지",
    },
  };

  const REGION_ALIASES = {
    서울: "Seoul",
    Seoul: "Seoul",
    seoul: "Seoul",
    대전: "Daejeon",
    Daejeon: "Daejeon",
    daejeon: "Daejeon",
    광주: "Gwangju",
    Gwangju: "Gwangju",
    gwangju: "Gwangju",
    부산: "Busan",
    Busan: "Busan",
    busan: "Busan",
    제주: "Jeju",
    제주도: "Jeju",
    Jeju: "Jeju",
    jeju: "Jeju",
  };

  const CSS = `
    .crp-modal {
      position: fixed;
      inset: 0;
      z-index: 99990;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 18px;
      background: rgba(10, 18, 24, 0.62);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .crp-modal.is-open {
      display: flex;
    }

    .crp-panel {
      position: relative;
      width: min(980px, calc(100vw - 24px));
      max-height: calc(100vh - 24px);
      color: #1b241f;
      background: #f8fff5;
      border: 4px solid #111;
      box-shadow: 8px 8px 0 #111, 0 24px 70px rgba(0, 0, 0, 0.32);
      padding: 18px;
      overflow: auto;
    }

    .crp-close {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 34px;
      height: 34px;
      border: 2px solid #111;
      border-radius: 999px;
      background: #ffffff;
      color: #111;
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
    }

    .crp-close:hover {
      transform: translateY(-1px);
      box-shadow: 3px 3px 0 #111;
    }

    .crp-kicker {
      margin: 0 0 8px;
      color: #227642;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0;
    }

    .crp-title {
      margin: 0 40px 12px 0;
      font-size: 28px;
      line-height: 1.15;
      font-weight: 900;
      letter-spacing: 0;
    }

    .crp-copy {
      margin: 0 0 12px;
      color: #405247;
      font-size: 15px;
      line-height: 1.5;
      word-break: keep-all;
    }

    .crp-reward-card,
    .crp-festival-card {
      display: grid;
      gap: 14px;
      align-items: center;
      border: 2px solid rgba(17, 17, 17, 0.18);
      background: rgba(255, 255, 255, 0.7);
      padding: 14px;
    }

    .crp-reward-card {
      grid-template-columns: 96px 1fr;
    }

    .crp-reward-image {
      width: 96px;
      height: 96px;
      object-fit: contain;
      image-rendering: auto;
      background: #eaf7eb;
      border: 2px solid rgba(17, 17, 17, 0.12);
    }

    .crp-reward-name {
      margin: 0 0 6px;
      font-size: 19px;
      font-weight: 900;
    }

    .crp-reward-meta {
      margin: 0;
      color: #557062;
      font-size: 14px;
      line-height: 1.4;
    }

    .crp-festival-image {
      width: 100%;
      max-height: min(78vh, 760px);
      object-fit: contain;
      border: 2px solid rgba(17, 17, 17, 0.16);
      background: #edf6f1;
    }

    .crp-button {
      width: 100%;
      margin-top: 18px;
      border: 3px solid #111;
      background: #111;
      color: #fff;
      padding: 12px 16px;
      font-size: 16px;
      font-weight: 900;
      cursor: pointer;
      box-shadow: 4px 4px 0 rgba(17, 17, 17, 0.24);
    }

    .crp-button:hover {
      transform: translateY(-1px);
    }

    @media (max-width: 420px) {
      .crp-panel {
        padding: 20px;
      }

      .crp-title {
        font-size: 24px;
      }

      .crp-reward-card {
        grid-template-columns: 80px 1fr;
      }

      .crp-reward-image {
        width: 80px;
        height: 80px;
      }
    }
  `;

  let singleton = null;

  class CultureRewardPopupsController {
    constructor(options) {
      this.options = options || {};
      this.window = this.options.window || global;
      this.document = this.options.document || this.window.document;

      if (!this.document || !this.document.body) {
        throw new Error("CultureRewardPopups.init() requires a browser document with a body.");
      }

      this.regions = mergeRegions(DEFAULT_REGIONS, this.options.regions);
      this.onInventoryAdd =
        typeof this.options.onInventoryAdd === "function" ? this.options.onInventoryAdd : null;
      this.closeRewardOpensPromo = this.options.closeRewardOpensPromo !== false;
      this.autoListen = this.options.autoListen !== false;
      this.activeReward = null;

      this.handleClearEvent = this.handleClearEvent.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);

      injectStyles(this.document);
      this.createDom();
      this.bindDom();

      if (this.autoListen) {
        this.document.addEventListener(COMPLETE_EVENT, this.handleClearEvent);
      }
      this.document.addEventListener("keydown", this.handleKeyDown);
    }

    showReward(regionKey, detail) {
      const reward = this.createReward(regionKey, detail);
      this.activeReward = reward;
      this.addInventoryReward(reward);

      this.rewardKicker.textContent = `${reward.regionName} 미니게임 클리어`;
      this.rewardTitle.textContent = "지역 의상 획득!";
      this.rewardCopy.textContent = `${reward.item}이(가) 인벤토리에 추가되었습니다.`;
      this.rewardName.textContent = reward.item;
      this.rewardMeta.textContent = `${reward.regionName} 보상 의상`;
      this.rewardImage.src = reward.image;
      this.rewardImage.alt = `${reward.item} 인벤토리 이미지`;

      this.openModal(this.rewardModal);
      return reward;
    }

    showFestivalPromo(regionKey) {
      const key = normalizeRegionKey(regionKey || (this.activeReward && this.activeReward.regionKey));
      const region = this.regions[key];

      if (!region) {
        return null;
      }

      this.promoKicker.textContent = `${region.label} 축제 안내`;
      this.promoTitle.textContent = "축제를 실제로 즐기는 법!";
      this.promoCopy.textContent =
        region.festivalCopy ||
        `${region.label}의 문화 장소와 축제 정보를 찾아보고, 획득한 의상을 입고 지역을 탐험해 보세요.`;

      if (key === "Jeju" && region.festivalImage) {
        this.promoImage.src = region.festivalImage;
        this.promoImage.alt = region.festivalAlt || `${region.label} 축제 이미지`;
        this.promoImage.hidden = false;
      } else {
        this.promoImage.removeAttribute("src");
        this.promoImage.hidden = true;
      }

      this.openModal(this.promoModal);
      return region;
    }

    destroy() {
      if (this.autoListen) {
        this.document.removeEventListener(COMPLETE_EVENT, this.handleClearEvent);
      }
      this.document.removeEventListener("keydown", this.handleKeyDown);
      if (this.rewardModal) {
        this.rewardModal.remove();
      }
      if (this.promoModal) {
        this.promoModal.remove();
      }
      if (singleton === this) {
        singleton = null;
      }
    }

    createReward(regionKey, detail) {
      const key = normalizeRegionKey(regionKey || (detail && detail.regionKey));
      const region = this.regions[key];

      if (!region) {
        throw new Error(`Unknown culture reward region: ${regionKey}`);
      }

      return {
        regionKey: key,
        regionName: region.label,
        item: (detail && (detail.item || detail.itemName)) || region.itemName,
        kind: (detail && detail.kind) || "지역 의상",
        mark: (detail && detail.mark) || "의상",
        image: (detail && (detail.image || detail.costumeImage)) || region.costumeImage,
        mission: (detail && detail.mission) || `${region.label} 미니게임`,
        raw: detail || null,
      };
    }

    addInventoryReward(reward) {
      if (this.onInventoryAdd) {
        this.onInventoryAdd(reward);
      }

      this.dispatch(INVENTORY_EVENT, { reward });
    }

    handleClearEvent(event) {
      const detail = (event && event.detail) || {};
      const regionKey = detail.regionKey || detail.region || detail.city || detail.key;
      this.showReward(regionKey, detail);
    }

    handleKeyDown(event) {
      if (event.key !== "Escape") {
        return;
      }

      if (this.rewardModal.classList.contains("is-open")) {
        this.closeReward();
      } else if (this.promoModal.classList.contains("is-open")) {
        this.closeModal(this.promoModal);
      }
    }

    createDom() {
      this.rewardModal = this.createElement("div", "crp-modal");
      this.rewardModal.setAttribute("role", "dialog");
      this.rewardModal.setAttribute("aria-modal", "true");

      const rewardPanel = this.createElement("section", "crp-panel");
      const rewardClose = this.createCloseButton("보상 팝업 닫기");
      this.rewardKicker = this.createElement("p", "crp-kicker");
      this.rewardTitle = this.createElement("h2", "crp-title");
      this.rewardCopy = this.createElement("p", "crp-copy");
      const rewardCard = this.createElement("div", "crp-reward-card");
      this.rewardImage = this.createElement("img", "crp-reward-image");
      const rewardText = this.createElement("div");
      this.rewardName = this.createElement("p", "crp-reward-name");
      this.rewardMeta = this.createElement("p", "crp-reward-meta");

      rewardText.append(this.rewardName, this.rewardMeta);
      rewardCard.append(this.rewardImage, rewardText);
      rewardPanel.append(rewardClose, this.rewardKicker, this.rewardTitle, this.rewardCopy, rewardCard);
      this.rewardModal.append(rewardPanel);

      this.promoModal = this.createElement("div", "crp-modal");
      this.promoModal.setAttribute("role", "dialog");
      this.promoModal.setAttribute("aria-modal", "true");

      const promoPanel = this.createElement("section", "crp-panel");
      const promoClose = this.createCloseButton("축제 안내 닫기");
      this.promoKicker = this.createElement("p", "crp-kicker");
      this.promoTitle = this.createElement("h2", "crp-title");
      this.promoCopy = this.createElement("p", "crp-copy");
      const promoCard = this.createElement("div", "crp-festival-card");
      this.promoImage = this.createElement("img", "crp-festival-image");
      this.promoImage.hidden = true;
      const promoButton = this.createElement("button", "crp-button");
      promoButton.type = "button";
      promoButton.textContent = "확인";

      promoCard.append(this.promoImage);
      promoPanel.append(promoClose, this.promoKicker, this.promoTitle, this.promoCopy, promoCard, promoButton);
      this.promoModal.append(promoPanel);

      this.document.body.append(this.rewardModal, this.promoModal);

      this.rewardClose = rewardClose;
      this.promoClose = promoClose;
      this.promoButton = promoButton;
    }

    bindDom() {
      this.rewardClose.addEventListener("click", () => this.closeReward());
      this.promoClose.addEventListener("click", () => this.closeModal(this.promoModal));
      this.promoButton.addEventListener("click", () => this.closeModal(this.promoModal));
      this.rewardModal.addEventListener("click", (event) => {
        if (event.target === this.rewardModal) {
          this.closeReward();
        }
      });
      this.promoModal.addEventListener("click", (event) => {
        if (event.target === this.promoModal) {
          this.closeModal(this.promoModal);
        }
      });
    }

    closeReward() {
      this.closeModal(this.rewardModal);
      this.rewardImage.removeAttribute("src");

      if (this.closeRewardOpensPromo && this.activeReward) {
        this.showFestivalPromo(this.activeReward.regionKey);
      }
    }

    openModal(modal) {
      modal.classList.add("is-open");
      const closeButton = modal.querySelector(".crp-close");
      if (closeButton) {
        closeButton.focus({ preventScroll: true });
      }
    }

    closeModal(modal) {
      modal.classList.remove("is-open");
    }

    dispatch(name, detail) {
      if (typeof this.window.CustomEvent === "function") {
        this.document.dispatchEvent(new this.window.CustomEvent(name, { detail }));
        return;
      }

      const event = this.document.createEvent("CustomEvent");
      event.initCustomEvent(name, false, false, detail);
      this.document.dispatchEvent(event);
    }

    createElement(tagName, className) {
      const element = this.document.createElement(tagName);
      if (className) {
        element.className = className;
      }
      return element;
    }

    createCloseButton(label) {
      const button = this.createElement("button", "crp-close");
      button.type = "button";
      button.setAttribute("aria-label", label);
      button.textContent = "×";
      return button;
    }
  }

  function injectStyles(document) {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function mergeRegions(baseRegions, customRegions) {
    const merged = {};

    Object.keys(baseRegions).forEach((key) => {
      merged[key] = Object.assign({}, baseRegions[key]);
    });

    if (!customRegions) {
      return merged;
    }

    Object.keys(customRegions).forEach((key) => {
      const normalizedKey = normalizeRegionKey(key);
      merged[normalizedKey] = Object.assign({}, merged[normalizedKey], customRegions[key]);
    });

    return merged;
  }

  function normalizeRegionKey(regionKey) {
    const key = String(regionKey || "").trim();
    return REGION_ALIASES[key] || key;
  }

  function init(options) {
    if (singleton) {
      singleton.destroy();
    }

    singleton = new CultureRewardPopupsController(options);
    return singleton;
  }

  function showReward(regionKey, detail) {
    if (!singleton) {
      init();
    }

    return singleton.showReward(regionKey, detail);
  }

  function showFestivalPromo(regionKey) {
    if (!singleton) {
      init();
    }

    return singleton.showFestivalPromo(regionKey);
  }

  const api = {
    init,
    create: (options) => new CultureRewardPopupsController(options),
    showReward,
    showFestivalPromo,
    events: {
      complete: COMPLETE_EVENT,
      inventoryAdd: INVENTORY_EVENT,
    },
    regionKeys: Object.keys(DEFAULT_REGIONS),
    regions: DEFAULT_REGIONS,
  };

  global.CultureRewardPopups = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
