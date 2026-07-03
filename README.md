# 🦯 NFC 연동 시각장애인용 음성 키오스크

## 파일 구조
```
kiosk-site/
├── index.html      ← 메인 페이지
├── style.css       ← 스타일
├── app.js          ← 메인 로직 (상태 관리, 플로우)
├── speech.js       ← TTS + 음성 인식
├── menu.js         ← 메뉴 데이터베이스
├── menu/
│   └── store001.json  ← 매장별 메뉴 JSON
└── README.md
```

## 사용 방법
1. 파일을 Vercel/Netlify에 업로드 (HTTPS 필수)
2. NFC 태그에 URL 기록: https://your-site.com?store=default
3. 안드로이드 Chrome으로 NFC 태깅 → 자동 접속
4. 화면 아무 곳이나 한 번 터치하면 1번, 두 번 터치하면 2번으로 선택

## 주의사항
- 음성 인식은 Android Chrome에서만 정상 작동
- 반드시 HTTPS 환경 필요
- 마이크 권한 허용 필요
