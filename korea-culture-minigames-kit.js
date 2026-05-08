(function (global) {
  "use strict";

  const GAME_DEFINITIONS = {
    Seoul: {
      type: "timing",
      region: "서울",
      title: "말뚝이 풍자 받아치기",
      material: "송파산대놀이 · 말뚝이 풍자",
      prompt: "양반탈이 허세 대사를 날릴 때 말뚝이가 튀어나오는 순간 Space를 눌러 받아치세요.",
      timingWindow: [0.58, 0.78],
      rounds: [
        {
          boast: "양반탈: 이 몸은 글 한 줄만 읊어도 모두가 고개를 숙인다!",
          retort: "말뚝이: 글보다 먼저 사람 마음을 읽어야지요!",
        },
        {
          boast: "양반탈: 내 말 한마디면 온 마당이 조용해진다!",
          retort: "말뚝이: 조용한 건 무서워서가 아니라 웃음 참는 중이지요!",
        },
        {
          boast: "양반탈: 풍자는 나 같은 양반에게 어울리지 않는다!",
          retort: "말뚝이: 그래서 제가 대신 아주 잘 받아치겠습니다!",
        },
      ],
      cards: ["송파산대놀이", "말뚝이", "양반탈 풍자"],
    },
    Daejeon: {
      type: "hold",
      region: "대전",
      title: "상모 돌리기 챌린지",
      material: "웃다리농악 · 상모 · 농악 장단",
      prompt: "Space를 누르고 떼며 상모가 너무 느려지거나 빨라지지 않게 게이지를 초록 구간에 유지하세요.",
      greenWindow: [0.42, 0.66],
      targetMs: 5200,
      cards: ["웃다리농악", "상모", "농악 장단"],
    },
    Gwangju: {
      type: "mash",
      region: "광주",
      title: "무등산 수박 깨기",
      material: "무등산 수박 · 무등산 · 광주 향토문화",
      prompt: "Space를 100번 눌러 무등산 수박을 깨세요. 금이 갈수록 게이지가 상승합니다.",
      targetPresses: 100,
      cards: ["무등산 수박", "무등산", "광주 향토문화"],
    },
    Busan: {
      type: "balance",
      region: "부산",
      title: "동래학춤 균형잡기",
      material: "동래학춤 · 수영야류 · 동래야류",
      prompt: "A/D 또는 Space로 학처럼 날개를 편 캐릭터가 넘어지지 않게 균형을 유지하세요.",
      targetMs: 6200,
      safeTilt: 0.34,
      cards: ["동래학춤", "수영야류", "동래야류"],
    },
    Gangneung: {
      type: "collect",
      region: "강릉",
      title: "단오제 준비물 줍기",
      material: "강릉단오제 · 창포 · 관노가면극",
      prompt: "방향키로 움직이며 창포, 수리취떡, 씨름, 그네, 관노가면극 준비물을 모두 모으세요.",
      boardSize: 5,
      items: [
        { name: "창포", mark: "창", x: 1, y: 0 },
        { name: "수리취떡", mark: "떡", x: 4, y: 1 },
        { name: "씨름", mark: "씨", x: 0, y: 3 },
        { name: "그네", mark: "그", x: 3, y: 4 },
        { name: "관노가면극", mark: "극", x: 2, y: 2 },
      ],
      cards: ["강릉단오제", "창포", "관노가면극"],
    },
    Jeju: {
      type: "fishing",
      region: "제주",
      title: "화북포구 고망낚시 대작전",
      material: "화북포구문화제 · 고망낚시 · 제주 옛 관문",
      prompt: "← →로 낚싯줄 위치를 옮기고 Space로 바위틈 고망에 줄을 내리세요. 깅이와 물고기, 문화조각, 쓰레기를 건져 30초 안에 포구 생명력 100을 채우면 성공입니다.",
      targetScore: 100,
      duration: 30,
      laneCount: 5,
      catchWindow: [0.44, 0.72],
      items: [
        { name: "깅이", mark: "깅", score: 10 },
        { name: "물고기", mark: "물", score: 15 },
        { name: "보트 유적지 조각", mark: "유", score: 20 },
        { name: "해신사 문화조각", mark: "사", score: 25 },
        { name: "쓰레기", mark: "정", score: 15, clean: true },
        { name: "어린 깅이", mark: "어", score: -15, harmful: true },
      ],
      cards: ["화북포구", "화북포구문화제", "고망낚시", "제주 옛 관문"],
      bonusMission: "재실천 미션: 오늘 내가 사는 지역의 오래된 길, 항구, 시장, 골목 하나를 찾아보고 이름의 유래를 검색해보기.",
    },
  };

  const STYLE_ID = "korea-culture-minigames-kit-style";
  const CSS = `
    .kcm-root {
      width: min(620px, 100%);
      max-height: min(720px, calc(100vh - 32px));
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      border: 1px solid rgba(255, 214, 226, 0.36);
      border-radius: 8px;
      background: rgba(31, 43, 35, 0.96);
      color: #f4f8ea;
      overflow: hidden;
      box-shadow: 0 24px 70px rgba(8, 16, 13, 0.42);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .kcm-head {
      position: relative;
      padding: 22px 24px 16px;
      background: linear-gradient(180deg, rgba(255, 180, 93, 0.16), rgba(255, 255, 255, 0));
    }
    .kcm-region { color: #ffcfda; font-size: 13px; font-weight: 900; }
    .kcm-title { margin: 8px 42px 0 0; font-size: 30px; line-height: 1.08; letter-spacing: 0; }
    .kcm-close {
      position: absolute;
      top: 14px;
      right: 14px;
      width: 36px;
      height: 36px;
      border: 1px solid rgba(244, 248, 234, 0.16);
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      color: #f4f8ea;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
    }
    .kcm-body { display: grid; gap: 14px; overflow-y: auto; padding: 0 24px 24px; }
    .kcm-meta, .kcm-prompt, .kcm-cards, .kcm-hint {
      margin: 0;
      color: rgba(244, 248, 234, 0.76);
      font-size: 14px;
      line-height: 1.5;
    }
    .kcm-feedback {
      min-height: 24px;
      margin: 0;
      color: #ffcfda;
      font-weight: 800;
      line-height: 1.5;
    }
    .kcm-reset {
      width: fit-content;
      min-height: 44px;
      padding: 0 14px;
      border: 1px solid rgba(244, 248, 234, 0.16);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.08);
      color: #ffcfda;
      font: inherit;
      font-size: 14px;
      font-weight: 800;
      cursor: pointer;
    }
    .kcm-stage {
      display: grid;
      gap: 14px;
      padding: 16px;
      border: 1px solid rgba(244, 248, 234, 0.16);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.06);
    }
    .kcm-arena {
      position: relative;
      min-height: 160px;
      overflow: hidden;
      border: 1px solid rgba(244, 248, 234, 0.12);
      border-radius: 8px;
      background: linear-gradient(180deg, rgba(255, 210, 132, 0.16), rgba(20, 54, 42, 0.44)),
        repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.04) 0 24px, transparent 24px 48px);
    }
    .kcm-meter {
      position: relative;
      height: 22px;
      overflow: hidden;
      border: 1px solid rgba(244, 248, 234, 0.16);
      border-radius: 999px;
      background: rgba(10, 18, 15, 0.42);
    }
    .kcm-zone {
      position: absolute;
      top: 3px;
      bottom: 3px;
      border-radius: 999px;
      background: rgba(112, 229, 164, 0.34);
      box-shadow: 0 0 18px rgba(112, 229, 164, 0.2);
    }
    .kcm-cursor, .kcm-needle {
      position: absolute;
      top: 2px;
      left: 0;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #ffb45d;
      box-shadow: 0 0 0 4px rgba(255, 180, 93, 0.18);
    }
    .kcm-progress {
      height: 12px;
      overflow: hidden;
      border-radius: 999px;
      background: rgba(244, 248, 234, 0.12);
    }
    .kcm-progress-bar, .kcm-fill {
      height: 100%;
      width: 0%;
      border-radius: inherit;
      background: linear-gradient(90deg, #ffb45d, #70e5a4);
    }
    .kcm-rounds, .kcm-counter {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }
    .kcm-pill {
      min-height: 36px;
      display: grid;
      place-items: center;
      border: 1px solid rgba(244, 248, 234, 0.14);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      color: rgba(244, 248, 234, 0.72);
      font-weight: 900;
    }
    .kcm-pill.done {
      border-color: rgba(112, 229, 164, 0.54);
      color: #f4f8ea;
      background: rgba(112, 229, 164, 0.16);
    }
    .kcm-yangban, .kcm-malttugi {
      position: absolute;
      bottom: 18px;
      display: grid;
      place-items: center;
      width: 62px;
      height: 72px;
      border: 3px solid rgba(31, 43, 35, 0.92);
      border-radius: 50% 50% 44% 44%;
      font-size: 30px;
      font-weight: 900;
      box-shadow: 0 10px 0 rgba(0, 0, 0, 0.16);
    }
    .kcm-yangban { left: 24px; background: #f5dfb3; color: #47351e; }
    .kcm-malttugi {
      right: 24px;
      transform: translateY(92px);
      background: #8a3f31;
      color: #ffe5b6;
      transition: transform 120ms ease;
    }
    .kcm-malttugi.show { transform: translateY(0); }
    .kcm-speech {
      margin: 18px 96px 0;
      padding: 12px 14px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.12);
      color: #f4f8ea;
      font-size: 15px;
      font-weight: 800;
      line-height: 1.45;
      text-align: center;
    }
    .kcm-sangmo {
      position: absolute;
      left: 50%;
      bottom: 22px;
      width: 74px;
      height: 92px;
      transform: translateX(-50%);
    }
    .kcm-sangmo-ribbon {
      position: absolute;
      left: 35px;
      top: 0;
      width: 5px;
      height: 92px;
      transform-origin: 50% 84px;
      background: linear-gradient(180deg, #fff5be, #ffb45d 58%, rgba(255, 180, 93, 0));
      border-radius: 999px;
    }
    .kcm-sangmo-face {
      position: absolute;
      left: 17px;
      bottom: 0;
      width: 42px;
      height: 50px;
      display: grid;
      place-items: center;
      border: 3px solid rgba(31, 43, 35, 0.9);
      border-radius: 42% 42% 48% 48%;
      background: #f4d6a1;
      color: #46311d;
      font-weight: 900;
    }
    .kcm-watermelon {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 116px;
      height: 116px;
      display: grid;
      place-items: center;
      transform: translate(-50%, -50%);
      border: 8px solid #26683e;
      border-radius: 50%;
      background: linear-gradient(90deg, transparent 0 16%, rgba(30, 99, 52, 0.35) 16% 24%, transparent 24% 42%, rgba(30, 99, 52, 0.28) 42% 50%, transparent 50% 70%, rgba(30, 99, 52, 0.35) 70% 78%, transparent 78%), #49a956;
      color: #fff5be;
      font-size: 26px;
      font-weight: 900;
      box-shadow: 0 14px 0 rgba(0, 0, 0, 0.14);
    }
    .kcm-watermelon::after {
      content: "";
      position: absolute;
      inset: 18px 32px 18px auto;
      width: 5px;
      transform: rotate(18deg);
      opacity: var(--crack-opacity, 0);
      background: #fff4c4;
      box-shadow: -18px 24px 0 #fff4c4, 14px 42px 0 #fff4c4, -8px 62px 0 #fff4c4;
    }
    .kcm-watermelon.broken { border-color: #1f5a36; background: #e65c5c; }
    .kcm-crane {
      position: absolute;
      left: 50%;
      bottom: 24px;
      width: 118px;
      height: 98px;
      transform: translateX(-50%) rotate(0deg);
      transform-origin: 50% 86%;
      transition: transform 80ms linear;
    }
    .kcm-crane-body {
      position: absolute;
      left: 43px;
      bottom: 0;
      width: 32px;
      height: 58px;
      display: grid;
      place-items: center;
      border: 3px solid rgba(31, 43, 35, 0.9);
      border-radius: 50% 50% 44% 44%;
      background: #fff4e2;
      color: #233832;
      font-weight: 900;
    }
    .kcm-wing {
      position: absolute;
      top: 18px;
      width: 54px;
      height: 28px;
      border-radius: 70% 30% 70% 30%;
      background: #f7fbff;
      box-shadow: inset 0 -6px 0 rgba(82, 117, 115, 0.18);
    }
    .kcm-wing.left { left: 0; transform: rotate(-22deg); }
    .kcm-wing.right { right: 0; transform: rotate(22deg) scaleX(-1); }
    .kcm-board {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 6px;
      width: min(330px, 100%);
      justify-self: center;
      padding: 8px;
      border: 1px solid rgba(244, 248, 234, 0.12);
      border-radius: 8px;
      background: linear-gradient(180deg, rgba(255, 210, 132, 0.12), rgba(20, 54, 42, 0.4)),
        repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.035) 0 18px, transparent 18px 36px);
    }
    .kcm-cell {
      aspect-ratio: 1;
      display: grid;
      place-items: center;
      border: 1px solid rgba(244, 248, 234, 0.08);
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.05);
      color: rgba(244, 248, 234, 0.86);
      font-size: 22px;
      font-weight: 900;
    }
    .kcm-cell.player { outline: 2px solid #ffb45d; background: rgba(255, 180, 93, 0.2); }
    .kcm-cell.item { background: rgba(112, 229, 164, 0.16); }
    .kcm-cell.collected { opacity: 0.35; }
    .kcm-chip-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .kcm-chip {
      padding: 7px 10px;
      border: 1px solid rgba(244, 248, 234, 0.14);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.05);
      color: rgba(244, 248, 234, 0.72);
      font-size: 13px;
      font-weight: 900;
    }
    .kcm-chip.done {
      border-color: rgba(112, 229, 164, 0.54);
      color: #f4f8ea;
      background: rgba(112, 229, 164, 0.16);
    }
    .kcm-diver-hud {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }
    .kcm-diver-stat {
      display: grid;
      gap: 6px;
      min-height: 54px;
      padding: 9px 10px;
      border: 1px solid rgba(244, 248, 234, 0.14);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      color: rgba(244, 248, 234, 0.72);
      font-size: 12px;
      font-weight: 900;
    }
    .kcm-diver-stat strong { color: #f4f8ea; font-size: 18px; line-height: 1; }
    .kcm-diver-bar {
      height: 8px;
      overflow: hidden;
      border-radius: 999px;
      background: rgba(10, 18, 15, 0.42);
    }
    .kcm-diver-bar-fill {
      height: 100%;
      width: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, #70e5a4, #8dd8ff);
    }
    .kcm-ocean {
      position: relative;
      min-height: 260px;
      overflow: hidden;
      border: 1px solid rgba(244, 248, 234, 0.12);
      border-radius: 8px;
      background:
        linear-gradient(180deg, rgba(126, 221, 255, 0.95) 0 16%, rgba(40, 153, 190, 0.92) 16% 48%, rgba(12, 83, 126, 0.96) 100%),
        repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.08) 0 18px, transparent 18px 36px);
    }
    .kcm-ocean::before {
      content: "";
      position: absolute;
      inset: 14% 0 auto;
      height: 3px;
      background: rgba(255, 255, 255, 0.64);
      box-shadow: 0 10px 0 rgba(255, 255, 255, 0.18);
    }
    .kcm-depth-line {
      position: absolute;
      left: 0;
      right: 0;
      height: 1px;
      background: rgba(244, 248, 234, 0.12);
    }
    .kcm-depth-label {
      position: absolute;
      right: 10px;
      transform: translateY(-50%);
      color: rgba(244, 248, 234, 0.48);
      font-size: 11px;
      font-weight: 900;
    }
    .kcm-diver-player {
      position: absolute;
      z-index: 3;
      width: 36px;
      height: 42px;
      display: grid;
      place-items: center;
      transform: translate(-50%, -50%);
      border: 3px solid rgba(31, 43, 35, 0.86);
      border-radius: 50% 50% 46% 46%;
      background: #f0b06f;
      color: #263b35;
      font-size: 18px;
      font-weight: 900;
      box-shadow: 0 10px 0 rgba(0, 0, 0, 0.12);
      transition: transform 80ms linear;
    }
    .kcm-diver-player::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: -12px;
      width: 34px;
      height: 14px;
      transform: translateX(-50%);
      border-radius: 999px;
      background: rgba(255, 180, 93, 0.92);
    }
    .kcm-diver-item {
      position: absolute;
      z-index: 2;
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      transform: translate(-50%, -50%);
      border: 2px solid rgba(244, 248, 234, 0.7);
      border-radius: 10px;
      background: rgba(255, 244, 196, 0.88);
      color: #1f3d39;
      font-size: 13px;
      font-weight: 900;
      box-shadow: 0 8px 0 rgba(0, 0, 0, 0.12);
    }
    .kcm-diver-item.harmful { background: rgba(255, 114, 114, 0.9); color: #fff7ee; }
    .kcm-diver-item.collected { opacity: 0.22; transform: translate(-50%, -50%) scale(0.78); }
    .kcm-diver-log {
      display: grid;
      gap: 6px;
      margin: 0;
      padding: 10px 12px;
      border: 1px solid rgba(244, 248, 234, 0.12);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      color: rgba(244, 248, 234, 0.76);
      font-size: 13px;
      line-height: 1.45;
    }
    .kcm-fishing-hud {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }
    .kcm-fishing-stat {
      display: grid;
      gap: 6px;
      min-height: 54px;
      padding: 9px 10px;
      border: 1px solid rgba(244, 248, 234, 0.14);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      color: rgba(244, 248, 234, 0.72);
      font-size: 12px;
      font-weight: 900;
    }
    .kcm-fishing-stat strong { color: #f4f8ea; font-size: 18px; line-height: 1; }
    .kcm-fishing-bar {
      height: 8px;
      overflow: hidden;
      border-radius: 999px;
      background: rgba(10, 18, 15, 0.42);
    }
    .kcm-fishing-fill {
      height: 100%;
      width: 0%;
      border-radius: inherit;
      background: linear-gradient(90deg, #70e5a4, #ffdd7a);
    }
    .kcm-harbor {
      position: relative;
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 8px;
      min-height: 270px;
      overflow: hidden;
      padding: 16px 14px 18px;
      border: 1px solid rgba(244, 248, 234, 0.12);
      border-radius: 8px;
      background:
        linear-gradient(180deg, rgba(67, 130, 142, 0.9) 0 28%, rgba(16, 75, 99, 0.96) 28% 100%),
        repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.08) 0 18px, transparent 18px 36px);
    }
    .kcm-harbor::before {
      content: "";
      position: absolute;
      inset: 0 0 auto;
      height: 76px;
      background:
        radial-gradient(circle at 12% 78%, #6e6c5b 0 20px, transparent 21px),
        radial-gradient(circle at 31% 70%, #8a826a 0 28px, transparent 29px),
        radial-gradient(circle at 52% 76%, #5f675b 0 24px, transparent 25px),
        radial-gradient(circle at 74% 70%, #888069 0 30px, transparent 31px),
        radial-gradient(circle at 92% 78%, #636757 0 23px, transparent 24px);
    }
    .kcm-fishing-lane {
      position: relative;
      min-height: 232px;
      overflow: hidden;
      border: 1px solid rgba(244, 248, 234, 0.1);
      border-radius: 8px;
      background: rgba(10, 28, 35, 0.28);
    }
    .kcm-fishing-lane.selected { outline: 2px solid #ffdd7a; background: rgba(255, 221, 122, 0.11); }
    .kcm-fishing-hole {
      position: absolute;
      left: 50%;
      top: 30px;
      width: 38px;
      height: 24px;
      transform: translateX(-50%);
      border-radius: 50%;
      background: #18292d;
      box-shadow: inset 0 5px 0 rgba(255, 255, 255, 0.08), 0 0 0 8px rgba(116, 111, 91, 0.9);
    }
    .kcm-fishing-zone {
      position: absolute;
      left: 8px;
      right: 8px;
      top: 44%;
      height: 28%;
      border: 1px dashed rgba(112, 229, 164, 0.54);
      border-radius: 8px;
      background: rgba(112, 229, 164, 0.08);
    }
    .kcm-fishing-line {
      position: absolute;
      z-index: 4;
      left: 50%;
      top: 0;
      width: 3px;
      height: 42px;
      transform: translateX(-50%);
      background: #fff4c4;
      border-radius: 999px;
      box-shadow: 0 0 0 3px rgba(255, 244, 196, 0.14);
    }
    .kcm-fishing-line::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: -9px;
      width: 14px;
      height: 14px;
      transform: translateX(-50%) rotate(45deg);
      border-right: 3px solid #fff4c4;
      border-bottom: 3px solid #fff4c4;
      border-radius: 0 0 8px 0;
    }
    .kcm-fishing-item {
      position: absolute;
      z-index: 3;
      left: 50%;
      top: 0;
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      transform: translate(-50%, -50%);
      border: 2px solid rgba(244, 248, 234, 0.72);
      border-radius: 10px;
      background: rgba(255, 244, 196, 0.9);
      color: #1f3d39;
      font-size: 13px;
      font-weight: 900;
      box-shadow: 0 8px 0 rgba(0, 0, 0, 0.12);
    }
    .kcm-fishing-item.clean { background: rgba(112, 229, 164, 0.92); }
    .kcm-fishing-item.harmful { background: rgba(255, 114, 114, 0.9); color: #fff7ee; }
    .kcm-fishing-log {
      margin: 0;
      padding: 10px 12px;
      border: 1px solid rgba(244, 248, 234, 0.12);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      color: rgba(244, 248, 234, 0.76);
      font-size: 13px;
      line-height: 1.45;
    }
    @media (max-width: 640px) {
      .kcm-root { width: min(420px, calc(100vw - 24px)); }
      .kcm-head { padding: 18px 18px 12px; }
      .kcm-title { font-size: 22px; }
      .kcm-body { padding: 0 18px 18px; }
      .kcm-speech { margin: 16px 76px 0; font-size: 13px; }
    }
  `;

  function injectStyles(doc) {
    const targetDoc = doc || global.document;
    if (!targetDoc || targetDoc.getElementById(STYLE_ID)) return;
    const style = targetDoc.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS;
    targetDoc.head.append(style);
  }

  function cloneGame(game) {
    return JSON.parse(JSON.stringify(game));
  }

  function cloneGames(games) {
    const source = games || GAME_DEFINITIONS;
    return Object.fromEntries(Object.entries(source).map(([key, game]) => [key, cloneGame(game)]));
  }

  function removeRegionGames(target, keys) {
    if (!target || typeof target !== "object") {
      throw new Error("target game registry is required.");
    }
    const regionKeys = keys || Object.keys(GAME_DEFINITIONS);
    regionKeys.forEach((key) => {
      if (target instanceof Map) target.delete(key);
      else delete target[key];
    });
    return target;
  }

  function replaceRegionGames(target, options) {
    if (!target || typeof target !== "object") {
      throw new Error("target game registry is required.");
    }
    const opts = options || {};
    const games = opts.games || GAME_DEFINITIONS;
    const regionKeys = opts.keys || Object.keys(games);
    if (target instanceof Map) target.clear();
    else Object.keys(target).forEach((key) => delete target[key]);
    regionKeys.forEach((key) => {
      if (!games[key]) return;
      const game = cloneGame(games[key]);
      if (target instanceof Map) target.set(key, game);
      else target[key] = game;
    });
    return target;
  }

  function createElement(doc, tag, className, text) {
    const el = doc.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  class CultureMinigames {
    constructor(options) {
      const opts = options || {};
      this.window = opts.window || global;
      this.document = opts.document || this.window.document;
      this.container = opts.container;
      this.onComplete = opts.onComplete || function () {};
      this.onClose = opts.onClose || function () {};
      this.onFeedback = opts.onFeedback || function () {};
      this.games = Object.assign({}, GAME_DEFINITIONS, opts.games || {});
      this.keys = new Set();
      this.activeKey = null;
      this.game = null;
      this.state = null;
      this.frame = null;
      this.root = null;
      this.refs = {};

      if (!this.container) throw new Error("container is required.");
      injectStyles(this.document);

      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.handleKeyUp = this.handleKeyUp.bind(this);
      this.document.addEventListener("keydown", this.handleKeyDown);
      this.document.addEventListener("keyup", this.handleKeyUp);
    }

    start(regionKey) {
      const source = this.games[regionKey];
      if (!source) throw new Error(`Unknown minigame region: ${regionKey}`);
      this.stopLoop();
      this.keys.clear();
      this.activeKey = regionKey;
      this.game = cloneGame(source);
      this.state = null;
      this.renderShell();
      this.reset();
    }

    reset() {
      if (!this.game) return;
      this.stopLoop();
      this.keys.clear();
      this.state = null;
      this.setFeedback(this.initialFeedback());
      if (this.game.type === "timing") this.renderTiming();
      else if (this.game.type === "hold") this.renderHold();
      else if (this.game.type === "mash") this.renderMash();
      else if (this.game.type === "balance") this.renderBalance();
      else if (this.game.type === "collect") this.renderCollect();
      else if (this.game.type === "diver") this.renderDiver();
      else if (this.game.type === "fishing") this.renderFishing();
    }

    destroy() {
      this.stopLoop();
      this.document.removeEventListener("keydown", this.handleKeyDown);
      this.document.removeEventListener("keyup", this.handleKeyUp);
      this.container.textContent = "";
      this.activeKey = null;
      this.game = null;
      this.state = null;
    }

    close() {
      const regionKey = this.activeKey;
      this.stopLoop();
      this.container.textContent = "";
      this.activeKey = null;
      this.game = null;
      this.state = null;
      this.onClose({ regionKey });
    }

    renderShell() {
      this.container.textContent = "";
      const root = createElement(this.document, "section", "kcm-root");
      const head = createElement(this.document, "header", "kcm-head");
      const region = createElement(this.document, "div", "kcm-region", this.game.region);
      const title = createElement(this.document, "h2", "kcm-title", this.game.title);
      const close = createElement(this.document, "button", "kcm-close", "×");
      close.type = "button";
      close.setAttribute("aria-label", "미니게임 닫기");
      close.addEventListener("click", () => this.close());
      head.append(region, title, close);

      const body = createElement(this.document, "div", "kcm-body");
      const meta = createElement(this.document, "p", "kcm-meta", this.game.material);
      const prompt = createElement(this.document, "p", "kcm-prompt", this.game.prompt);
      const host = createElement(this.document, "div", "kcm-host");
      const reset = createElement(this.document, "button", "kcm-reset", "다시 도전");
      reset.type = "button";
      reset.addEventListener("click", () => this.reset());
      const cards = createElement(this.document, "p", "kcm-cards", `해금 문화카드: ${this.game.cards.join(", ")}`);
      const feedback = createElement(this.document, "p", "kcm-feedback");
      body.append(meta, prompt, host, reset, cards, feedback);
      root.append(head, body);
      this.container.append(root);

      this.root = root;
      this.refs = { host, feedback };
    }

    initialFeedback() {
      if (this.game.type === "timing") return "말뚝이가 등장하는 순간 Space를 눌러 풍자를 받아치세요.";
      if (this.game.type === "hold") return "Space를 누르고 떼며 상모 게이지를 초록 구간에 유지하세요.";
      if (this.game.type === "mash") return "Space를 100번 눌러 무등산 수박을 깨세요.";
      if (this.game.type === "balance") return "A/D 또는 Space로 학춤 균형을 유지하세요.";
      if (this.game.type === "collect") return "방향키로 단오제 준비물을 모두 모으세요.";
      if (this.game.type === "diver") return "Space를 길게 눌러 잠수하고, 떼면 숨비소리를 내며 수면으로 올라옵니다.";
      if (this.game.type === "fishing") return "← →로 낚싯줄 위치를 옮기고 Space로 고망낚시 타이밍을 맞추세요.";
      return "";
    }

    setFeedback(text) {
      if (this.refs.feedback) this.refs.feedback.textContent = text;
      this.onFeedback({ regionKey: this.activeKey, message: text, game: this.game });
    }

    complete(message) {
      this.stopLoop();
      this.setFeedback(message);
      const payload = { regionKey: this.activeKey, game: this.game, cards: this.game.cards.slice() };
      this.onComplete(payload);
    }

    stopLoop() {
      if (this.frame) {
        this.window.cancelAnimationFrame(this.frame);
        this.frame = null;
      }
    }

    renderTiming() {
      const stage = createElement(this.document, "div", "kcm-stage");
      const arena = createElement(this.document, "div", "kcm-arena");
      const yangban = createElement(this.document, "div", "kcm-yangban", "양");
      const malttugi = createElement(this.document, "div", "kcm-malttugi", "말");
      const speech = createElement(this.document, "p", "kcm-speech");
      arena.append(yangban, malttugi, speech);

      const meter = createElement(this.document, "div", "kcm-meter");
      const zone = createElement(this.document, "div", "kcm-zone");
      const [start, end] = this.game.timingWindow;
      zone.style.left = `${start * 100}%`;
      zone.style.width = `${(end - start) * 100}%`;
      const cursor = createElement(this.document, "div", "kcm-cursor");
      meter.append(zone, cursor);

      const rounds = createElement(this.document, "div", "kcm-rounds");
      const roundEls = this.game.rounds.map((_, index) => {
        const item = createElement(this.document, "div", "kcm-pill", `${index + 1}막`);
        rounds.append(item);
        return item;
      });
      const hint = createElement(this.document, "p", "kcm-hint", "말뚝이가 튀어나오는 순간 Space를 누르세요.");
      stage.append(arena, meter, rounds, hint);
      this.refs.host.textContent = "";
      this.refs.host.append(stage);

      this.state = {
        type: "timing",
        roundIndex: 0,
        hits: 0,
        progress: 0,
        duration: 1850,
        resolved: false,
        inputReadyAt: this.window.performance.now() + 180,
        refs: { malttugi, speech, cursor, hint, roundEls },
      };
      this.startTimingRound();
    }

    startTimingRound() {
      const state = this.state;
      state.roundStart = this.window.performance.now();
      state.progress = 0;
      state.resolved = false;
      state.inputReadyAt = Math.max(state.inputReadyAt || 0, this.window.performance.now() + 180);
      state.refs.speech.textContent = this.game.rounds[state.roundIndex].boast;
      this.stopLoop();
      this.frame = this.window.requestAnimationFrame((now) => this.updateTiming(now));
    }

    updateTiming(now) {
      if (!this.state || this.state.type !== "timing" || this.state.resolved) return;
      const [start, end] = this.game.timingWindow;
      const elapsed = (now - this.state.roundStart) % this.state.duration;
      const progress = elapsed / this.state.duration;
      this.state.progress = progress;
      this.state.refs.cursor.style.left = `${Math.min(97, progress * 100)}%`;
      const inWindow = progress >= start && progress <= end;
      this.state.refs.malttugi.classList.toggle("show", inWindow);
      this.state.refs.hint.textContent = inWindow
        ? "지금! Space로 말뚝이의 풍자를 받아치세요."
        : "양반탈의 허세가 이어집니다. 말뚝이가 튀어나오는 순간을 기다리세요.";
      this.frame = this.window.requestAnimationFrame((nextNow) => this.updateTiming(nextNow));
    }

    handleTimingSpace() {
      const state = this.state;
      if (!state || state.type !== "timing" || state.resolved) return;
      const now = this.window.performance.now();
      if (now < (state.inputReadyAt || 0)) return;
      state.inputReadyAt = now + 280;

      const [start, end] = this.game.timingWindow;
      const hit = state.progress >= start && state.progress <= end;
      if (!hit) {
        this.setFeedback(state.progress < start
          ? "조금 빨랐어요. 말뚝이가 등장할 때까지 한 박자 기다리세요."
          : "조금 늦었어요. 말뚝이가 보이는 순간 바로 받아치세요.");
        state.roundStart = this.window.performance.now();
        state.inputReadyAt = this.window.performance.now() + 260;
        return;
      }

      const round = this.game.rounds[state.roundIndex];
      state.resolved = true;
      state.hits += 1;
      state.inputReadyAt = now + 900;
      this.stopLoop();
      state.refs.speech.textContent = round.retort;
      state.refs.malttugi.classList.add("show");
      state.refs.roundEls[state.roundIndex].classList.add("done");
      state.refs.roundEls[state.roundIndex].textContent = "풍자 성공";

      if (state.hits >= this.game.rounds.length) {
        this.complete("성공! 말뚝이의 풍자가 한 마당을 뒤집었습니다.");
        return;
      }

      this.setFeedback("좋아요. 다음 허세 대사를 받아칠 준비를 하세요.");
      this.window.setTimeout(() => {
        if (!this.state || this.state.type !== "timing") return;
        this.state.roundIndex += 1;
        this.startTimingRound();
      }, 720);
    }

    renderHold() {
      const stage = createElement(this.document, "div", "kcm-stage");
      const arena = createElement(this.document, "div", "kcm-arena");
      const sangmo = createElement(this.document, "div", "kcm-sangmo");
      const ribbon = createElement(this.document, "div", "kcm-sangmo-ribbon");
      const face = createElement(this.document, "div", "kcm-sangmo-face", "상");
      sangmo.append(ribbon, face);
      arena.append(sangmo);

      const meter = createElement(this.document, "div", "kcm-meter");
      const [start, end] = this.game.greenWindow;
      const zone = createElement(this.document, "div", "kcm-zone");
      zone.style.left = `${start * 100}%`;
      zone.style.width = `${(end - start) * 100}%`;
      const fill = createElement(this.document, "div", "kcm-fill");
      const needle = createElement(this.document, "div", "kcm-needle");
      meter.append(zone, fill, needle);

      const progress = createElement(this.document, "div", "kcm-progress");
      const progressBar = createElement(this.document, "div", "kcm-progress-bar");
      progress.append(progressBar);
      const hint = createElement(this.document, "p", "kcm-hint", "Space를 누르면 빨라지고, 떼면 느려집니다.");
      stage.append(arena, meter, progress, hint);
      this.refs.host.textContent = "";
      this.refs.host.append(stage);

      this.state = {
        type: "hold",
        value: 0.24,
        holding: false,
        successMs: 0,
        angle: 0,
        lastNow: this.window.performance.now(),
        completed: false,
        refs: { ribbon, fill, needle, progressBar, hint },
      };
      this.frame = this.window.requestAnimationFrame((now) => this.updateHold(now));
    }

    updateHold(now) {
      const state = this.state;
      if (!state || state.type !== "hold" || state.completed) return;
      const dt = Math.min(0.05, (now - state.lastNow) / 1000);
      state.lastNow = now;
      state.value += state.holding ? dt * 0.44 : -dt * 0.34;
      state.value = Math.max(0, Math.min(1, state.value));
      const [start, end] = this.game.greenWindow;
      const inZone = state.value >= start && state.value <= end;
      state.successMs = inZone ? state.successMs + dt * 1000 : Math.max(0, state.successMs - dt * 620);
      state.angle += (180 + state.value * 760) * dt;
      state.refs.ribbon.style.transform = `rotate(${state.angle}deg)`;
      state.refs.fill.style.width = `${state.value * 100}%`;
      state.refs.needle.style.left = `${Math.min(96, state.value * 100)}%`;
      state.refs.progressBar.style.width = `${Math.min(100, state.successMs / this.game.targetMs * 100)}%`;
      state.refs.hint.textContent = inZone
        ? "좋아요. 초록 구간을 계속 유지하세요."
        : state.value < start
          ? "너무 느려졌어요. Space를 눌러 속도를 올리세요."
          : "너무 빨라졌어요. Space를 떼고 속도를 낮추세요.";
      if (state.successMs >= this.game.targetMs) {
        state.completed = true;
        this.complete("성공! 상모가 장단에 맞춰 안정적으로 돌아갑니다.");
        return;
      }
      this.frame = this.window.requestAnimationFrame((nextNow) => this.updateHold(nextNow));
    }

    renderMash() {
      const stage = createElement(this.document, "div", "kcm-stage");
      const arena = createElement(this.document, "div", "kcm-arena");
      const watermelon = createElement(this.document, "div", "kcm-watermelon", "수");
      arena.append(watermelon);
      const meter = createElement(this.document, "div", "kcm-meter");
      const fill = createElement(this.document, "div", "kcm-fill");
      meter.append(fill);
      const counter = createElement(this.document, "div", "kcm-counter");
      const count = createElement(this.document, "div", "kcm-pill");
      const goal = createElement(this.document, "div", "kcm-pill", `목표 ${this.game.targetPresses}회`);
      counter.append(count, goal);
      const hint = createElement(this.document, "p", "kcm-hint", "Space를 빠르게 눌러 금을 키우세요.");
      stage.append(arena, meter, counter, hint);
      this.refs.host.textContent = "";
      this.refs.host.append(stage);
      this.state = { type: "mash", count: 0, spaceDown: false, completed: false, refs: { watermelon, fill, count, hint } };
      this.updateMashDisplay();
    }

    updateMashDisplay() {
      const state = this.state;
      const ratio = Math.min(1, state.count / this.game.targetPresses);
      state.refs.fill.style.width = `${ratio * 100}%`;
      state.refs.count.textContent = `${state.count}/${this.game.targetPresses}`;
      state.refs.watermelon.style.setProperty("--crack-opacity", Math.min(1, ratio * 1.35).toString());
      state.refs.watermelon.textContent = ratio >= 1 ? "쾅" : ratio >= 0.66 ? "쩍" : ratio >= 0.33 ? "금" : "수";
      state.refs.watermelon.classList.toggle("broken", ratio >= 1);
      state.refs.hint.textContent = ratio >= 1
        ? "무등산 수박이 시원하게 갈라졌습니다."
        : ratio >= 0.66
          ? "거의 다 왔어요. 금이 크게 벌어졌습니다."
          : "Space를 빠르게 눌러 금을 키우세요.";
    }

    handleMashSpace() {
      const state = this.state;
      if (!state || state.type !== "mash" || state.completed || state.spaceDown) return;
      state.spaceDown = true;
      state.count = Math.min(this.game.targetPresses, state.count + 1);
      this.updateMashDisplay();
      if (state.count >= this.game.targetPresses) {
        state.completed = true;
        this.complete("성공! 무등산 수박이 갈라졌습니다.");
      } else if (state.count % 20 === 0) {
        this.setFeedback(`좋아요. ${state.count}번 두드렸습니다.`);
      }
    }

    renderBalance() {
      const stage = createElement(this.document, "div", "kcm-stage");
      const arena = createElement(this.document, "div", "kcm-arena");
      const crane = createElement(this.document, "div", "kcm-crane");
      const left = createElement(this.document, "div", "kcm-wing left");
      const right = createElement(this.document, "div", "kcm-wing right");
      const body = createElement(this.document, "div", "kcm-crane-body", "학");
      crane.append(left, right, body);
      arena.append(crane);
      const meter = createElement(this.document, "div", "kcm-meter");
      const zone = createElement(this.document, "div", "kcm-zone");
      const safePercent = this.game.safeTilt / 0.58 * 50;
      zone.style.left = `${50 - safePercent}%`;
      zone.style.width = `${safePercent * 2}%`;
      const needle = createElement(this.document, "div", "kcm-needle");
      meter.append(zone, needle);
      const progress = createElement(this.document, "div", "kcm-progress");
      const progressBar = createElement(this.document, "div", "kcm-progress-bar");
      progress.append(progressBar);
      const hint = createElement(this.document, "p", "kcm-hint", "A/D로 좌우를 잡고, Space는 기운 반대쪽으로 빠르게 균형을 보정합니다.");
      stage.append(arena, meter, progress, hint);
      this.refs.host.textContent = "";
      this.refs.host.append(stage);
      this.state = {
        type: "balance",
        tilt: 0.12,
        velocity: 0,
        wind: 0.05,
        successMs: 0,
        lastNow: this.window.performance.now(),
        completed: false,
        refs: { crane, needle, progressBar, hint },
      };
      this.frame = this.window.requestAnimationFrame((now) => this.updateBalance(now));
    }

    updateBalance(now) {
      const state = this.state;
      if (!state || state.type !== "balance" || state.completed) return;
      const dt = Math.min(0.05, (now - state.lastNow) / 1000);
      state.lastNow = now;
      const left = this.keys.has("KeyA") || this.keys.has("ArrowLeft");
      const right = this.keys.has("KeyD") || this.keys.has("ArrowRight");
      const space = this.keys.has("Space");
      const control = (left ? -1 : 0) + (right ? 1 : 0) + (space ? -Math.sign(state.tilt || 0.01) * 0.85 : 0);
      state.wind += (Math.random() - 0.5) * dt * 0.22;
      state.wind *= Math.max(0, 1 - dt * 0.55);
      state.velocity += (state.wind + control * 0.9) * dt;
      state.velocity += state.tilt * dt * 0.42;
      state.velocity *= Math.max(0, 1 - dt * 1.25);
      state.tilt = Math.max(-0.58, Math.min(0.58, state.tilt + state.velocity));
      const safe = Math.abs(state.tilt) <= this.game.safeTilt;
      state.successMs = safe ? state.successMs + dt * 1000 : Math.max(0, state.successMs - dt * 920);
      const meterPos = ((state.tilt + 0.58) / 1.16) * 100;
      state.refs.needle.style.left = `${Math.min(96, Math.max(1, meterPos))}%`;
      state.refs.crane.style.transform = `translateX(-50%) rotate(${state.tilt * 58}deg)`;
      state.refs.progressBar.style.width = `${Math.min(100, state.successMs / this.game.targetMs * 100)}%`;
      state.refs.hint.textContent = safe
        ? "좋아요. 학춤의 중심이 살아있습니다."
        : state.tilt < 0
          ? "왼쪽으로 기울었어요. D나 Space로 균형을 잡으세요."
          : "오른쪽으로 기울었어요. A나 Space로 균형을 잡으세요.";
      if (state.successMs >= this.game.targetMs) {
        state.completed = true;
        this.complete("성공! 동래학춤의 학처럼 균형을 지켰습니다.");
        return;
      }
      this.frame = this.window.requestAnimationFrame((nextNow) => this.updateBalance(nextNow));
    }

    renderCollect() {
      if (!this.state || this.state.type !== "collect") {
        this.state = {
          type: "collect",
          player: { x: 0, y: this.game.boardSize - 1 },
          collected: [],
        };
      }
      const collectedSet = new Set(this.state.collected);
      const stage = createElement(this.document, "div", "kcm-stage");
      const board = createElement(this.document, "div", "kcm-board");
      const itemByPos = new Map(this.game.items.map((item) => [`${item.x},${item.y}`, item]));
      for (let y = 0; y < this.game.boardSize; y += 1) {
        for (let x = 0; x < this.game.boardSize; x += 1) {
          const item = itemByPos.get(`${x},${y}`);
          const isPlayer = this.state.player.x === x && this.state.player.y === y;
          const collected = item && collectedSet.has(item.name);
          const cell = createElement(this.document, "div", `kcm-cell${isPlayer ? " player" : ""}${item ? " item" : ""}${collected ? " collected" : ""}`);
          cell.textContent = isPlayer ? "단" : item && !collected ? item.mark : "";
          board.append(cell);
        }
      }
      const chips = createElement(this.document, "div", "kcm-chip-list");
      this.game.items.forEach((item) => {
        chips.append(createElement(this.document, "span", `kcm-chip${collectedSet.has(item.name) ? " done" : ""}`, item.name));
      });
      const hint = createElement(this.document, "p", "kcm-hint", "방향키로 움직여 단오제 준비물을 모두 모으세요.");
      stage.append(board, chips, hint);
      this.refs.host.textContent = "";
      this.refs.host.append(stage);
    }

    handleCollectMove(code) {
      const state = this.state;
      if (!state || state.type !== "collect") return;
      const delta = {
        ArrowUp: [0, -1],
        KeyW: [0, -1],
        ArrowDown: [0, 1],
        KeyS: [0, 1],
        ArrowLeft: [-1, 0],
        KeyA: [-1, 0],
        ArrowRight: [1, 0],
        KeyD: [1, 0],
      }[code];
      if (!delta) return;
      state.player.x = Math.max(0, Math.min(this.game.boardSize - 1, state.player.x + delta[0]));
      state.player.y = Math.max(0, Math.min(this.game.boardSize - 1, state.player.y + delta[1]));
      const found = this.game.items.find((item) => item.x === state.player.x && item.y === state.player.y);
      if (found && !state.collected.includes(found.name)) {
        state.collected.push(found.name);
        this.setFeedback(`${found.name} 준비 완료!`);
      }
      if (state.collected.length >= this.game.items.length) {
        this.renderCollect();
        this.complete("성공! 단오제 준비물이 모두 모였습니다.");
        return;
      }
      this.renderCollect();
    }

    renderDiver() {
      if (!this.state || this.state.type !== "diver") {
        this.state = {
          type: "diver",
          player: { x: 50, y: 12 },
          breath: 100,
          timeLeft: this.game.duration,
          score: 0,
          collected: [],
          diving: false,
          surfaced: false,
          failed: false,
          completed: false,
          lastNow: this.window.performance.now(),
        };
      }

      const stage = createElement(this.document, "div", "kcm-stage");
      const hud = createElement(this.document, "div", "kcm-diver-hud");

      const breathStat = createElement(this.document, "div", "kcm-diver-stat");
      breathStat.append("숨 게이지");
      const breathValue = createElement(this.document, "strong");
      const breathBar = createElement(this.document, "div", "kcm-diver-bar");
      const breathFill = createElement(this.document, "div", "kcm-diver-bar-fill");
      breathBar.append(breathFill);
      breathStat.append(breathValue, breathBar);

      const scoreStat = createElement(this.document, "div", "kcm-diver-stat");
      scoreStat.append("점수");
      const scoreValue = createElement(this.document, "strong");
      scoreStat.append(scoreValue);

      const timeStat = createElement(this.document, "div", "kcm-diver-stat");
      timeStat.append("남은 시간");
      const timeValue = createElement(this.document, "strong");
      timeStat.append(timeValue);
      hud.append(breathStat, scoreStat, timeStat);

      const ocean = createElement(this.document, "div", "kcm-ocean");
      [34, 58, 82].forEach((depth) => {
        const line = createElement(this.document, "div", "kcm-depth-line");
        line.style.top = `${depth}%`;
        const label = createElement(this.document, "div", "kcm-depth-label", depth >= 80 ? "깊은 바다" : depth >= 58 ? "중간 수심" : "얕은 바다");
        label.style.top = `${depth}%`;
        ocean.append(line, label);
      });

      const itemEls = new Map();
      this.game.items.forEach((item, index) => {
        const itemEl = createElement(this.document, "div", `kcm-diver-item${item.harmful ? " harmful" : ""}`, item.mark);
        itemEl.style.left = `${item.x}%`;
        itemEl.style.top = `${item.y}%`;
        itemEl.title = `${item.name} ${item.score > 0 ? "+" : ""}${item.score}점`;
        ocean.append(itemEl);
        itemEls.set(index, itemEl);
      });

      const player = createElement(this.document, "div", "kcm-diver-player", "숨");
      ocean.append(player);
      const log = createElement(this.document, "p", "kcm-diver-log");
      stage.append(hud, ocean, log);
      this.refs.host.textContent = "";
      this.refs.host.append(stage);
      this.refs.diver = { breathValue, breathFill, scoreValue, timeValue, player, itemEls, log };
      this.updateDiverDisplay();
      this.stopLoop();
      this.frame = this.window.requestAnimationFrame((now) => this.updateDiver(now));
    }

    updateDiverDisplay() {
      const state = this.state;
      const refs = this.refs.diver;
      if (!state || state.type !== "diver" || !refs) return;
      refs.breathValue.textContent = `${Math.max(0, Math.round(state.breath))}%`;
      refs.breathFill.style.width = `${Math.max(0, state.breath)}%`;
      refs.scoreValue.textContent = `${state.score}/${this.game.targetScore}`;
      refs.timeValue.textContent = `${Math.max(0, Math.ceil(state.timeLeft))}초`;
      refs.player.style.left = `${state.player.x}%`;
      refs.player.style.top = `${state.player.y}%`;
      refs.player.style.transform = `translate(-50%, -50%) rotate(${state.diving ? -8 : 0}deg)`;
      const collected = new Set(state.collected);
      refs.itemEls.forEach((itemEl, index) => itemEl.classList.toggle("collected", collected.has(index)));

      if (state.completed) {
        refs.log.textContent = `${this.game.bonusMission} 해녀의 원칙: 어린 해산물은 잡지 않는다. 필요한 만큼만 채취한다.`;
      } else if (state.failed) {
        refs.log.textContent = "숨을 너무 오래 참았어요. 바다와 호흡하려면 욕심을 줄이고 다시 도전하세요.";
      } else if (state.surfaced) {
        refs.log.textContent = `휘이익- 숨비소리! ${state.score}점입니다. 목표는 ${this.game.targetScore}점이에요.`;
      } else if (state.diving) {
        refs.log.textContent = "방향키로 움직이세요. 깊이 내려갈수록 좋은 아이템이 있지만 숨이 더 빨리 줄어듭니다.";
      } else {
        refs.log.textContent = "Space를 길게 누르면 잠수합니다. Space를 떼면 수면으로 올라와 점수를 정산합니다.";
      }
    }

    updateDiver(now) {
      const state = this.state;
      if (!state || state.type !== "diver" || state.completed || state.failed || state.surfaced) return;
      const dt = Math.min(0.05, (now - state.lastNow) / 1000);
      state.lastNow = now;

      if (state.diving) {
        const move = 34 * dt;
        if (this.keys.has("ArrowLeft") || this.keys.has("KeyA")) state.player.x -= move;
        if (this.keys.has("ArrowRight") || this.keys.has("KeyD")) state.player.x += move;
        if (this.keys.has("ArrowUp") || this.keys.has("KeyW")) state.player.y -= move;
        if (this.keys.has("ArrowDown") || this.keys.has("KeyS")) state.player.y += move;
        state.player.x = Math.max(8, Math.min(92, state.player.x));
        state.player.y = Math.max(16, Math.min(90, state.player.y));

        const depthRatio = Math.max(0, (state.player.y - 16) / 74);
        state.breath -= dt * (4.2 + depthRatio * 8.8);
        state.timeLeft -= dt;

        this.game.items.forEach((item, index) => {
          if (state.collected.includes(index)) return;
          const dx = item.x - state.player.x;
          const dy = item.y - state.player.y;
          if (Math.hypot(dx, dy) <= 7.5) {
            state.collected.push(index);
            state.score += item.score;
            this.setFeedback(`${item.name} ${item.score > 0 ? "+" : ""}${item.score}점`);
          }
        });

        if (state.breath <= 0) {
          this.failDiver("실패! 숨 게이지가 0이 되었습니다. 해녀처럼 욕심을 조절해 다시 도전하세요.");
          return;
        }
        if (state.timeLeft <= 0) {
          this.failDiver("실패! 30초가 지났습니다. 숨비소리를 내며 올라올 타이밍을 조금 더 빨리 잡아보세요.");
          return;
        }
      }

      this.updateDiverDisplay();
      this.frame = this.window.requestAnimationFrame((nextNow) => this.updateDiver(nextNow));
    }

    handleDiverSpaceDown() {
      const state = this.state;
      if (!state || state.type !== "diver" || state.completed || state.failed || state.surfaced) return;
      state.diving = true;
      state.lastNow = this.window.performance.now();
      this.setFeedback("잠수 시작! 방향키로 움직이며 필요한 만큼만 채취하세요.");
      this.updateDiverDisplay();
    }

    handleDiverSpaceUp() {
      const state = this.state;
      if (!state || state.type !== "diver" || !state.diving) return;
      state.diving = false;
      state.surfaced = true;
      this.stopLoop();
      this.updateDiverDisplay();

      if (state.score >= this.game.targetScore && state.breath > 0) {
        state.completed = true;
        this.setFeedback(`휘이익- 숨비소리! ${state.score}점으로 물질 성공.`);
        this.updateDiverDisplay();
        this.complete(`성공! 제주 해녀처럼 욕심을 조절해 ${state.score}점을 모았습니다.`);
        return;
      }

      this.setFeedback(`휘이익- 숨비소리! ${state.score}점입니다. ${this.game.targetScore}점 이상을 모아야 성공이에요.`);
    }

    failDiver(message) {
      const state = this.state;
      if (!state || state.type !== "diver") return;
      state.diving = false;
      state.failed = true;
      this.stopLoop();
      this.setFeedback(message);
      this.updateDiverDisplay();
    }

    spawnFishingItem(lane) {
      const item = this.game.items[Math.floor(Math.random() * this.game.items.length) % this.game.items.length];
      return {
        ...item,
        lane,
        progress: -0.08 - Math.random() * 0.62,
        speed: 0.19 + Math.random() * 0.16,
      };
    }

    renderFishing() {
      if (!this.state || this.state.type !== "fishing") {
        const laneCount = this.game.laneCount || 5;
        this.state = {
          type: "fishing",
          column: Math.floor(laneCount / 2),
          life: 0,
          cleanScore: 0,
          timeLeft: this.game.duration,
          dropProgress: 0,
          dropping: false,
          completed: false,
          failed: false,
          lastNow: this.window.performance.now(),
          items: Array.from({ length: laneCount }, (_, lane) => this.spawnFishingItem(lane)),
        };
      }

      const stage = createElement(this.document, "div", "kcm-stage");
      const hud = createElement(this.document, "div", "kcm-fishing-hud");

      const lifeStat = createElement(this.document, "div", "kcm-fishing-stat");
      lifeStat.append("포구 생명력");
      const lifeValue = createElement(this.document, "strong");
      const lifeBar = createElement(this.document, "div", "kcm-fishing-bar");
      const lifeFill = createElement(this.document, "div", "kcm-fishing-fill");
      lifeBar.append(lifeFill);
      lifeStat.append(lifeValue, lifeBar);

      const cleanStat = createElement(this.document, "div", "kcm-fishing-stat");
      cleanStat.append("정화 점수");
      const cleanValue = createElement(this.document, "strong");
      cleanStat.append(cleanValue);

      const timeStat = createElement(this.document, "div", "kcm-fishing-stat");
      timeStat.append("남은 시간");
      const timeValue = createElement(this.document, "strong");
      timeStat.append(timeValue);
      hud.append(lifeStat, cleanStat, timeStat);

      const harbor = createElement(this.document, "div", "kcm-harbor");
      harbor.style.gridTemplateColumns = `repeat(${this.game.laneCount || 5}, minmax(0, 1fr))`;
      const laneEls = [];
      const itemEls = [];
      for (let lane = 0; lane < (this.game.laneCount || 5); lane += 1) {
        const laneEl = createElement(this.document, "div", "kcm-fishing-lane");
        laneEl.append(
          createElement(this.document, "div", "kcm-fishing-hole"),
          createElement(this.document, "div", "kcm-fishing-zone")
        );
        const itemEl = createElement(this.document, "div", "kcm-fishing-item");
        laneEl.append(itemEl);
        harbor.append(laneEl);
        laneEls.push(laneEl);
        itemEls.push(itemEl);
      }
      const line = createElement(this.document, "div", "kcm-fishing-line");
      harbor.append(line);
      const log = createElement(this.document, "p", "kcm-fishing-log");
      stage.append(hud, harbor, log);
      this.refs.host.textContent = "";
      this.refs.host.append(stage);
      this.refs.fishing = { lifeValue, lifeFill, cleanValue, timeValue, harbor, laneEls, itemEls, line, log };
      this.updateFishingDisplay();
      this.stopLoop();
      this.frame = this.window.requestAnimationFrame((now) => this.updateFishing(now));
    }

    updateFishingDisplay() {
      const state = this.state;
      const refs = this.refs.fishing;
      if (!state || state.type !== "fishing" || !refs) return;
      const target = this.game.targetScore || 100;
      refs.lifeValue.textContent = `${Math.max(0, Math.round(state.life))}/${target}`;
      refs.lifeFill.style.width = `${Math.min(100, Math.max(0, state.life / target * 100))}%`;
      refs.cleanValue.textContent = `${state.cleanScore}`;
      refs.timeValue.textContent = `${Math.max(0, Math.ceil(state.timeLeft))}초`;
      refs.laneEls.forEach((laneEl, lane) => laneEl.classList.toggle("selected", lane === state.column));

      const selectedLane = refs.laneEls[state.column];
      if (selectedLane) {
        const harborRect = refs.harbor.getBoundingClientRect();
        const laneRect = selectedLane.getBoundingClientRect();
        refs.line.style.left = `${laneRect.left - harborRect.left + laneRect.width / 2}px`;
        refs.line.style.height = `${42 + state.dropProgress * 148}px`;
      }

      state.items.forEach((item, lane) => {
        const itemEl = refs.itemEls[lane];
        itemEl.textContent = item.mark;
        itemEl.title = `${item.name} ${item.score > 0 ? "+" : ""}${item.score}`;
        itemEl.className = `kcm-fishing-item${item.clean ? " clean" : ""}${item.harmful ? " harmful" : ""}`;
        itemEl.style.top = `${18 + item.progress * 78}%`;
        itemEl.style.opacity = item.progress < 0 || item.progress > 1 ? "0" : "1";
      });

      if (state.completed) {
        refs.log.textContent = `${this.game.bonusMission} 포구는 사람, 물자, 이야기가 드나들던 연결의 장소입니다.`;
      } else if (state.failed) {
        refs.log.textContent = "시간이 끝났어요. 깅이와 물고기를 잡되 어린 깅이는 놓아주고 쓰레기는 건져 다시 포구를 살려보세요.";
      } else {
        refs.log.textContent = "초록 점선 구간에 아이템이 들어왔을 때 Space를 누르세요. 어린 깅이는 감점, 쓰레기는 정화 점수입니다.";
      }
    }

    updateFishing(now) {
      const state = this.state;
      if (!state || state.type !== "fishing" || state.completed || state.failed) return;
      const dt = Math.min(0.05, (now - state.lastNow) / 1000);
      state.lastNow = now;
      state.timeLeft -= dt;
      state.items = state.items.map((item, lane) => {
        const next = { ...item, progress: item.progress + item.speed * dt };
        return next.progress > 1.1 ? this.spawnFishingItem(lane) : next;
      });
      if (state.dropping) {
        state.dropProgress += dt * 4.2;
        if (state.dropProgress >= 1) {
          state.dropProgress = 0;
          state.dropping = false;
        }
      }
      if (state.timeLeft <= 0 && state.life < this.game.targetScore) {
        state.failed = true;
        this.stopLoop();
        this.setFeedback(`실패! 포구 생명력 ${Math.round(state.life)}/${this.game.targetScore}. 다시 고망 타이밍을 노려보세요.`);
        this.updateFishingDisplay();
        return;
      }
      this.updateFishingDisplay();
      this.frame = this.window.requestAnimationFrame((nextNow) => this.updateFishing(nextNow));
    }

    handleFishingMove(code) {
      const state = this.state;
      if (!state || state.type !== "fishing" || state.completed || state.failed) return;
      const delta = code === "ArrowLeft" || code === "KeyA" ? -1 : code === "ArrowRight" || code === "KeyD" ? 1 : 0;
      if (!delta) return;
      state.column = Math.max(0, Math.min((this.game.laneCount || 5) - 1, state.column + delta));
      this.updateFishingDisplay();
    }

    handleFishingDrop() {
      const state = this.state;
      if (!state || state.type !== "fishing" || state.completed || state.failed || state.dropping) return;
      state.dropping = true;
      state.dropProgress = 0;
      const item = state.items[state.column];
      const [start, end] = this.game.catchWindow;
      const caught = item.progress >= start && item.progress <= end;
      if (!caught) {
        this.setFeedback("빈 고망입니다. 아이템이 초록 점선 구간에 들어올 때 Space를 눌러보세요.");
        this.updateFishingDisplay();
        return;
      }

      state.life = Math.max(0, state.life + item.score);
      if (item.clean) state.cleanScore += item.score;
      state.items[state.column] = this.spawnFishingItem(state.column);
      this.setFeedback(item.harmful
        ? `어린 깅이는 놓아줘야 해요. ${item.score}점`
        : item.clean
          ? `쓰레기 수거! 포구 정화 +${item.score}`
          : `${item.name} 획득! +${item.score}`);

      if (state.life >= this.game.targetScore) {
        state.completed = true;
        this.stopLoop();
        this.updateFishingDisplay();
        this.complete(`성공! 포구 생명력 ${Math.round(state.life)}을 채웠습니다.`);
        return;
      }

      this.updateFishingDisplay();
    }

    handleKeyDown(event) {
      if (!this.game) return;
      this.keys.add(event.code);
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"].includes(event.code)) {
        event.preventDefault();
      }
      if (event.repeat && this.game.type !== "hold" && this.game.type !== "balance") return;

      if (event.code === "Escape") {
        this.close();
        return;
      }
      if (this.game.type === "timing" && event.code === "Space") this.handleTimingSpace();
      else if (this.game.type === "hold" && event.code === "Space") this.state.holding = true;
      else if (this.game.type === "mash" && event.code === "Space") this.handleMashSpace();
      else if (this.game.type === "collect") this.handleCollectMove(event.code);
      else if (this.game.type === "diver" && event.code === "Space") this.handleDiverSpaceDown();
      else if (this.game.type === "fishing" && event.code === "Space") this.handleFishingDrop();
      else if (this.game.type === "fishing") this.handleFishingMove(event.code);
    }

    handleKeyUp(event) {
      if (!this.game) return;
      if (this.game.type === "hold" && event.code === "Space" && this.state) this.state.holding = false;
      if (this.game.type === "mash" && event.code === "Space" && this.state) this.state.spaceDown = false;
      if (this.game.type === "diver" && event.code === "Space" && this.state) this.handleDiverSpaceUp();
      this.keys.delete(event.code);
    }
  }

  function create(options) {
    return new CultureMinigames(options);
  }

  const api = {
    create,
    cloneGames,
    injectStyles,
    regionKeys: Object.keys(GAME_DEFINITIONS),
    removeRegionGames,
    replaceRegionGames,
    games: GAME_DEFINITIONS,
  };

  global.KoreaCultureMinigames = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
