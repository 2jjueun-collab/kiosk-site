// ============================================================
//  상태 정의
// ============================================================
const STATE = {
  INIT:                 "INIT",
  WAIT_MODE_CHOICE:     "WAIT_MODE_CHOICE",     // 카테고리 안내 여부 선택 대기
  LISTENING_CATEGORY:   "LISTENING_CATEGORY",   // 카테고리 음성 인식 중
  ANNOUNCE_MENU:        "ANNOUNCE_MENU",         // 선택한 카테고리 메뉴 안내 중
  LISTENING_MENU:       "LISTENING_MENU",        // 메뉴 음성 인식 중
  CONFIRM_MENU:         "CONFIRM_MENU",          // 메뉴 확인 (1번=맞음 / 2번=다시)
  PAYMENT:              "PAYMENT"                // 결제
};

let currentState = STATE.INIT;
let selectedMenu  = null;
let selectedCategory = null;

// ============================================================
//  앱 초기화
// ============================================================
window.addEventListener("load", async () => {
  await initVoices();          // 음성 목록 로드 대기

  // URL 파라미터로 매장 결정
  const params  = new URLSearchParams(window.location.search);
  const storeId = params.get("store") || "default";
  menuData = menuDatabase[storeId] || menuDatabase["default"];

  document.getElementById("store-name").textContent = menuData.store;

  await startFlow();
});

// ============================================================
//  메인 플로우 시작
// ============================================================
async function startFlow() {
  setState(STATE.WAIT_MODE_CHOICE);

  await speak(
    `안녕하세요. ${menuData.store} 음성 주문 서비스입니다. ` +
    `메뉴 카테고리 안내를 원하시면 1번, ` +
    `메뉴를 이미 알고 계시면 2번을 눌러주세요.`
  );
}

// ============================================================
//  터치 버튼 핸들러
// ============================================================
function handleTouch(btnNum) {
  console.log(`[터치] 상태: ${currentState}, 버튼: ${btnNum}`);

  switch (currentState) {

    case STATE.WAIT_MODE_CHOICE:
      if (btnNum === 1) startCategoryFlow();
      else if (btnNum === 2) startDirectOrderFlow();
      break;

    case STATE.LISTENING_CATEGORY:
      // 터치 시 인식 재시도 안내
      speak("카테고리를 말씀해주세요.").then(() => listenForCategory());
      break;

    case STATE.ANNOUNCE_MENU:
      // 메뉴 안내 중 터치 → 메뉴 인식 시작
      startMenuRecognition();
      break;

    case STATE.LISTENING_MENU:
      speak("주문하실 메뉴를 말씀해주세요.").then(() => listenForMenu());
      break;

    case STATE.CONFIRM_MENU:
      if (btnNum === 1) proceedToPayment();
      else if (btnNum === 2) retryMenu();
      break;

    case STATE.PAYMENT:
      restartApp();
      break;
  }
}

// ============================================================
//  카테고리 안내 플로우
// ============================================================
async function startCategoryFlow() {
  setState(STATE.LISTENING_CATEGORY);

  const catNames = menuData.categories.map((c) => c.name).join(", ");
  await speak(`카테고리는 ${catNames} 입니다. 원하시는 카테고리를 말씀해주세요.`);

  listenForCategory();
}

function listenForCategory() {
  startRecognition(
    async (transcript, allTranscripts) => {
      const matched = findCategory(allTranscripts);
      if (matched) {
        selectedCategory = matched;
        await announceCategoryItems(matched);
      } else {
        await speak("카테고리를 찾지 못했습니다. 다시 말씀해주세요.");
        listenForCategory();
      }
    },
    async (err) => {
      await speak("인식에 실패했습니다. 다시 말씀해주세요.");
      listenForCategory();
    }
  );
}

function findCategory(transcripts) {
  for (const transcript of transcripts) {
    for (const cat of menuData.categories) {
      if (cat.keywords.some((kw) => transcript.includes(kw))) return cat;
    }
  }
  return null;
}

// ============================================================
//  카테고리 메뉴 목록 안내
// ============================================================
async function announceCategoryItems(category) {
  setState(STATE.ANNOUNCE_MENU);

  const itemNames = category.items.map((i) => `${i.name} ${i.price.toLocaleString()}원`).join(", ");
  await speak(
    `${category.name} 메뉴는 ${itemNames} 입니다. ` +
    `주문하실 메뉴를 말씀해주세요.`
  );

  startMenuRecognition();
}

// ============================================================
//  직접 주문 플로우
// ============================================================
async function startDirectOrderFlow() {
  setState(STATE.LISTENING_MENU);
  await speak("주문하실 메뉴를 말씀해주세요.");
  listenForMenu();
}

// ============================================================
//  메뉴 음성 인식
// ============================================================
function startMenuRecognition() {
  setState(STATE.LISTENING_MENU);
  listenForMenu();
}

function listenForMenu() {
  startRecognition(
    async (transcript, allTranscripts) => {
      const matched = findMenuItem(allTranscripts);
      if (matched) {
        selectedMenu = matched;
        await confirmMenuPrompt(matched);
      } else {
        await speak("메뉴를 찾지 못했습니다. 다시 말씀해주세요.");
        listenForMenu();
      }
    },
    async (err) => {
      await speak("인식에 실패했습니다. 다시 시도합니다.");
      listenForMenu();
    }
  );
}

function findMenuItem(transcripts) {
  const searchIn = selectedCategory ? [selectedCategory] : menuData.categories;
  for (const transcript of transcripts) {
    for (const cat of searchIn) {
      for (const item of cat.items) {
        if (item.keywords.some((kw) => transcript.includes(kw))) return item;
      }
    }
  }
  return null;
}

// ============================================================
//  메뉴 확인
// ============================================================
async function confirmMenuPrompt(menu) {
  setState(STATE.CONFIRM_MENU);

  document.getElementById("order-summary").style.display = "block";
  document.getElementById("order-item-name").textContent = menu.name;
  document.getElementById("order-item-price").textContent = menu.price.toLocaleString() + "원";

  await speak(
    `${menu.name}, ${menu.price.toLocaleString()}원 이 맞으시면 1번, ` +
    `아니시면 2번을 눌러주세요.`
  );
}

// ============================================================
//  결제 처리
// ============================================================
async function proceedToPayment() {
  setState(STATE.PAYMENT);

  document.getElementById("order-summary").style.display = "none";
  document.getElementById("payment-menu-name").textContent = selectedMenu.name;
  document.getElementById("payment-price").textContent = selectedMenu.price.toLocaleString() + "원";
  document.getElementById("payment-screen").style.display = "flex";

  await speak(
    `${selectedMenu.name} 주문이 완료되었습니다. ` +
    `${selectedMenu.price.toLocaleString()}원입니다. ` +
    `카운터에서 결제해 주세요.`
  );
}

// ============================================================
//  재시도 / 재시작
// ============================================================
async function retryMenu() {
  selectedMenu = null;
  document.getElementById("order-summary").style.display = "none";

  if (selectedCategory) {
    await speak("다시 메뉴를 말씀해주세요.");
    startMenuRecognition();
  } else {
    await speak("다시 말씀해주세요.");
    startDirectOrderFlow();
  }
}

async function restartApp() {
  selectedMenu = null;
  selectedCategory = null;
  document.getElementById("payment-screen").style.display = "none";
  document.getElementById("order-summary").style.display = "none";
  await startFlow();
}

// ============================================================
//  상태 업데이트
// ============================================================
function setState(newState) {
  currentState = newState;
  const labels = {
    INIT:               "초기화 중",
    WAIT_MODE_CHOICE:   "1번: 카테고리 안내  |  2번: 바로 주문",
    LISTENING_CATEGORY: "카테고리를 말씀해주세요",
    ANNOUNCE_MENU:      "메뉴 안내 중",
    LISTENING_MENU:     "메뉴를 말씀해주세요",
    CONFIRM_MENU:       "1번: 맞아요  |  2번: 다시 말할게요",
    PAYMENT:            "주문 완료"
  };
  document.getElementById("status-text").textContent = labels[newState] || newState;
}