// ===== 메뉴 데이터 (매장별로 JSON 파일로 분리 가능) =====
const menuDatabase = {
  "default": {
    store: "음성 키오스크",
    categories: [
      {
        id: "burger",
        name: "버거",
        keywords: ["버거", "햄버거", "버거류"],
        items: [
          { id: 1, name: "와퍼", price: 7900, keywords: ["와퍼"] },
          { id: 2, name: "치즈버거", price: 4500, keywords: ["치즈버거", "치즈 버거"] },
          { id: 3, name: "불고기버거", price: 4000, keywords: ["불고기버거", "불고기 버거", "불고기"] },
          { id: 4, name: "더블버거", price: 5900, keywords: ["더블버거", "더블 버거"] }
        ]
      },
      {
        id: "chicken",
        name: "치킨",
        keywords: ["치킨", "닭", "후라이드"],
        items: [
          { id: 10, name: "후라이드치킨", price: 6500, keywords: ["후라이드", "후라이드 치킨", "후라이드치킨"] },
          { id: 11, name: "양념치킨", price: 7000, keywords: ["양념", "양념 치킨", "양념치킨"] },
          { id: 12, name: "닭다리", price: 3500, keywords: ["닭다리"] }
        ]
      },
      {
        id: "drink",
        name: "음료",
        keywords: ["음료", "음료수", "드링크", "마실것"],
        items: [
          { id: 20, name: "콜라", price: 2000, keywords: ["콜라"] },
          { id: 21, name: "사이다", price: 2000, keywords: ["사이다"] },
          { id: 22, name: "오렌지주스", price: 2500, keywords: ["오렌지주스", "오렌지 주스", "오렌지"] },
          { id: 23, name: "아메리카노", price: 3000, keywords: ["아메리카노", "아메"] }
        ]
      },
      {
        id: "side",
        name: "사이드",
        keywords: ["사이드", "곁들임", "추가"],
        items: [
          { id: 30, name: "감자튀김", price: 2500, keywords: ["감자튀김", "감자", "튀김"] },
          { id: 31, name: "어니언링", price: 2800, keywords: ["어니언링", "어니언"] },
          { id: 32, name: "콘샐러드", price: 2200, keywords: ["콘샐러드", "샐러드", "콘"] }
        ]
      }
    ]
  },
  "store001": {
    store: "맛있는 분식점",
    categories: [
      {
        id: "noodle",
        name: "면류",
        keywords: ["면", "면류", "국수"],
        items: [
          { id: 1, name: "라면", price: 3000, keywords: ["라면"] },
          { id: 2, name: "우동", price: 4000, keywords: ["우동"] },
          { id: 3, name: "짜장면", price: 5000, keywords: ["짜장면", "짜장"] }
        ]
      },
      {
        id: "rice",
        name: "밥류",
        keywords: ["밥", "밥류", "볶음밥"],
        items: [
          { id: 10, name: "볶음밥", price: 5000, keywords: ["볶음밥"] },
          { id: 11, name: "김밥", price: 3000, keywords: ["김밥"] }
        ]
      }
    ]
  }
};

// 현재 매장 메뉴 (app.js에서 설정됨)
let menuData = null;