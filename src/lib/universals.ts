// 만능답변 — 질문 유형만 알아들으면 조립해서 쓰는 범용 템플릿.
// 3부(대화 완성)·4부(일상 화제)에서 모르는 질문이 나와도 침묵하지 않기 위한 안전장치.
// trigger: 질문에서 이 키워드가 들리면 이 답을 꺼낸다.

export interface UniversalAnswer {
	situation: string; // 질문 유형 이름
	trigger: string; // 질문에서 들리는 신호 (키워드)
	cn: string;
	pinyin: string;
	ko: string;
	note?: string; // 바꿔 끼우는 법
}

export const universalAnswers: UniversalAnswer[] = [
	{
		situation: '취향 질문',
		trigger: '喜欢(xǐhuan)·什么(shénme)이 들리면',
		cn: '我喜欢看电影。因为很有意思，我常常和朋友一起看。',
		pinyin: 'Wǒ xǐhuan kàn diànyǐng. Yīnwèi hěn yǒu yìsi, wǒ chángcháng hé péngyou yìqǐ kàn.',
		ko: '저는 영화 보기를 좋아합니다. 재미있어서 친구와 자주 같이 봅니다.',
		note: '看电影 자리에 运动·听音乐·中国菜(먹는 건 吃)만 갈아 끼우면 어떤 취향 질문에도 통해요'
	},
	{
		situation: '시간 질문',
		trigger: '几点(jǐ diǎn)이 들리면',
		cn: '我一般早上七点起床，晚上十二点睡觉。',
		pinyin: 'Wǒ yìbān zǎoshang qī diǎn qǐchuáng, wǎnshang shí\'èr diǎn shuìjiào.',
		ko: '저는 보통 아침 7시에 일어나고, 밤 12시에 잡니다.',
		note: '기상·취침이 아니어도 「我一般 + 시간 + 동사」 틀은 모든 几点 질문에 적용'
	},
	{
		situation: '빈도 질문',
		trigger: '常(cháng)·几次(jǐ cì)가 들리면',
		cn: '我一个星期做三次，每次三十分钟左右。',
		pinyin: 'Wǒ yí ge xīngqī zuò sān cì, měi cì sānshí fēnzhōng zuǒyòu.',
		ko: '일주일에 세 번 하고, 매번 30분 정도 합니다.',
		note: '做 자리에 질문의 동사를 그대로 반사: 跑(달리기)·看(보기)·去(가기)'
	},
	{
		situation: '장소 질문',
		trigger: '哪儿(nǎr)이 들리면',
		cn: '我常去家附近的超市，那儿的东西又便宜又好。',
		pinyin: 'Wǒ cháng qù jiā fùjìn de chāoshì, nàr de dōngxi yòu piányi yòu hǎo.',
		ko: '집 근처 마트에 자주 갑니다. 그곳 물건은 싸고 좋아요.',
		note: '超市 자리에 公园·咖啡厅·图书馆. 뒷문장 「那儿~」은 어디에나 붙는 만능 꼬리'
	},
	{
		situation: '수단·방법 질문',
		trigger: '怎么(zěnme)+동사가 들리면',
		cn: '我坐地铁去，大概要三十分钟。',
		pinyin: 'Wǒ zuò dìtiě qù, dàgài yào sānshí fēnzhōng.',
		ko: '지하철을 타고 가는데, 대략 30분 걸립니다.',
		note: '교통이 아니면 「用手机(휴대폰으로)」로 시작하면 대부분 통해요'
	},
	{
		situation: '이유 질문',
		trigger: '为什么(wèi shénme)가 들리면',
		cn: '因为很有意思，而且对我很有帮助。',
		pinyin: 'Yīnwèi hěn yǒu yìsi, érqiě duì wǒ hěn yǒu bāngzhù.',
		ko: '재미있고, 게다가 저에게 도움이 되기 때문입니다.',
		note: '거의 모든 为什么에 통하는 최강 만능. 而且(érqiě, 게다가)로 두 배 길어짐'
	},
	{
		situation: '과거·경험 질문',
		trigger: '~了吗(le ma)·昨天(zuótiān)이 들리면',
		cn: '我昨天和朋友一起吃饭了，我们聊得很开心。',
		pinyin: 'Wǒ zuótiān hé péngyou yìqǐ chī fàn le, wǒmen liáo de hěn kāixīn.',
		ko: '어제 친구와 함께 밥을 먹었고, 즐겁게 이야기했습니다.',
		note: '吃饭 자리에 들은 동사를 넣기. 「~得很开心」은 과거 답변 만능 마무리'
	},
	{
		situation: '의견 질문',
		trigger: '怎么样(zěnmeyàng)이 들리면',
		cn: '我觉得很不错，我很喜欢。',
		pinyin: 'Wǒ juéde hěn búcuò, wǒ hěn xǐhuan.',
		ko: '꽤 괜찮다고 생각해요. 아주 마음에 듭니다.',
		note: '무엇에 대한 의견이든 안전한 긍정 답. 我觉得(내 생각엔)로 시작하면 자연스러움'
	},
	{
		situation: '계획·미래 질문',
		trigger: '打算(dǎsuàn)·以后(yǐhòu)가 들리면',
		cn: '我想以后去中国旅行，一边旅行一边练习汉语。',
		pinyin: 'Wǒ xiǎng yǐhòu qù Zhōngguó lǚxíng, yìbiān lǚxíng yìbiān liànxí Hànyǔ.',
		ko: '나중에 중국 여행을 가서, 여행하면서 중국어를 연습하고 싶습니다.',
		note: '「我想以后~」로 시작하면 어떤 계획 질문에도 대응. 시험관에게 어필도 됨'
	},
	{
		situation: '제안·약속 질문',
		trigger: '一起(yìqǐ)·什么时候(shénme shíhou)가 들리면',
		cn: '好啊，我这个星期六有时间，我们一起去吧。',
		pinyin: 'Hǎo a, wǒ zhège xīngqīliù yǒu shíjiān, wǒmen yìqǐ qù ba.',
		ko: '좋아요, 이번 주 토요일에 시간이 있으니 같이 가요.',
		note: '제안은 무조건 수락(好啊)이 제일 쉬움. 吧로 마무리하면 자연스러운 제안 어투'
	},
	{
		situation: '🚨 비상용 (질문을 모를 때)',
		trigger: '무슨 질문인지 모르겠으면',
		cn: '这个问题有点儿难，让我想一想。',
		pinyin: 'Zhège wèntí yǒudiǎnr nán, ràng wǒ xiǎng yi xiǎng.',
		ko: '이 질문은 조금 어렵네요, 잠깐 생각해 볼게요.',
		note: '침묵 방지 시간 벌기. 이 말을 하는 동안 들린 키워드로 아무 문장이나 만들어 이어가세요 — 빈 답변은 0점, 어설픈 문장은 부분 점수!'
	}
];
