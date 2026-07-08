// 자가 점검 체크리스트 — 모범 발음과 내 녹음을 비교하며 스스로 채점
// TSC 3급 채점 관점(성조·유창성·완성도)을 반영한 항목들

export interface CheckItem {
	id: string;
	label: string;
	hint: string;
}

export const checklist: CheckItem[] = [
	{
		id: 'tone',
		label: '성조가 모범 발음과 비슷했다',
		hint: '특히 4성(炫 xuàn)은 위→아래로 떨어졌는지, 3성(九 jiǔ)은 낮게 눌렀는지'
	},
	{
		id: 'initials',
		label: '헷갈리는 자음/모음을 정확히 냈다',
		hint: 'j/q/x, zh/ch/sh, ü 발음 등이 뭉개지지 않았는지'
	},
	{
		id: 'fluency',
		label: '끊김 없이 자연스럽게 이어 말했다',
		hint: '중간에 2~3초 이상 멈추지 않았는지'
	},
	{
		id: 'speed',
		label: '너무 빠르거나 느리지 않았다',
		hint: '모범 발음과 비슷한 속도였는지 (급하면 성조가 무너짐)'
	},
	{
		id: 'complete',
		label: '문장을 끝까지 완성했다',
		hint: '중간에 흐지부지 끝내지 않고 마지막까지 또렷하게'
	}
];
