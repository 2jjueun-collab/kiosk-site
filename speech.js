// ============================================================
//  TTS (음성 출력)
// ============================================================
let isSpeaking = false;

function speak(text) {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = 0.88;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // 한국어 음성 선택
    const voices = synth.getVoices();
    const koVoice = voices.find(
      (v) => v.lang === "ko-KR" || v.lang === "ko_KR"
    );
    if (koVoice) utterance.voice = koVoice;

    isSpeaking = true;
    document.getElementById("voice-output").textContent = text;

    utterance.onend = () => {
      isSpeaking = false;
      resolve();
    };
    utterance.onerror = () => {
      isSpeaking = false;
      resolve();
    };

    synth.speak(utterance);
  });
}

// ============================================================
//  음성 인식 (SpeechRecognition)
// ============================================================
let recognition = null;
let isListening = false;

function startRecognition(onResult, onError) {
  if (isListening) stopRecognition();

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    alert("이 브라우저는 음성 인식을 지원하지 않습니다.\nChrome(안드로이드)을 사용해주세요.");
    return;
  }

  recognition = new SR();
  recognition.lang = "ko-KR";
  recognition.interimResults = false;
  recognition.maxAlternatives = 5;
  recognition.continuous = false;

  recognition.onstart = () => {
    isListening = true;
    setMicActive(true);
    document.getElementById("status-text").textContent = "🎤 말씀해주세요...";
  };

  recognition.onresult = (e) => {
    isListening = false;
    setMicActive(false);
    // 모든 후보 결과 모아서 처리
    const transcripts = Array.from(e.results[0]).map((r) => r.transcript.trim());
    console.log("인식 결과:", transcripts);
    onResult(transcripts[0], transcripts);
  };

  recognition.onerror = (e) => {
    isListening = false;
    setMicActive(false);
    console.error("인식 오류:", e.error);
    if (onError) onError(e.error);
  };

  recognition.onend = () => {
    isListening = false;
    setMicActive(false);
  };

  recognition.start();
}

function stopRecognition() {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
  isListening = false;
  setMicActive(false);
}

function setMicActive(active) {
  const indicator = document.getElementById("mic-indicator");
  const micText = document.getElementById("mic-text");
  if (active) {
    indicator.classList.add("mic-active");
    micText.textContent = "인식 중...";
  } else {
    indicator.classList.remove("mic-active");
    micText.textContent = "대기 중";
  }
}

// 음성 목록 로드 (비동기 초기화)
function initVoices() {
  return new Promise((resolve) => {
    if (speechSynthesis.getVoices().length > 0) return resolve();
    speechSynthesis.onvoiceschanged = resolve;
    setTimeout(resolve, 2000); // 최대 2초 대기
  });
}