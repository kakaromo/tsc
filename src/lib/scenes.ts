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

// 现在两点 — 벽시계 2시
const time = wrap(`
  <circle cx="150" cy="100" r="60" />
  <!-- 눈금 (12,3,6,9시) -->
  <line x1="150" y1="45" x2="150" y2="55" />
  <line x1="205" y1="100" x2="195" y2="100" />
  <line x1="150" y1="155" x2="150" y2="145" />
  <line x1="95" y1="100" x2="105" y2="100" />
  <!-- 바늘: 2시 정각 -->
  <line x1="150" y1="100" x2="176" y2="85" stroke="${accent}" stroke-width="5" />
  <line x1="150" y1="100" x2="150" y2="58" stroke="${accent}" />
  <circle cx="150" cy="100" r="3" fill="${accent}" stroke="none" />
`);

// 一个苹果三块钱 — 사과와 가격표
const price = wrap(`
  <!-- 사과 -->
  <circle cx="110" cy="120" r="35" stroke="${accent}" />
  <path d="M110 85 q2 -14 14 -18" />
  <path d="M110 85 q-12 -6 -8 -16 q10 -2 12 10" />
  <!-- 가격표 -->
  <rect x="180" y="80" width="75" height="45" rx="6" />
  <line x1="180" y1="80" x2="168" y2="65" />
  <text x="217" y="112" text-anchor="middle" font-size="26" fill="${stroke}" stroke="none"
    font-family="sans-serif">3元</text>
`);

// 猫在椅子下边 — 의자 아래 고양이
const cat = wrap(`
  <!-- 의자 -->
  <line x1="110" y1="30" x2="110" y2="110" />
  <line x1="110" y1="55" x2="185" y2="55" opacity="0.35" />
  <line x1="110" y1="110" x2="190" y2="110" />
  <line x1="120" y1="110" x2="120" y2="175" />
  <line x1="185" y1="110" x2="185" y2="175" />
  <!-- 고양이 (의자 아래) -->
  <ellipse cx="152" cy="155" rx="24" ry="14" stroke="${accent}" />
  <circle cx="178" cy="148" r="11" stroke="${accent}" />
  <path d="M172 139 l-3 -8 l7 4 Z" stroke="${accent}" />
  <path d="M182 138 l3 -8 l4 8 Z" stroke="${accent}" />
  <path d="M128 152 q-10 4 -6 12" stroke="${accent}" />
`);

// 他在看电视 — 소파에서 TV 보기
const tv = wrap(`
  <!-- TV -->
  <rect x="35" y="55" width="85" height="60" rx="4" stroke="${accent}" />
  <line x1="65" y1="115" x2="65" y2="130" />
  <line x1="90" y1="115" x2="90" y2="130" />
  <line x1="50" y1="130" x2="105" y2="130" />
  <!-- 소파 -->
  <path d="M185 165 l0 -45 q0 -10 10 -10 l55 0 q10 0 10 10 l0 45" />
  <line x1="178" y1="165" x2="268" y2="165" />
  <!-- 사람 -->
  <circle cx="222" cy="85" r="14" />
  <path d="M222 99 L222 140" />
  <path d="M222 112 L200 122" />
`);

// 房间里有两个人 — 방 안의 두 사람
const people = wrap(`
  <!-- 방 (벽·바닥) -->
  <rect x="35" y="30" width="230" height="145" rx="4" />
  <!-- 사람 1 -->
  <circle cx="115" cy="80" r="15" />
  <path d="M115 95 L115 140" />
  <path d="M115 108 L98 122" />
  <path d="M115 108 L133 118" />
  <path d="M115 140 L102 168" />
  <path d="M115 140 L128 168" />
  <!-- 사람 2 -->
  <circle cx="190" cy="80" r="15" stroke="${accent}" />
  <path d="M190 95 L190 140" stroke="${accent}" />
  <path d="M190 108 L172 118" stroke="${accent}" />
  <path d="M190 108 L207 122" stroke="${accent}" />
  <path d="M190 140 L177 168" stroke="${accent}" />
  <path d="M190 140 L203 168" stroke="${accent}" />
`);

// 他坐公共汽车去公司 — 버스
const bus = wrap(`
  <!-- 버스 몸체 -->
  <rect x="70" y="60" width="175" height="80" rx="10" stroke="${accent}" />
  <!-- 창문 -->
  <rect x="85" y="75" width="28" height="24" rx="3" />
  <rect x="125" y="75" width="28" height="24" rx="3" />
  <rect x="165" y="75" width="28" height="24" rx="3" />
  <rect x="205" y="75" width="26" height="50" rx="3" />
  <!-- 바퀴 -->
  <circle cx="105" cy="150" r="13" />
  <circle cx="210" cy="150" r="13" />
  <!-- 사람 -->
  <circle cx="45" cy="95" r="11" />
  <path d="M45 106 L45 140" />
  <path d="M45 115 L60 108" />
`);

// 她在打电话 — 전화하는 사람
const phone = wrap(`
  <!-- 사람 -->
  <circle cx="140" cy="75" r="20" />
  <path d="M140 95 L140 155" />
  <path d="M140 110 L110 135" />
  <path d="M140 110 L163 92" />
  <path d="M140 155 L122 190" />
  <path d="M140 155 L158 190" />
  <!-- 휴대폰 (귀 옆) -->
  <rect x="160" y="72" width="12" height="22" rx="3" stroke="${accent}" />
  <!-- 말소리 -->
  <path d="M185 60 q8 8 0 16" stroke="${accent}" />
  <path d="M195 52 q14 12 0 32" stroke="${accent}" />
`);

export const scenes: Record<string, string> = {
	'p2-book': book,
	'p2-study': study,
	'p2-weather': weather,
	'p2-restaurant': restaurant,
	'p2-buy': buy,
	'p2-time': time,
	'p2-price': price,
	'p2-cat': cat,
	'p2-tv': tv,
	'p2-people': people,
	'p2-bus': bus,
	'p2-phone': phone
};
