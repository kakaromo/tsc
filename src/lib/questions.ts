// TSC 3급 연습 문제 데이터 — 1부(자기소개)·2부(그림)·3부(대화 완성)·4부(일상 화제)
// 실제 시험 빈출 유형·주제 위주로 구성. 모든 문항에 병음·해석·성조 팁 포함.
// prepSec: 준비 시간(초), answerSec: 답변 시간(초)

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
		sample: '我家有三口人，爸爸、妈妈和我。',
		samplePinyin: 'Wǒ jiā yǒu sān kǒu rén, bàba, māma hé wǒ.',
		sampleKo: '저희 가족은 세 명이고, 아빠, 엄마 그리고 저입니다.',
		scoreTarget: '我家有三口人爸爸妈妈和我',
		tip: '식구는 양사 口(kǒu)로 셈: 三口人(sān kǒu rén)',
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
		sample: '我的爱好是看电影。我常常在家看电影。',
		samplePinyin: 'Wǒ de àihào shì kàn diànyǐng. Wǒ chángcháng zài jiā kàn diànyǐng.',
		sampleKo: '제 취미는 영화 보기입니다. 저는 자주 집에서 영화를 봅니다.',
		scoreTarget: '我的爱好是看电影我常常在家看电影',
		tip: '爱好(àihào) 4성+4성. 常常(chángcháng, 자주)은 동사 앞에',
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
			'你好，我叫金松炫。我的生日是九月三号。我家有三口人，爸爸、妈妈和我。我在一家公司工作。我的爱好是看电影。谢谢。',
		scoreTarget:
			'我叫金松炫我的生日是九月三号我家有三口人爸爸妈妈和我我在一家公司工作我的爱好是看电影',
		samplePinyin:
			'Nǐ hǎo, wǒ jiào Jīn Sōng Xuàn. Wǒ de shēngrì shì jiǔ yuè sān hào. Wǒ jiā yǒu sān kǒu rén, bàba, māma hé wǒ. Wǒ zài yì jiā gōngsī gōngzuò. Wǒ de àihào shì kàn diànyǐng. Xièxie.',
		sampleKo:
			'안녕하세요, 저는 김송현입니다. 생일은 9월 3일입니다. 저희 가족은 세 명이고 아빠, 엄마 그리고 저입니다. 저는 한 회사에서 일합니다. 제 취미는 영화 보기입니다. 감사합니다.',
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
	},
	{
		id: 'p2-time',
		section: 2,
		part: '第2部分 · 그림 묘사',
		scene: '벽시계가 2시를 가리키는 그림',
		prompt: '现在几点？',
		promptPinyin: 'Xiànzài jǐ diǎn?',
		promptKo: '지금 몇 시입니까?',
		sample: '现在两点。',
		samplePinyin: 'Xiànzài liǎng diǎn.',
		sampleKo: '지금 2시입니다.',
		scoreTarget: '现在两点',
		tip: '시각 앞의 2는 二가 아니라 两(liǎng)! 两点(liǎng diǎn)',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p2-price',
		section: 2,
		part: '第2部分 · 그림 묘사',
		scene: '사과에 3위안(元) 가격표가 붙어 있는 그림',
		prompt: '一个苹果多少钱？',
		promptPinyin: 'Yí ge píngguǒ duōshao qián?',
		promptKo: '사과 한 개에 얼마입니까?',
		sample: '一个苹果三块钱。',
		samplePinyin: 'Yí ge píngguǒ sān kuài qián.',
		sampleKo: '사과 한 개에 3위안입니다.',
		scoreTarget: '一个苹果三块钱',
		tip: '돈 단위는 구어에서 块(kuài). 多少钱(duōshao qián, 얼마예요)은 통째로 암기',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p2-cat',
		section: 2,
		part: '第2部分 · 그림 묘사',
		scene: '고양이가 의자 아래에 앉아 있는 그림',
		prompt: '猫在哪儿？',
		promptPinyin: 'Māo zài nǎr?',
		promptKo: '고양이는 어디에 있습니까?',
		sample: '猫在椅子下边。',
		samplePinyin: 'Māo zài yǐzi xiàbian.',
		sampleKo: '고양이는 의자 아래에 있습니다.',
		scoreTarget: '猫在椅子下边',
		tip: '소재문 「在+장소」. 방위사 下边(xiàbian, 아래쪽)·上边(shàngbian, 위쪽)',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p2-tv',
		section: 2,
		part: '第2部分 · 그림 묘사',
		scene: '남자가 소파에 앉아 TV를 보고 있는 그림',
		prompt: '他在做什么？',
		promptPinyin: 'Tā zài zuò shénme?',
		promptKo: '그는 무엇을 하고 있습니까?',
		sample: '他在看电视。',
		samplePinyin: 'Tā zài kàn diànshì.',
		sampleKo: '그는 TV를 보고 있습니다.',
		scoreTarget: '他在看电视',
		tip: '진행 「在+동사」(~하고 있다). 看电视(kàn diànshì)',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p2-people',
		section: 2,
		part: '第2部分 · 그림 묘사',
		scene: '방 안에 두 사람이 서서 이야기하는 그림',
		prompt: '房间里有几个人？',
		promptPinyin: 'Fángjiān lǐ yǒu jǐ ge rén?',
		promptKo: '방 안에 몇 명이 있습니까?',
		sample: '房间里有两个人。',
		samplePinyin: 'Fángjiān lǐ yǒu liǎng ge rén.',
		sampleKo: '방 안에 두 명이 있습니다.',
		scoreTarget: '房间里有两个人',
		tip: '개수를 셀 때도 2는 两(liǎng). 两个人(liǎng ge rén)',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p2-bus',
		section: 2,
		part: '第2部分 · 그림 묘사',
		scene: '남자가 버스를 타러 가는 그림',
		prompt: '他怎么去公司？',
		promptPinyin: 'Tā zěnme qù gōngsī?',
		promptKo: '그는 어떻게 회사에 갑니까?',
		sample: '他坐公共汽车去公司。',
		samplePinyin: 'Tā zuò gōnggòng qìchē qù gōngsī.',
		sampleKo: '그는 버스를 타고 회사에 갑니다.',
		scoreTarget: '他坐公共汽车去公司',
		tip: '교통수단 「坐(zuò)+탈것+去+장소」. 지하철은 坐地铁(zuò dìtiě)',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p2-phone',
		section: 2,
		part: '第2部分 · 그림 묘사',
		scene: '여자가 전화 통화를 하고 있는 그림',
		prompt: '她在做什么？',
		promptPinyin: 'Tā zài zuò shénme?',
		promptKo: '그녀는 무엇을 하고 있습니까?',
		sample: '她在打电话。',
		samplePinyin: 'Tā zài dǎ diànhuà.',
		sampleKo: '그녀는 전화를 하고 있습니다.',
		scoreTarget: '她在打电话',
		tip: '전화하다 = 打电话(dǎ diànhuà). 동사가 打(치다)인 것에 주의',
		prepSec: 3,
		answerSec: 15
	},

	{
		id: 'p2-dog',
		section: 2,
		part: '第2部分 · 그림 묘사',
		scene: '공원에 강아지 두 마리가 있는 그림',
		prompt: '公园里有什么？',
		promptPinyin: 'Gōngyuán lǐ yǒu shénme?',
		promptKo: '공원에 무엇이 있습니까?',
		sample: '公园里有两只狗。',
		samplePinyin: 'Gōngyuán lǐ yǒu liǎng zhī gǒu.',
		sampleKo: '공원에 강아지 두 마리가 있습니다.',
		scoreTarget: '公园里有两只狗',
		tip: '동물 양사는 只(zhī). 两只狗(liǎng zhī gǒu) — 2는 여기서도 两',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p2-coffee',
		section: 2,
		part: '第2部分 · 그림 묘사',
		scene: '여자가 카페에서 커피를 마시는 그림',
		prompt: '她在做什么？',
		promptPinyin: 'Tā zài zuò shénme?',
		promptKo: '그녀는 무엇을 하고 있습니까?',
		sample: '她在喝咖啡。',
		samplePinyin: 'Tā zài hē kāfēi.',
		sampleKo: '그녀는 커피를 마시고 있습니다.',
		scoreTarget: '她在喝咖啡',
		tip: '마시다 = 喝(hē), 먹다 = 吃(chī). 음료엔 반드시 喝',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p2-sleep',
		section: 2,
		part: '第2部分 · 그림 묘사',
		scene: '남자가 침대에서 자고 있는 그림',
		prompt: '他在做什么？',
		promptPinyin: 'Tā zài zuò shénme?',
		promptKo: '그는 무엇을 하고 있습니까?',
		sample: '他在睡觉。',
		samplePinyin: 'Tā zài shuìjiào.',
		sampleKo: '그는 자고 있습니다.',
		scoreTarget: '他在睡觉',
		tip: '睡觉(shuìjiào, 자다) — shuì 4성 + jiào 4성',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p2-snow',
		section: 2,
		part: '第2部分 · 그림 묘사',
		scene: '눈이 내리는 겨울 거리 그림',
		prompt: '今天天气怎么样？',
		promptPinyin: 'Jīntiān tiānqì zěnmeyàng?',
		promptKo: '오늘 날씨가 어떻습니까?',
		sample: '今天下雪，很冷。',
		samplePinyin: 'Jīntiān xià xuě, hěn lěng.',
		sampleKo: '오늘 눈이 오고, 아주 춥습니다.',
		scoreTarget: '今天下雪很冷',
		tip: '下雪(xià xuě, 눈 오다)·下雨(xià yǔ, 비 오다) — 날씨는 下로 시작',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p2-halftime',
		section: 2,
		part: '第2部分 · 그림 묘사',
		scene: '벽시계가 7시 30분을 가리키는 그림',
		prompt: '现在几点？',
		promptPinyin: 'Xiànzài jǐ diǎn?',
		promptKo: '지금 몇 시입니까?',
		sample: '现在七点半。',
		samplePinyin: 'Xiànzài qī diǎn bàn.',
		sampleKo: '지금 7시 반입니다.',
		scoreTarget: '现在七点半',
		tip: '30분 = 半(bàn). 七点半(qī diǎn bàn, 7시 반)',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p2-clothes',
		section: 2,
		part: '第2部分 · 그림 묘사',
		scene: '여자가 옷가게에서 옷 한 벌을 사는 그림',
		prompt: '她买了什么？',
		promptPinyin: 'Tā mǎi le shénme?',
		promptKo: '그녀는 무엇을 샀습니까?',
		sample: '她买了一件衣服。',
		samplePinyin: 'Tā mǎi le yí jiàn yīfu.',
		sampleKo: '그녀는 옷 한 벌을 샀습니다.',
		scoreTarget: '她买了一件衣服',
		tip: '옷 양사는 件(jiàn). 一件(yí jiàn)의 一는 2성으로 변조',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p2-soccer',
		section: 2,
		part: '第2部分 · 그림 묘사',
		scene: '아이들이 공원에서 축구를 하는 그림',
		prompt: '他们在做什么？',
		promptPinyin: 'Tāmen zài zuò shénme?',
		promptKo: '그들은 무엇을 하고 있습니까?',
		sample: '他们在踢足球。',
		samplePinyin: 'Tāmen zài tī zúqiú.',
		sampleKo: '그들은 축구를 하고 있습니다.',
		scoreTarget: '他们在踢足球',
		tip: '발로 차는 운동은 踢(tī): 踢足球. 손 운동은 打(dǎ): 打篮球',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p2-bedcat',
		section: 2,
		part: '第2部分 · 그림 묘사',
		scene: '침대 위에 고양이 한 마리가 앉아 있는 그림',
		prompt: '床上有什么？',
		promptPinyin: 'Chuáng shàng yǒu shénme?',
		promptKo: '침대 위에 무엇이 있습니까?',
		sample: '床上有一只猫。',
		samplePinyin: 'Chuáng shàng yǒu yì zhī māo.',
		sampleKo: '침대 위에 고양이 한 마리가 있습니다.',
		scoreTarget: '床上有一只猫',
		tip: '존재문 「~上有~」 + 양사 只. 一只(yì zhī)의 一는 4성으로 변조',
		prepSec: 3,
		answerSec: 15
	},

	// ─── 第3部分: 대화 완성 (빠른 응답) ──────────────────
	// 일상 질문을 듣고 바로 대답하는 파트. 실제 시험 빈출 주제:
	// 주말·기상/취침·교통·음식·날씨·운동·쇼핑·약속·학습 이유 등.
	{
		id: 'p3-weekend',
		section: 3,
		part: '第3部分 · 주말',
		prompt: '周末你一般做什么？',
		promptPinyin: 'Zhōumò nǐ yìbān zuò shénme?',
		promptKo: '주말에 보통 무엇을 합니까?',
		sample: '周末我一般在家休息，有时候和朋友一起看电影。',
		samplePinyin: 'Zhōumò wǒ yìbān zài jiā xiūxi, yǒushíhou hé péngyou yìqǐ kàn diànyǐng.',
		sampleKo: '주말에 저는 보통 집에서 쉬고, 가끔 친구와 함께 영화를 봅니다.',
		scoreTarget: '周末我一般在家休息有时候和朋友一起看电影',
		tip: '빈도 표현은 주어 뒤: 一般(yìbān, 보통)·有时候(yǒushíhou, 가끔)',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p3-getup',
		section: 3,
		part: '第3部分 · 기상 시간',
		prompt: '你每天几点起床？',
		promptPinyin: 'Nǐ měitiān jǐ diǎn qǐchuáng?',
		promptKo: '매일 몇 시에 일어납니까?',
		sample: '我每天早上七点起床。',
		samplePinyin: 'Wǒ měitiān zǎoshang qī diǎn qǐchuáng.',
		sampleKo: '저는 매일 아침 7시에 일어납니다.',
		scoreTarget: '我每天早上七点起床',
		tip: '시간사는 동사 앞: 每天早上七点 + 起床(qǐchuáng, 일어나다)',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p3-commute',
		section: 3,
		part: '第3部分 · 교통',
		prompt: '你怎么去公司？',
		promptPinyin: 'Nǐ zěnme qù gōngsī?',
		promptKo: '회사에 어떻게 갑니까?',
		sample: '我坐地铁去公司，大概要三十分钟。',
		samplePinyin: 'Wǒ zuò dìtiě qù gōngsī, dàgài yào sānshí fēnzhōng.',
		sampleKo: '저는 지하철을 타고 회사에 가는데, 대략 30분 걸립니다.',
		scoreTarget: '我坐地铁去公司大概要三十分钟',
		tip: '「要+시간」= ~걸리다. 大概(dàgài, 대략)·地铁(dìtiě, 지하철)',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p3-food',
		section: 3,
		part: '第3部分 · 음식',
		prompt: '你喜欢吃什么菜？',
		promptPinyin: 'Nǐ xǐhuan chī shénme cài?',
		promptKo: '어떤 음식을 좋아합니까?',
		sample: '我喜欢吃中国菜，特别是炒饭，又好吃又便宜。',
		samplePinyin: 'Wǒ xǐhuan chī Zhōngguó cài, tèbié shì chǎofàn, yòu hǎochī yòu piányi.',
		sampleKo: '저는 중국 음식을 좋아하는데, 특히 볶음밥은 맛있고 저렴합니다.',
		scoreTarget: '我喜欢吃中国菜特别是炒饭又好吃又便宜',
		tip: '又A又B(yòu A yòu B): A하기도 하고 B하기도 하다. 特别是(tèbié shì, 특히)',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p3-weather',
		section: 3,
		part: '第3部分 · 날씨',
		prompt: '今天天气怎么样？',
		promptPinyin: 'Jīntiān tiānqì zěnmeyàng?',
		promptKo: '오늘 날씨가 어떻습니까?',
		sample: '今天天气很好，不冷也不热。',
		samplePinyin: 'Jīntiān tiānqì hěn hǎo, bù lěng yě bú rè.',
		sampleKo: '오늘 날씨는 좋습니다. 춥지도 않고 덥지도 않습니다.',
		scoreTarget: '今天天气很好不冷也不热',
		tip: '不의 변조: 4성 앞에서 2성 → 不热(bú rè). 不冷(bù lěng)은 4성 그대로',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p3-sport',
		section: 3,
		part: '第3部分 · 운동',
		prompt: '你喜欢什么运动？',
		promptPinyin: 'Nǐ xǐhuan shénme yùndòng?',
		promptKo: '어떤 운동을 좋아합니까?',
		sample: '我喜欢跑步，一个星期跑三次。',
		samplePinyin: 'Wǒ xǐhuan pǎobù, yí ge xīngqī pǎo sān cì.',
		sampleKo: '저는 달리기를 좋아해서 일주일에 세 번 달립니다.',
		scoreTarget: '我喜欢跑步一个星期跑三次',
		tip: '횟수는 동사 뒤: 跑三次(pǎo sān cì). 次(cì, 번)',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p3-yesterday',
		section: 3,
		part: '第3部分 · 어제 한 일',
		prompt: '你昨天做什么了？',
		promptPinyin: 'Nǐ zuótiān zuò shénme le?',
		promptKo: '어제 무엇을 했습니까?',
		sample: '我昨天和朋友一起吃饭了，我们聊得很开心。',
		samplePinyin: 'Wǒ zuótiān hé péngyou yìqǐ chī fàn le, wǒmen liáo de hěn kāixīn.',
		sampleKo: '저는 어제 친구와 함께 밥을 먹었고, 아주 즐겁게 이야기했습니다.',
		scoreTarget: '我昨天和朋友一起吃饭了我们聊得很开心',
		tip: '완료 了 + 정도보어 「동사+得+형용사」: 聊得很开心(liáo de hěn kāixīn)',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p3-shopping',
		section: 3,
		part: '第3部分 · 쇼핑',
		prompt: '你常去哪儿买东西？',
		promptPinyin: 'Nǐ cháng qù nǎr mǎi dōngxi?',
		promptKo: '어디에 자주 물건을 사러 갑니까?',
		sample: '我常去家附近的超市，那儿的东西又便宜又好。',
		samplePinyin: 'Wǒ cháng qù jiā fùjìn de chāoshì, nàr de dōngxi yòu piányi yòu hǎo.',
		sampleKo: '저는 집 근처 마트에 자주 가는데, 그곳 물건은 싸고 좋습니다.',
		scoreTarget: '我常去家附近的超市那儿的东西又便宜又好',
		tip: '附近(fùjìn, 근처)·超市(chāoshì, 마트)·哪儿(nǎr, 어디)',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p3-free',
		section: 3,
		part: '第3部分 · 약속',
		prompt: '你什么时候有时间？',
		promptPinyin: 'Nǐ shénme shíhou yǒu shíjiān?',
		promptKo: '언제 시간이 있습니까?',
		sample: '我这个星期六有时间，我们一起吃饭吧。',
		samplePinyin: 'Wǒ zhège xīngqīliù yǒu shíjiān, wǒmen yìqǐ chī fàn ba.',
		sampleKo: '저는 이번 주 토요일에 시간이 있어요. 우리 같이 밥 먹어요.',
		scoreTarget: '我这个星期六有时间我们一起吃饭吧',
		tip: '제안의 어기조사 吧(ba): ~하자/~해요. 星期六(xīngqīliù, 토요일)',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p3-chinese',
		section: 3,
		part: '第3部分 · 중국어 학습',
		prompt: '你为什么学习汉语？',
		promptPinyin: 'Nǐ wèi shénme xuéxí Hànyǔ?',
		promptKo: '왜 중국어를 공부합니까?',
		sample: '因为我对中国文化很感兴趣，工作的时候也需要汉语。',
		samplePinyin: 'Yīnwèi wǒ duì Zhōngguó wénhuà hěn gǎn xìngqù, gōngzuò de shíhou yě xūyào Hànyǔ.',
		sampleKo: '중국 문화에 관심이 많고, 일할 때도 중국어가 필요하기 때문입니다.',
		scoreTarget: '因为我对中国文化很感兴趣工作的时候也需要汉语',
		tip: '对~感兴趣(duì ~ gǎn xìngqù, ~에 관심이 있다) 통째로 암기',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p3-coffee',
		section: 3,
		part: '第3部分 · 커피',
		prompt: '你喜欢喝咖啡吗？',
		promptPinyin: 'Nǐ xǐhuan hē kāfēi ma?',
		promptKo: '커피 마시는 것을 좋아합니까?',
		sample: '喜欢，我每天早上都喝一杯咖啡。',
		samplePinyin: 'Xǐhuan, wǒ měitiān zǎoshang dōu hē yì bēi kāfēi.',
		sampleKo: '좋아합니다. 저는 매일 아침 커피 한 잔을 마십니다.',
		scoreTarget: '喜欢我每天早上都喝一杯咖啡',
		tip: '每~都(měi ~ dōu, ~마다 모두). 一杯(yì bēi)의 一는 4성으로 변조',
		prepSec: 3,
		answerSec: 15
	},
	{
		id: 'p3-sleep',
		section: 3,
		part: '第3部分 · 취침 시간',
		prompt: '你晚上一般几点睡觉？',
		promptPinyin: 'Nǐ wǎnshang yìbān jǐ diǎn shuìjiào?',
		promptKo: '밤에 보통 몇 시에 잡니까?',
		sample: '我晚上一般十二点睡觉，有点儿晚。',
		samplePinyin: 'Wǒ wǎnshang yìbān shí\'èr diǎn shuìjiào, yǒudiǎnr wǎn.',
		sampleKo: '저는 밤에 보통 12시에 자는데, 조금 늦은 편입니다.',
		scoreTarget: '我晚上一般十二点睡觉有点儿晚',
		tip: '有点儿(yǒudiǎnr)+형용사: 조금 ~하다(아쉬움 뉘앙스). 十二(shí\'èr)',
		prepSec: 3,
		answerSec: 15
	},

	// ─── 第4部分: 일상 화제 서술 ──────────────────
	// 익숙한 주제에 대해 2~4문장으로 설명하는 파트. 빈출 주제:
	// 취미·가족·계절·주말·여행·휴대폰·운동·친구.
	{
		id: 'p4-hobby',
		section: 4,
		part: '第4部分 · 취미',
		prompt: '请介绍一下你的爱好。',
		promptPinyin: 'Qǐng jièshào yíxià nǐ de àihào.',
		promptKo: '당신의 취미를 소개해 주세요.',
		sample:
			'我的爱好是看电影。我常常周末在家看电影，看电影的时候我觉得很放松。最近我也开始学做菜了，很有意思。',
		samplePinyin:
			'Wǒ de àihào shì kàn diànyǐng. Wǒ chángcháng zhōumò zài jiā kàn diànyǐng, kàn diànyǐng de shíhou wǒ juéde hěn fàngsōng. Zuìjìn wǒ yě kāishǐ xué zuò cài le, hěn yǒu yìsi.',
		sampleKo:
			'제 취미는 영화 보기입니다. 저는 주말에 자주 집에서 영화를 보는데, 영화를 볼 때 아주 편안하다고 느낍니다. 요즘은 요리도 배우기 시작했는데, 아주 재미있습니다.',
		scoreTarget: '我的爱好是看电影我常常周末在家看电影看电影的时候我觉得很放松',
		tip: '放松(fàngsōng, 편안하다)·有意思(yǒu yìsi, 재미있다). 이유·느낌까지 붙여 3~4문장',
		prepSec: 15,
		answerSec: 25
	},
	{
		id: 'p4-family',
		section: 4,
		part: '第4部分 · 가족 소개',
		prompt: '请介绍一下你的家人。',
		promptPinyin: 'Qǐng jièshào yíxià nǐ de jiārén.',
		promptKo: '당신의 가족을 소개해 주세요.',
		sample:
			'我家有三口人，爸爸、妈妈和我。爸爸是公司职员，妈妈是家庭主妇。我们周末常常一起吃饭、聊天，关系很好。',
		samplePinyin:
			'Wǒ jiā yǒu sān kǒu rén, bàba, māma hé wǒ. Bàba shì gōngsī zhíyuán, māma shì jiātíng zhǔfù. Wǒmen zhōumò chángcháng yìqǐ chī fàn, liáotiān, guānxi hěn hǎo.',
		sampleKo:
			'저희 가족은 세 명으로 아빠, 엄마 그리고 저입니다. 아빠는 회사원이고 엄마는 주부입니다. 우리는 주말에 자주 함께 밥을 먹고 이야기를 나누는데, 사이가 아주 좋습니다.',
		scoreTarget: '我家有三口人爸爸妈妈和我爸爸是公司职员妈妈是家庭主妇',
		tip: '직업 표현: 公司职员(gōngsī zhíyuán, 회사원)·家庭主妇(jiātíng zhǔfù, 주부)',
		prepSec: 15,
		answerSec: 25
	},
	{
		id: 'p4-season',
		section: 4,
		part: '第4部分 · 계절',
		prompt: '你最喜欢什么季节？为什么？',
		promptPinyin: 'Nǐ zuì xǐhuan shénme jìjié? Wèi shénme?',
		promptKo: '어떤 계절을 가장 좋아합니까? 왜요?',
		sample:
			'我最喜欢春天。因为春天天气很暖和，花也都开了，很漂亮。春天的时候，我常常去公园散步。',
		samplePinyin:
			'Wǒ zuì xǐhuan chūntiān. Yīnwèi chūntiān tiānqì hěn nuǎnhuo, huā yě dōu kāi le, hěn piàoliang. Chūntiān de shíhou, wǒ chángcháng qù gōngyuán sànbù.',
		sampleKo:
			'저는 봄을 가장 좋아합니다. 봄에는 날씨가 따뜻하고 꽃도 모두 피어서 아주 예쁘기 때문입니다. 봄에는 자주 공원에 산책하러 갑니다.',
		scoreTarget: '我最喜欢春天因为春天天气很暖和花也都开了很漂亮',
		tip: '暖和(nuǎnhuo) — 和가 경성 huo로 읽히는 것 주의. 散步(sànbù, 산책하다)',
		prepSec: 15,
		answerSec: 25
	},
	{
		id: 'p4-weekend',
		section: 4,
		part: '第4部分 · 주말',
		prompt: '你周末一般怎么过？',
		promptPinyin: 'Nǐ zhōumò yìbān zěnme guò?',
		promptKo: '주말을 보통 어떻게 보냅니까?',
		sample:
			'周末我一般睡到九点多起床。上午在家打扫房间，下午和朋友见面，一起喝咖啡、聊天。晚上我喜欢看电视或者看电影。',
		samplePinyin:
			'Zhōumò wǒ yìbān shuì dào jiǔ diǎn duō qǐchuáng. Shàngwǔ zài jiā dǎsǎo fángjiān, xiàwǔ hé péngyou jiànmiàn, yìqǐ hē kāfēi, liáotiān. Wǎnshang wǒ xǐhuan kàn diànshì huòzhě kàn diànyǐng.',
		sampleKo:
			'주말에 저는 보통 9시 넘어까지 자고 일어납니다. 오전에는 집에서 방을 청소하고, 오후에는 친구를 만나 함께 커피를 마시고 이야기합니다. 저녁에는 TV나 영화를 보는 것을 좋아합니다.',
		scoreTarget: '周末我一般睡到九点多起床上午在家打扫房间下午和朋友见面',
		tip: '평서문의 「아니면」은 或者(huòzhě). 还是(háishi)는 의문문에서만',
		prepSec: 15,
		answerSec: 25
	},
	{
		id: 'p4-travel',
		section: 4,
		part: '第4部分 · 여행',
		prompt: '你喜欢旅行吗？请说一说。',
		promptPinyin: 'Nǐ xǐhuan lǚxíng ma? Qǐng shuō yi shuō.',
		promptKo: '여행을 좋아합니까? 말해 보세요.',
		sample:
			'我很喜欢旅行。去年我去了济州岛，那儿的风景非常漂亮。以后我想去中国旅行，一边旅行一边练习汉语。',
		samplePinyin:
			'Wǒ hěn xǐhuan lǚxíng. Qùnián wǒ qù le Jìzhōudǎo, nàr de fēngjǐng fēicháng piàoliang. Yǐhòu wǒ xiǎng qù Zhōngguó lǚxíng, yìbiān lǚxíng yìbiān liànxí Hànyǔ.',
		sampleKo:
			'저는 여행을 아주 좋아합니다. 작년에 제주도에 갔는데, 그곳 풍경이 정말 아름다웠습니다. 나중에 중국에 여행 가서, 여행하면서 중국어를 연습해 보고 싶습니다.',
		scoreTarget: '我很喜欢旅行去年我去了济州岛那儿的风景非常漂亮',
		tip: '一边A一边B(yìbiān A yìbiān B): A하면서 B하다. 旅行(lǚxíng) ü 발음 주의',
		prepSec: 15,
		answerSec: 25
	},
	{
		id: 'p4-phone',
		section: 4,
		part: '第4部分 · 휴대폰',
		prompt: '你常用手机做什么？',
		promptPinyin: 'Nǐ cháng yòng shǒujī zuò shénme?',
		promptKo: '휴대폰으로 주로 무엇을 합니까?',
		sample:
			'我常用手机看新闻、听音乐，也用手机给朋友发短信。不过用手机的时间太长对眼睛不好，所以我想少用一点儿。',
		samplePinyin:
			'Wǒ cháng yòng shǒujī kàn xīnwén, tīng yīnyuè, yě yòng shǒujī gěi péngyou fā duǎnxìn. Búguò yòng shǒujī de shíjiān tài cháng duì yǎnjing bù hǎo, suǒyǐ wǒ xiǎng shǎo yòng yìdiǎnr.',
		sampleKo:
			'저는 휴대폰으로 자주 뉴스를 보고 음악을 듣고, 친구에게 문자도 보냅니다. 하지만 휴대폰을 너무 오래 쓰면 눈에 나빠서, 조금 덜 쓰려고 합니다.',
		scoreTarget: '我常用手机看新闻听音乐也用手机给朋友发短信',
		tip: '发短信(fā duǎnxìn, 문자 보내다)·对~不好(duì ~ bù hǎo, ~에 나쁘다)',
		prepSec: 15,
		answerSec: 25
	},
	{
		id: 'p4-exercise',
		section: 4,
		part: '第4部分 · 운동',
		prompt: '你常做什么运动？',
		promptPinyin: 'Nǐ cháng zuò shénme yùndòng?',
		promptKo: '어떤 운동을 자주 합니까?',
		sample:
			'我常常跑步，一个星期跑三四次，每次跑三十分钟左右。跑步以后，身体越来越健康了，心情也很好。',
		samplePinyin:
			'Wǒ chángcháng pǎobù, yí ge xīngqī pǎo sān sì cì, měi cì pǎo sānshí fēnzhōng zuǒyòu. Pǎobù yǐhòu, shēntǐ yuèláiyuè jiànkāng le, xīnqíng yě hěn hǎo.',
		sampleKo:
			'저는 자주 달리기를 하는데, 일주일에 서너 번, 매번 30분 정도 달립니다. 달리기를 한 후로 몸이 점점 건강해졌고 기분도 좋습니다.',
		scoreTarget: '我常常跑步一个星期跑三四次每次跑三十分钟左右',
		tip: '越来越(yuèláiyuè, 점점 더)+형용사. 左右(zuǒyòu, ~쯤)',
		prepSec: 15,
		answerSec: 25
	},
	{
		id: 'p4-friend',
		section: 4,
		part: '第4部分 · 친구 소개',
		prompt: '请介绍一下你的好朋友。',
		promptPinyin: 'Qǐng jièshào yíxià nǐ de hǎo péngyou.',
		promptKo: '당신의 친한 친구를 소개해 주세요.',
		sample:
			'我有一个好朋友，我们是大学同学，认识十年了。他很聪明，也很亲切，我有困难的时候，他总是帮助我。',
		samplePinyin:
			'Wǒ yǒu yí ge hǎo péngyou, wǒmen shì dàxué tóngxué, rènshi shí nián le. Tā hěn cōngming, yě hěn qīnqiè, wǒ yǒu kùnnan de shíhou, tā zǒngshì bāngzhù wǒ.',
		sampleKo:
			'저에게는 좋은 친구가 한 명 있는데, 우리는 대학 동창으로 안 지 10년이 되었습니다. 그는 똑똑하고 친절해서, 제가 어려울 때 늘 저를 도와줍니다.',
		scoreTarget: '我有一个好朋友我们是大学同学认识十年了',
		tip: '认识十年了(rènshi shí nián le): 안 지 10년 됐다 — 지속의 了. 总是(zǒngshì, 늘)',
		prepSec: 15,
		answerSec: 25
	}
];
