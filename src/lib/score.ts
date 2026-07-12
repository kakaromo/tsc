// 발음 채점 유틸 (무료 · 브라우저 음성인식 기반 글자 비교)
// 주의: Web Speech API는 성조를 구분하지 못합니다.
// 따라서 이 점수는 "글자가 얼마나 알아들어졌는가"의 지표이며,
// 성조 정확도는 자가 점검 체크리스트로 별도 확인합니다.

// 채점 전 텍스트 정규화: 구두점·공백·병음/해석 등 비교에 방해되는 요소 제거
export function normalizeHanzi(text: string): string {
	return text
		.replace(/[\s　]/g, '') // 공백(전각 포함)
		.replace(/[，。、！？；：·…—「」『』（）()【】《》"'"',.!?;:]/g, '') // 구두점
		.trim();
}

// 두 문자열의 편집거리(Levenshtein) — 삽입/삭제/치환 최소 횟수
function editDistance(a: string, b: string): number {
	const m = a.length;
	const n = b.length;
	if (m === 0) return n;
	if (n === 0) return m;
	let prev = Array.from({ length: n + 1 }, (_, i) => i);
	let curr = new Array<number>(n + 1);
	for (let i = 1; i <= m; i++) {
		curr[0] = i;
		for (let j = 1; j <= n; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			curr[j] = Math.min(
				prev[j] + 1, // 삭제
				curr[j - 1] + 1, // 삽입
				prev[j - 1] + cost // 치환
			);
		}
		[prev, curr] = [curr, prev];
	}
	return prev[n];
}

export interface MatchResult {
	score: number; // 0~100 글자 일치율
	heard: string; // 인식된(정규화된) 글자
	target: string; // 모범(정규화된) 글자
}

// 인식 결과와 모범 답변을 비교해 일치율 산출
export function matchScore(heardRaw: string, targetRaw: string): MatchResult {
	const heard = normalizeHanzi(heardRaw);
	const target = normalizeHanzi(targetRaw);
	if (target.length === 0) return { score: 0, heard, target };
	const dist = editDistance(heard, target);
	const score = Math.max(0, Math.round((1 - dist / target.length) * 100));
	return { score, heard, target };
}

// 글자 단위로 맞음/틀림 표시용 — 모범 답변의 각 글자가 인식 결과에 포함됐는지
// (정밀 정렬 대신, 3급 수준 피드백엔 충분한 간단 방식)
export interface CharMark {
	ch: string;
	ok: boolean;
}

export function markChars(heardRaw: string, targetRaw: string): CharMark[] {
	const heard = normalizeHanzi(heardRaw);
	const target = normalizeHanzi(targetRaw);
	// 인식 결과에 남은 글자를 소비하며 순서대로 매칭
	const pool = heard.split('');
	return target.split('').map((ch) => {
		const idx = pool.indexOf(ch);
		if (idx >= 0) {
			pool.splice(idx, 1);
			return { ch, ok: true };
		}
		return { ch, ok: false };
	});
}

// 점수대별 코멘트
export function scoreComment(score: number): string {
	if (score >= 95) return '아주 좋아요! 원어민이 또렷이 알아들을 수준입니다. 🎉';
	if (score >= 80) return '잘했어요. 대부분 정확히 전달됐어요. 👍';
	if (score >= 60) return '통하긴 하지만 일부 글자가 뭉개졌어요. 또박또박 다시 해볼까요?';
	return '몇몇 글자가 잘 전달되지 않았어요. 천천히, 성조를 살려서 연습해봐요.';
}

// ─── 합격권 판정 (Azure 발음평가 해석) ─────────────────
// Azure 점수를 "중국인이 알아들을 수 있는가 / TSC 3급 발음 기준을 넘는가"로 해석.
// 정확도(성조 포함)가 전달력의 핵심, 유창성은 시험 인상 점수, 완성도는 문장 완주 여부.
export interface PassVerdict {
	grade: 'pass' | 'borderline' | 'risk' | 'fail';
	title: string;
	desc: string;
}

export function passVerdict(a: {
	accuracy?: number | null;
	fluency?: number | null;
	completeness?: number | null;
}): PassVerdict {
	const acc = a.accuracy ?? 0;
	const flu = a.fluency ?? 0;
	const comp = a.completeness ?? 100;
	const incomplete =
		comp < 70 ? ' 다만 문장을 끝까지 말하지 못했어요 — 시험에선 끝까지 말하는 게 중요해요.' : '';
	if (acc >= 85 && flu >= 75)
		return {
			grade: 'pass',
			title: '✅ 합격권 발음',
			desc:
				'중국인이 무리 없이 알아듣는 수준이에요. TSC 3급 발음 기준은 충분히 넘습니다.' +
				incomplete
		};
	if (acc >= 75)
		return {
			grade: 'borderline',
			title: '🟡 합격 경계선',
			desc:
				'대부분 알아듣지만 일부 글자는 문맥으로 유추해야 해요. 성조가 깨진 글자만 교정하면 합격권입니다.' +
				incomplete
		};
	if (acc >= 60)
		return {
			grade: 'risk',
			title: '🟠 전달 불안정',
			desc:
				'문맥이 없으면 오해할 수 있는 수준이에요. 속도를 늦추고 성조를 과장해서 또박또박 연습하세요.' +
				incomplete
		};
	return {
		grade: 'fail',
		title: '🔴 전달 어려움',
		desc:
			'지금 발음은 중국인이 알아듣기 어려워요. 모범 발음을 글자 단위로 따라 하며 성조부터 다시 잡아봐요.' +
			incomplete
	};
}
