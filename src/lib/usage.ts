// Azure 발음평가 사용량(오디오 초) 월별 누적 추적.
// 앱을 거친 채점만 집계하는 근사치. 정확한 값은 Azure 포털 Metrics 참고.
// F0 무료 티어 한도: 월 5시간 = 18,000초 = 300분.

const KEY = 'tsc-azure-usage-v1';
export const FREE_LIMIT_SEC = 5 * 60 * 60; // 18,000초 (300분)

interface UsageData {
	month: string; // 'YYYY-MM'
	seconds: number; // 이번 달 누적 오디오 초
	calls: number; // 채점 횟수
}

function currentMonth(): string {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function loadUsage(): UsageData {
	const now = currentMonth();
	if (typeof localStorage === 'undefined') return { month: now, seconds: 0, calls: 0 };
	try {
		const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}');
		// 월이 바뀌면 리셋
		if (raw.month !== now) return { month: now, seconds: 0, calls: 0 };
		return { month: now, seconds: raw.seconds ?? 0, calls: raw.calls ?? 0 };
	} catch {
		return { month: now, seconds: 0, calls: 0 };
	}
}

export function addUsage(seconds: number): UsageData {
	const cur = loadUsage();
	const next: UsageData = {
		month: cur.month,
		seconds: Math.round((cur.seconds + seconds) * 10) / 10,
		calls: cur.calls + 1
	};
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(KEY, JSON.stringify(next));
	}
	return next;
}

// 표시용: 분 단위 문자열과 남은 비율
export function usageDisplay(u: UsageData) {
	const usedMin = Math.floor(u.seconds / 60);
	const usedSec = Math.round(u.seconds % 60);
	const limitMin = FREE_LIMIT_SEC / 60;
	const pct = Math.min(100, Math.round((u.seconds / FREE_LIMIT_SEC) * 100));
	return {
		usedLabel: usedMin > 0 ? `${usedMin}분 ${usedSec}초` : `${usedSec}초`,
		limitMin,
		pct,
		calls: u.calls,
		near: pct >= 80 // 한도 임박
	};
}
