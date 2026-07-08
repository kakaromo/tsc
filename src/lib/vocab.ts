// 第2部分(그림 보고 문장) 빈출 단어장.
// 3급 그림 묘사에서 반복적으로 쓰이는 어휘를 카테고리별로 정리.

export interface Vocab {
	hanzi: string;
	pinyin: string;
	ko: string;
	note?: string; // 쓰임 힌트
}

export interface VocabGroup {
	title: string; // 카테고리
	desc: string; // 설명
	items: Vocab[];
}

export const vocabGroups: VocabGroup[] = [
	{
		title: '양사 (量词)',
		desc: '물건을 셀 때 숫자 뒤에 붙이는 말. 2부에서 가장 자주 틀리는 부분!',
		items: [
			{ hanzi: '个', pinyin: 'ge', ko: '개 (가장 두루 쓰임)', note: '一个人, 三个苹果' },
			{ hanzi: '本', pinyin: 'běn', ko: '권 (책·노트)', note: '两本书' },
			{ hanzi: '张', pinyin: 'zhāng', ko: '장 (종이·책상·침대)', note: '一张桌子, 一张纸' },
			{ hanzi: '只', pinyin: 'zhī', ko: '마리 (동물)', note: '一只猫, 两只狗' },
			{ hanzi: '杯', pinyin: 'bēi', ko: '잔 (음료)', note: '一杯水, 一杯咖啡' },
			{ hanzi: '件', pinyin: 'jiàn', ko: '벌·건 (옷·일)', note: '一件衣服' },
			{ hanzi: '双', pinyin: 'shuāng', ko: '켤레 (신발·젓가락)', note: '一双鞋' },
			{ hanzi: '辆', pinyin: 'liàng', ko: '대 (차)', note: '一辆车' }
		]
	},
	{
		title: '위치·존재 (方位)',
		desc: '「~에 ~이 있다」 존재문의 핵심. 「장소 + 上/里 + 有 + 사물」',
		items: [
			{ hanzi: '有', pinyin: 'yǒu', ko: '(~이) 있다', note: '桌子上有书' },
			{ hanzi: '在', pinyin: 'zài', ko: '~에 있다 / ~에서', note: '学生在教室里' },
			{ hanzi: '上', pinyin: 'shàng', ko: '위', note: '桌子上' },
			{ hanzi: '里', pinyin: 'lǐ', ko: '안', note: '教室里, 房间里' },
			{ hanzi: '下', pinyin: 'xià', ko: '아래', note: '树下' },
			{ hanzi: '前面', pinyin: 'qiánmiàn', ko: '앞', note: '学校前面' },
			{ hanzi: '后面', pinyin: 'hòumiàn', ko: '뒤' },
			{ hanzi: '旁边', pinyin: 'pángbiān', ko: '옆', note: '我旁边' }
		]
	},
	{
		title: '동작 (动词)',
		desc: '그림 속 인물이 하는 행동. 「주어 + 在 + 장소 + 동작」',
		items: [
			{ hanzi: '看', pinyin: 'kàn', ko: '보다 / 읽다', note: '看书, 看电视' },
			{ hanzi: '吃', pinyin: 'chī', ko: '먹다', note: '吃饭' },
			{ hanzi: '喝', pinyin: 'hē', ko: '마시다', note: '喝水' },
			{ hanzi: '买', pinyin: 'mǎi', ko: '사다', note: '买东西' },
			{ hanzi: '写', pinyin: 'xiě', ko: '쓰다', note: '写字' },
			{ hanzi: '打', pinyin: 'dǎ', ko: '(전화·우산을) 하다/쓰다', note: '打电话, 打伞' },
			{ hanzi: '玩', pinyin: 'wán', ko: '놀다', note: '玩游戏' },
			{ hanzi: '坐', pinyin: 'zuò', ko: '앉다 / 타다', note: '坐在椅子上' }
		]
	},
	{
		title: '장소·사물 (名词)',
		desc: '그림에 자주 등장하는 배경과 사물',
		items: [
			{ hanzi: '桌子', pinyin: 'zhuōzi', ko: '책상, 탁자' },
			{ hanzi: '教室', pinyin: 'jiàoshì', ko: '교실' },
			{ hanzi: '饭馆', pinyin: 'fànguǎn', ko: '식당' },
			{ hanzi: '商店', pinyin: 'shāngdiàn', ko: '가게, 상점' },
			{ hanzi: '房间', pinyin: 'fángjiān', ko: '방' },
			{ hanzi: '雨伞', pinyin: 'yǔsǎn', ko: '우산' },
			{ hanzi: '苹果', pinyin: 'píngguǒ', ko: '사과' },
			{ hanzi: '书', pinyin: 'shū', ko: '책' }
		]
	},
	{
		title: '상태·시제 조사',
		desc: '동작의 완료·진행·상태를 나타냄. 3급에서 자주 나옴',
		items: [
			{ hanzi: '了', pinyin: 'le', ko: '완료 (~했다)', note: '买了苹果' },
			{ hanzi: '着', pinyin: 'zhe', ko: '상태 지속 (~하고 있다)', note: '打着雨伞' },
			{ hanzi: '在', pinyin: 'zài', ko: '진행 (~하는 중)', note: '在看书' },
			{ hanzi: '正在', pinyin: 'zhèngzài', ko: '마침 ~하는 중', note: '正在吃饭' }
		]
	},
	{
		title: '숫자 (数字)',
		desc: '양사 앞에 붙는 수. 그림 속 개수를 말할 때 필수',
		items: [
			{ hanzi: '一', pinyin: 'yī', ko: '1', note: '一本书' },
			{ hanzi: '两', pinyin: 'liǎng', ko: '2 (양사 앞)', note: '两个人 (二 아님!)' },
			{ hanzi: '三', pinyin: 'sān', ko: '3' },
			{ hanzi: '几', pinyin: 'jǐ', ko: '몇 (적은 수)', note: '几个苹果' },
			{ hanzi: '很多', pinyin: 'hěn duō', ko: '많은', note: '很多人' },
			{ hanzi: '半', pinyin: 'bàn', ko: '반, 절반', note: '一半' }
		]
	},
	{
		title: '색깔·모양 (颜色)',
		desc: '사물을 묘사할 때. 「~的 + 명사」로 꾸밈',
		items: [
			{ hanzi: '红色', pinyin: 'hóngsè', ko: '빨간색', note: '红色的苹果' },
			{ hanzi: '白色', pinyin: 'báisè', ko: '흰색' },
			{ hanzi: '黑色', pinyin: 'hēisè', ko: '검은색' },
			{ hanzi: '大', pinyin: 'dà', ko: '크다', note: '大苹果' },
			{ hanzi: '小', pinyin: 'xiǎo', ko: '작다', note: '小狗' },
			{ hanzi: '新', pinyin: 'xīn', ko: '새롭다', note: '新书' }
		]
	},
	{
		title: '시간·날씨 (时间)',
		desc: '「今天下雨」처럼 문장 맨 앞에 오는 배경 정보',
		items: [
			{ hanzi: '今天', pinyin: 'jīntiān', ko: '오늘', note: '今天下雨' },
			{ hanzi: '现在', pinyin: 'xiànzài', ko: '지금', note: '现在几点' },
			{ hanzi: '早上', pinyin: 'zǎoshang', ko: '아침' },
			{ hanzi: '晚上', pinyin: 'wǎnshang', ko: '저녁, 밤' },
			{ hanzi: '下雨', pinyin: 'xià yǔ', ko: '비가 오다' },
			{ hanzi: '天气', pinyin: 'tiānqì', ko: '날씨', note: '天气很好' }
		]
	},
	{
		title: '인물·대명사 (人物)',
		desc: '그림 속 등장인물의 주어',
		items: [
			{ hanzi: '他', pinyin: 'tā', ko: '그 (남자)' },
			{ hanzi: '她', pinyin: 'tā', ko: '그녀 (여자)' },
			{ hanzi: '他们', pinyin: 'tāmen', ko: '그들', note: '他们在吃饭' },
			{ hanzi: '孩子', pinyin: 'háizi', ko: '아이' },
			{ hanzi: '妈妈', pinyin: 'māma', ko: '엄마' },
			{ hanzi: '老师', pinyin: 'lǎoshī', ko: '선생님' }
		]
	}
];
