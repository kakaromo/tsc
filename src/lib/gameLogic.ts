// 게임 공통 로직: 셔플, 4지선다 보기 생성, 간격반복(복습주기) 진도 관리.
import { vocabGroups, type Vocab } from './vocab';

// Fisher–Yates 셔플 (원본 불변)
export function shuffle<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

// 전체 단어를 평평하게
export const allWords: Vocab[] = vocabGroups.flatMap((g) => g.items);

// 오답 보기 후보 뽑아 4지선다 만들기 (뜻 맞히기)
export function makeChoices(correct: Vocab, pool: Vocab[], n = 4): Vocab[] {
	const others = shuffle(pool.filter((w) => w.hanzi !== correct.hanzi)).slice(0, n - 1);
	return shuffle([correct, ...others]);
}

// ─── 간격반복(복습주기) ────────────────────────────
// 각 단어의 "숙련도" 박스(0~5)를 localStorage에 저장.
// 정답 → 박스+1 (다음에 덜 나옴), 오답 → 박스=0 (자주 나옴).
// 문제 뽑을 때 박스가 낮을수록 가중치 높음 → 틀린 단어가 더 자주 등장.

const KEY = 'tsc-srs-v1';
export type SrsMap = Record<string, number>; // hanzi -> box(0~5)

export function loadSrs(): SrsMap {
	if (typeof localStorage === 'undefined') return {};
	try {
		return JSON.parse(localStorage.getItem(KEY) ?? '{}');
	} catch {
		return {};
	}
}

export function saveSrs(map: SrsMap): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(KEY, JSON.stringify(map));
}

export function recordResult(map: SrsMap, hanzi: string, correct: boolean): SrsMap {
	const cur = map[hanzi] ?? 0;
	const next = correct ? Math.min(5, cur + 1) : 0;
	return { ...map, [hanzi]: next };
}

// 박스가 낮을수록(=덜 익힘) 뽑힐 확률 높게 가중 추첨
export function weightedPick(pool: Vocab[], map: SrsMap): Vocab {
	// 가중치 = 6 - box (box0→6, box5→1)
	const weights = pool.map((w) => 6 - (map[w.hanzi] ?? 0));
	const total = weights.reduce((s, x) => s + x, 0);
	let r = Math.random() * total;
	for (let i = 0; i < pool.length; i++) {
		r -= weights[i];
		if (r <= 0) return pool[i];
	}
	return pool[pool.length - 1];
}

// 전체 숙련도(마스터한 단어 수 / 전체)
export function masteryStats(map: SrsMap, pool: Vocab[]): { mastered: number; total: number } {
	const mastered = pool.filter((w) => (map[w.hanzi] ?? 0) >= 4).length;
	return { mastered, total: pool.length };
}
