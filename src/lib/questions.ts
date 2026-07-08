// TSC 3급 자기소개(1부) 연습 문제 데이터
// prepSec: 준비 시간(초), answerSec: 답변 시간(초) — 실제 시험 1부 기준으로 잡음

export interface Question {
	id: string;
	section: number; // 시험 부분 번호 (1, 2, ...)
	part: string; // 시험 부분 표시 라벨
	scene?: string; // 2부용: 그림 상황을 글로 묘사 (실제 시험의 이미지 대체)
	prompt: string; // 중국어 질문
	promptPinyin: string; // 질문 병음
	promptKo: string; // 질문 한국어 해석
	sample: string; // 모범 답변(중국어)
	samplePinyin: string; // 모범 답변 병음
	sampleKo: string; // 모범 답변 한국어 해석
	// 자동 채점(음성인식 글자 비교)에 쓰는 핵심 문장.
	// 인사말/군더더기를 뺀 부분만 넣어 부당 감점을 막는다. 없으면 sample을 사용.
	scoreTarget?: string;
	tip?: string; // 발음/성조 팁
	prepSec: number;
	answerSec: number;
}

export const questions: Question[] = [
	{
		id: 'name',
		section: 1,
		part: '第1部分 · 이름',
		prompt: '你叫什么名字？',
		promptPinyin: 'Nǐ jiào shénme míngzi?',
		promptKo: '이름이 무엇입니까?',
		sample: '你好，我叫金松炫。',
		samplePinyin: 'Nǐ hǎo, wǒ jiào Jīn Sōng Xuàn.',
		sampleKo: '안녕하세요, 저는 김송현입니다.',
		scoreTarget: '我叫金松炫',
		tip: 'Jīn(1성)·Sōng(1성)은 높고 평평하게 → Xuàn(4성)은 위에서 아래로 툭↘',
		prepSec: 3,
		answerSec: 10
	},
	{
		id: 'birthday',
		section: 1,
		part: '第1部分 · 생일',
		prompt: '你的生日是几月几号？',
		promptPinyin: 'Nǐ de shēngrì shì jǐ yuè jǐ hào?',
		promptKo: '생일이 몇 월 며칠입니까?',
		sample: '我的生日是九月三号。',
		samplePinyin: 'Wǒ de shēngrì shì jiǔ yuè sān hào.',
		sampleKo: '제 생일은 9월 3일입니다.',
		tip: '九(jiǔ, 3성 "지오우")·三(sān, 1성 "싼")',
		prepSec: 3,
		answerSec: 10
	},
	{
		id: 'family',
		section: 1,
		part: '第1部分 · 가족',
		prompt: '你家有几口人？',
		promptPinyin: 'Nǐ jiā yǒu jǐ kǒu rén?',
		promptKo: '가족이 몇 명입니까?',
		sample: '我家有三口人，爸爸、妈妈和我。现在我一个人住。',
		samplePinyin: 'Wǒ jiā yǒu sān kǒu rén, bàba, māma hé wǒ. Xiànzài wǒ yí ge rén zhù.',
		sampleKo: '저희 가족은 세 명이고, 아빠, 엄마 그리고 저입니다. 지금은 혼자 살고 있습니다.',
		tip: '一个人(yí ge rén)의 一는 2성(yí)으로 변조',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'job',
		section: 1,
		part: '第1部分 · 직업',
		prompt: '你在哪儿工作？',
		promptPinyin: 'Nǐ zài nǎr gōngzuò?',
		promptKo: '어디에서 일합니까?',
		sample: '我在一家公司工作。',
		samplePinyin: 'Wǒ zài yì jiā gōngsī gōngzuò.',
		sampleKo: '저는 한 회사에서 일합니다.',
		tip: '一家(yì jiā)의 一는 4성(yì)으로 변조. gōngsī·gōngzuò 성조 조심',
		prepSec: 3,
		answerSec: 10
	},
	{
		id: 'hobby',
		section: 1,
		part: '第1部分 · 취미',
		prompt: '你有什么爱好？',
		promptPinyin: 'Nǐ yǒu shénme àihào?',
		promptKo: '취미가 무엇입니까?',
		sample: '我的爱好是听音乐和看电影。工作以后，我常常一个人在家看电影，觉得很轻松。',
		samplePinyin:
			'Wǒ de àihào shì tīng yīnyuè hé kàn diànyǐng. Gōngzuò yǐhòu, wǒ chángcháng yí ge rén zài jiā kàn diànyǐng, juéde hěn qīngsōng.',
		sampleKo:
			'제 취미는 음악 감상과 영화 보기입니다. 퇴근 후에 자주 혼자 집에서 영화를 보는데, 아주 편안하다고 느낍니다.',
		tip: '爱好(àihào) 4성+4성, 轻松(qīngsōng) 1성+1성',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'full',
		section: 1,
		part: '통합 · 전체 자기소개',
		prompt: '请简单介绍一下你自己。',
		promptPinyin: 'Qǐng jiǎndān jièshào yíxià nǐ zìjǐ.',
		promptKo: '간단히 자기소개를 해보세요.',
		sample:
			'你好，我叫金松炫。我的生日是九月三号。我家有三口人，爸爸、妈妈和我，现在我一个人住。我在一家公司工作。我的爱好是听音乐和看电影。谢谢。',
		scoreTarget:
			'我叫金松炫我的生日是九月三号我家有三口人爸爸妈妈和我现在我一个人住我在一家公司工作我的爱好是听音乐和看电影',
		samplePinyin:
			'Nǐ hǎo, wǒ jiào Jīn Sōng Xuàn. Wǒ de shēngrì shì jiǔ yuè sān hào. Wǒ jiā yǒu sān kǒu rén, bàba, māma hé wǒ, xiànzài wǒ yí ge rén zhù. Wǒ zài yì jiā gōngsī gōngzuò. Wǒ de àihào shì tīng yīnyuè hé kàn diànyǐng. Xièxie.',
		sampleKo:
			'안녕하세요, 저는 김송현입니다. 생일은 9월 3일입니다. 저희 가족은 세 명이고 아빠, 엄마 그리고 저인데, 지금은 혼자 삽니다. 저는 회사에 다닙니다. 제 취미는 음악 감상과 영화 보기입니다. 감사합니다.',
		tip: '문장 사이를 너무 붙이지 말고 또박또박. 끝은 차분하게 내려서 마무리',
		prepSec: 10,
		answerSec: 40
	},

	// ─── 第2部分: 그림 보고 문장 완성 ──────────────────
	// 실제 시험은 이미지가 나오지만, 여기서는 상황을 글(scene)로 묘사한다.
	// 핵심: 기본 어순(주어+동사+목적어) + 양사 + 존재문(有/在).
	{
		id: 'p2-book',
		section: 2,
		part: '第2部分 · 그림 묘사',
		scene: '책상 위에 책 세 권이 놓여 있는 그림',
		prompt: '请看图说一句话。（桌子、书）',
		promptPinyin: 'Qǐng kàn tú shuō yí jù huà. (zhuōzi, shū)',
		promptKo: '그림을 보고 한 문장으로 말하세요. (책상, 책)',
		sample: '桌子上有三本书。',
		samplePinyin: 'Zhuōzi shàng yǒu sān běn shū.',
		sampleKo: '책상 위에 책 세 권이 있습니다.',
		scoreTarget: '桌子上有三本书',
		tip: '존재문 「~上有~」 + 양사 「本(běn, 책 세는 단위)」. 三本(sān běn)',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p2-study',
		section: 2,
		part: '第2部分 · 그림 묘사',
		scene: '학생이 교실에서 책을 읽고 있는 그림',
		prompt: '请看图说一句话。（学生、看书）',
		promptPinyin: 'Qǐng kàn tú shuō yí jù huà. (xuésheng, kàn shū)',
		promptKo: '그림을 보고 한 문장으로 말하세요. (학생, 책 읽다)',
		sample: '学生在教室里看书。',
		samplePinyin: 'Xuésheng zài jiàoshì lǐ kàn shū.',
		sampleKo: '학생이 교실에서 책을 읽고 있습니다.',
		scoreTarget: '学生在教室里看书',
		tip: '장소문 「在~里」 + 동사구. 在(zài)+장소+동작 어순',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p2-weather',
		section: 2,
		part: '第2部分 · 그림 묘사',
		scene: '비가 내려서 사람들이 우산을 쓰고 걷는 그림',
		prompt: '请看图说一句话。（下雨、雨伞）',
		promptPinyin: 'Qǐng kàn tú shuō yí jù huà. (xià yǔ, yǔsǎn)',
		promptKo: '그림을 보고 한 문장으로 말하세요. (비 오다, 우산)',
		sample: '今天下雨，人们都打着雨伞。',
		samplePinyin: 'Jīntiān xià yǔ, rénmen dōu dǎzhe yǔsǎn.',
		sampleKo: '오늘 비가 와서 사람들이 모두 우산을 쓰고 있습니다.',
		scoreTarget: '今天下雨人们都打着雨伞',
		tip: '진행·상태 「打着(dǎzhe)」의 着(zhe). 간단히 「今天下雨，我打雨伞」도 OK',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p2-restaurant',
		section: 2,
		part: '第2部分 · 그림 묘사',
		scene: '식당에서 가족이 함께 밥을 먹고 있는 그림',
		prompt: '请看图说一句话。（饭馆、吃饭）',
		promptPinyin: 'Qǐng kàn tú shuō yí jù huà. (fànguǎn, chī fàn)',
		promptKo: '그림을 보고 한 문장으로 말하세요. (식당, 밥 먹다)',
		sample: '他们一家人在饭馆吃饭。',
		samplePinyin: 'Tāmen yì jiā rén zài fànguǎn chī fàn.',
		sampleKo: '그들 가족이 식당에서 밥을 먹고 있습니다.',
		scoreTarget: '他们一家人在饭馆吃饭',
		tip: '「在+장소+동작」. 一家人(yì jiā rén, 온 가족)',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p2-buy',
		section: 2,
		part: '第2部分 · 그림 묘사',
		scene: '가게에서 사과 여러 개를 사는 그림',
		prompt: '请看图说一句话。（商店、买苹果）',
		promptPinyin: 'Qǐng kàn tú shuō yí jù huà. (shāngdiàn, mǎi píngguǒ)',
		promptKo: '그림을 보고 한 문장으로 말하세요. (가게, 사과 사다)',
		sample: '我在商店买了几个苹果。',
		samplePinyin: 'Wǒ zài shāngdiàn mǎi le jǐ ge píngguǒ.',
		sampleKo: '저는 가게에서 사과 몇 개를 샀습니다.',
		scoreTarget: '我在商店买了几个苹果',
		tip: '완료 「买了(mǎi le)」 + 양사 「个(ge)」. 几个(jǐ ge, 몇 개)',
		prepSec: 3,
		answerSec: 15
	}
];
