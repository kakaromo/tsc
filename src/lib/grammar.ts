// 第2部分(그림 보고 문장) 핵심 문법 패턴.
// 3급 그림 묘사에서 반복되는 문형을 공식·예문으로 정리.

export interface GrammarExample {
	cn: string;
	pinyin: string;
	ko: string;
}

export interface GrammarPoint {
	title: string; // 문법 이름
	formula: string; // 공식 (어순)
	desc: string; // 설명
	examples: GrammarExample[];
	warn?: string; // 자주 하는 실수
}

export const grammarPoints: GrammarPoint[] = [
	{
		title: '① 기본 어순 (SVO)',
		formula: '주어 + 동사 + 목적어',
		desc: '중국어의 기본은 「누가 + 무엇을 하다 + 무엇을」. 한국어와 달리 동사가 목적어 앞!',
		examples: [
			{ cn: '我看书。', pinyin: 'Wǒ kàn shū.', ko: '나는 책을 본다.' },
			{ cn: '他吃苹果。', pinyin: 'Tā chī píngguǒ.', ko: '그는 사과를 먹는다.' }
		],
		warn: '「我书看」(X) — 한국어 어순으로 말하면 틀려요. 동사가 먼저!'
	},
	{
		title: '② 존재문 「有」',
		formula: '장소 + 上/里 + 有 + (수+양사) + 사물',
		desc: '「~에 ~이 있다」. 그림에 뭐가 있는지 말할 때 가장 많이 씀.',
		examples: [
			{ cn: '桌子上有三本书。', pinyin: 'Zhuōzi shàng yǒu sān běn shū.', ko: '책상 위에 책 세 권이 있다.' },
			{ cn: '房间里有一个人。', pinyin: 'Fángjiān lǐ yǒu yí ge rén.', ko: '방 안에 한 사람이 있다.' }
		],
		warn: '장소 뒤에 上(위)/里(안)를 빠뜨리기 쉬워요. 「桌子有书」보다 「桌子上有书」가 자연스러움.'
	},
	{
		title: '③ 소재문 「在」',
		formula: '사람/사물 + 在 + 장소',
		desc: '「~이 ~에 있다」. 有와 반대로, 주어가 먼저 오고 장소가 뒤.',
		examples: [
			{ cn: '学生在教室里。', pinyin: 'Xuésheng zài jiàoshì lǐ.', ko: '학생이 교실에 있다.' },
			{ cn: '书在桌子上。', pinyin: 'Shū zài zhuōzi shàng.', ko: '책이 책상 위에 있다.' }
		],
		warn: '有 vs 在: 「장소有사물」(장소에 뭐가 있다) ↔ 「사물在장소」(뭐가 어디에 있다). 주어가 다름!'
	},
	{
		title: '④ 수량 표현 (수+양사)',
		formula: '숫자 + 양사 + 명사',
		desc: '개수를 말할 땐 반드시 숫자와 명사 사이에 양사를 넣어야 함.',
		examples: [
			{ cn: '两本书', pinyin: 'liǎng běn shū', ko: '책 두 권' },
			{ cn: '三个苹果', pinyin: 'sān ge píngguǒ', ko: '사과 세 개' },
			{ cn: '一张桌子', pinyin: 'yì zhāng zhuōzi', ko: '책상 하나' }
		],
		warn: '「两」 주의! 개수를 셀 땐 二가 아니라 两을 씀. 二本(X) → 两本(O).'
	},
	{
		title: '⑤ 진행·상태 (在 / 着)',
		formula: '주어 + 在 + 동작  /  동작 + 着',
		desc: '「~하고 있다」(진행)는 동사 앞 在, 「~한 채로」(지속)는 동사 뒤 着.',
		examples: [
			{ cn: '他在看书。', pinyin: 'Tā zài kàn shū.', ko: '그는 책을 보고 있다.' },
			{ cn: '人们打着雨伞。', pinyin: 'Rénmen dǎzhe yǔsǎn.', ko: '사람들이 우산을 쓰고 있다.' }
		],
		warn: '3급에선 굳이 着 안 써도 됨. 어려우면 「在+동사」 진행형만 써도 충분해요.'
	},
	{
		title: '⑥ 완료 「了」',
		formula: '주어 + 동사 + 了 + 목적어',
		desc: '동작이 이미 끝났음을 나타냄. 「~했다」.',
		examples: [
			{ cn: '我买了几个苹果。', pinyin: 'Wǒ mǎi le jǐ ge píngguǒ.', ko: '나는 사과 몇 개를 샀다.' },
			{ cn: '他吃了饭。', pinyin: 'Tā chī le fàn.', ko: '그는 밥을 먹었다.' }
		]
	},
	{
		title: '⑦ 꾸미기 「的」',
		formula: '수식어 + 的 + 명사',
		desc: '「~한 ~」. 색깔·소유 등으로 명사를 꾸밀 때 的로 연결.',
		examples: [
			{ cn: '红色的苹果', pinyin: 'hóngsè de píngguǒ', ko: '빨간 사과' },
			{ cn: '我的书', pinyin: 'wǒ de shū', ko: '나의 책' }
		]
	}
];
