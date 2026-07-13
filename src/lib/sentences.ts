// 문장 순서 맞추기 게임용 데이터.
// 2부 핵심 문형의 문장을 단어 단위로 쪼갠 것. tokens를 올바른 순서로 배열하면 정답.

export interface SentencePuzzle {
	tokens: string[]; // 정답 순서의 단어들
	pinyin: string;
	ko: string;
	hint?: string; // 문법 힌트
}

export const sentencePuzzles: SentencePuzzle[] = [
	{
		tokens: ['桌子上', '有', '三本', '书'],
		pinyin: 'Zhuōzi shàng yǒu sān běn shū.',
		ko: '책상 위에 책 세 권이 있다.',
		hint: '존재문: 장소 + 有 + 수량 + 사물'
	},
	{
		tokens: ['学生', '在', '教室里', '看书'],
		pinyin: 'Xuésheng zài jiàoshì lǐ kàn shū.',
		ko: '학생이 교실에서 책을 읽는다.',
		hint: '주어 + 在 + 장소 + 동작'
	},
	{
		tokens: ['我', '买了', '几个', '苹果'],
		pinyin: 'Wǒ mǎi le jǐ ge píngguǒ.',
		ko: '나는 사과 몇 개를 샀다.',
		hint: '주어 + 동사+了 + 수량 + 목적어'
	},
	{
		tokens: ['他们', '在', '饭馆', '吃饭'],
		pinyin: 'Tāmen zài fànguǎn chī fàn.',
		ko: '그들이 식당에서 밥을 먹는다.',
		hint: '주어 + 在 + 장소 + 동작'
	},
	{
		tokens: ['今天', '下雨', '人们', '打着雨伞'],
		pinyin: 'Jīntiān xià yǔ, rénmen dǎzhe yǔsǎn.',
		ko: '오늘 비가 와서 사람들이 우산을 쓰고 있다.',
		hint: '시간/날씨 + 주어 + 동작'
	},
	{
		tokens: ['房间里', '有', '一个', '人'],
		pinyin: 'Fángjiān lǐ yǒu yí ge rén.',
		ko: '방 안에 한 사람이 있다.',
		hint: '존재문: 장소 + 有 + 수량 + 사물'
	},
	{
		tokens: ['我', '喝了', '一杯', '水'],
		pinyin: 'Wǒ hē le yì bēi shuǐ.',
		ko: '나는 물 한 잔을 마셨다.',
		hint: '주어 + 동사+了 + 수량(杯) + 목적어'
	},
	{
		tokens: ['书', '在', '桌子上'],
		pinyin: 'Shū zài zhuōzi shàng.',
		ko: '책이 책상 위에 있다.',
		hint: '소재문: 사물 + 在 + 장소'
	},
	{
		tokens: ['他', '在', '看', '电视'],
		pinyin: 'Tā zài kàn diànshì.',
		ko: '그는 TV를 보고 있다.',
		hint: '진행: 주어 + 在 + 동사 + 목적어'
	},
	{
		tokens: ['床上', '有', '一只', '猫'],
		pinyin: 'Chuáng shàng yǒu yì zhī māo.',
		ko: '침대 위에 고양이 한 마리가 있다.',
		hint: '존재문 + 동물 양사 只'
	},
	{
		tokens: ['他', '坐', '地铁', '去', '公司'],
		pinyin: 'Tā zuò dìtiě qù gōngsī.',
		ko: '그는 지하철을 타고 회사에 간다.',
		hint: '교통: 坐 + 탈것 + 去 + 장소'
	},
	{
		tokens: ['她', '买了', '一件', '衣服'],
		pinyin: 'Tā mǎi le yí jiàn yīfu.',
		ko: '그녀는 옷 한 벌을 샀다.',
		hint: '완료 了 + 옷 양사 件'
	},
	{
		tokens: ['我', '每天', '七点', '起床'],
		pinyin: 'Wǒ měitiān qī diǎn qǐchuáng.',
		ko: '나는 매일 7시에 일어난다.',
		hint: '시간사(매일·시각)는 동사 앞'
	},
	{
		tokens: ['他们', '在', '踢', '足球'],
		pinyin: 'Tāmen zài tī zúqiú.',
		ko: '그들은 축구를 하고 있다.',
		hint: '진행 在 + 발 운동은 踢'
	},
	{
		tokens: ['猫', '在', '椅子', '下边'],
		pinyin: 'Māo zài yǐzi xiàbian.',
		ko: '고양이는 의자 아래에 있다.',
		hint: '소재문 + 방위사 下边'
	},
	{
		tokens: ['今天', '下雪', '天气', '很冷'],
		pinyin: 'Jīntiān xià xuě, tiānqì hěn lěng.',
		ko: '오늘 눈이 와서 날씨가 아주 춥다.',
		hint: '날씨 + 형용사술어문(很+형용사)'
	}
];
