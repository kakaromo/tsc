// 2부 그림 문항용 SVG 일러스트.
// 각 문항 id에 대응하는 간단한 선화(line art). 외부 의존 없이 앱에 내장된다.
// viewBox 300x200, 다크 배경에서 잘 보이도록 밝은 선(stroke) 사용.

const stroke = '#cbd5e1';
const accent = '#7cc6ff';

// 공통 래퍼
function wrap(inner: string): string {
	return `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" role="img"
	  fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
	  ${inner}
	</svg>`;
}

// 桌子上有三本书 — 책상 위에 책 세 권
const book = wrap(`
  <!-- 책상 -->
  <line x1="40" y1="150" x2="260" y2="150" />
  <line x1="60" y1="150" x2="60" y2="185" />
  <line x1="240" y1="150" x2="240" y2="185" />
  <!-- 책 3권 (세워서) -->
  <rect x="110" y="95" width="16" height="55" rx="2" stroke="${accent}" />
  <rect x="130" y="88" width="16" height="62" rx="2" />
  <rect x="150" y="100" width="16" height="50" rx="2" stroke="${accent}" />
`);

// 学生在教室里看书 — 학생이 교실에서 책을 읽음
const study = wrap(`
  <!-- 사람 -->
  <circle cx="130" cy="70" r="18" />
  <path d="M130 88 L130 135" />
  <path d="M130 100 L100 120" />
  <path d="M130 100 L160 118" />
  <path d="M130 135 L114 175" />
  <path d="M130 135 L146 175" />
  <!-- 펼친 책 -->
  <path d="M150 120 L185 112 L185 140 L150 148 Z" stroke="${accent}" />
  <line x1="167" y1="116" x2="167" y2="144" stroke="${accent}" />
  <!-- 칠판 -->
  <rect x="30" y="30" width="70" height="45" rx="3" />
`);

// 今天下雨，人们都打着雨伞 — 비 오고 우산
const weather = wrap(`
  <!-- 구름 -->
  <path d="M90 55 q-25 0 -25 22 q0 18 22 18 h70 q26 0 26 -24 q0 -22 -26 -22 q-4 -20 -30 -20 q-30 0 -37 26" />
  <!-- 빗줄기 -->
  <line x1="90" y1="100" x2="82" y2="118" stroke="${accent}" />
  <line x1="120" y1="100" x2="112" y2="118" stroke="${accent}" />
  <line x1="150" y1="100" x2="142" y2="118" stroke="${accent}" />
  <!-- 우산 -->
  <path d="M175 150 q0 -35 35 -35 q35 0 35 35 Z" stroke="${accent}" />
  <line x1="210" y1="150" x2="210" y2="182" />
  <path d="M210 182 q-8 0 -8 -8" />
`);

// 他们一家人在饭馆吃饭 — 가족이 식당에서 밥
const restaurant = wrap(`
  <!-- 식탁 -->
  <ellipse cx="150" cy="140" rx="90" ry="20" />
  <!-- 접시 3개 -->
  <ellipse cx="110" cy="138" rx="18" ry="7" stroke="${accent}" />
  <ellipse cx="150" cy="145" rx="18" ry="7" stroke="${accent}" />
  <ellipse cx="190" cy="138" rx="18" ry="7" stroke="${accent}" />
  <!-- 두 사람 머리 -->
  <circle cx="95" cy="70" r="15" />
  <path d="M95 85 L95 120" />
  <circle cx="205" cy="70" r="15" />
  <path d="M205 85 L205 120" />
`);

// 我在商店买了几个苹果 — 가게에서 사과 사기
const buy = wrap(`
  <!-- 장바구니 -->
  <path d="M95 120 L105 170 L175 170 L185 120 Z" />
  <path d="M110 120 L120 95 L160 95 L170 120" />
  <!-- 사과들 -->
  <circle cx="120" cy="140" r="12" stroke="${accent}" />
  <circle cx="145" cy="148" r="12" stroke="${accent}" />
  <circle cx="160" cy="135" r="12" stroke="${accent}" />
  <!-- 가격표 -->
  <path d="M215 60 l25 0 l0 25 l-15 15 l-25 0 l0 -25 Z" />
  <circle cx="222" cy="72" r="2.5" fill="${stroke}" />
`);

export const scenes: Record<string, string> = {
	'p2-book': book,
	'p2-study': study,
	'p2-weather': weather,
	'p2-restaurant': restaurant,
	'p2-buy': buy
};
