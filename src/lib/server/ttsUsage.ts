// TTS 사용량 서버 집계 (Upstash Redis / Vercel KV).
// Azure Neural TTS 무료 한도: 월 50만 자. CJK(중국어·한국어 한글)는 글자당 2배 계산.
// KV 미설정 시엔 추적을 건너뛰고 앱은 정상 동작(무제한처럼 보임).

import { env } from '$env/dynamic/private';
import { Redis } from '@upstash/redis';

export const FREE_LIMIT_CHARS = 500_000; // 월 무료 한도(자)
export const SAFE_RATIO = 0.95; // 이 비율 넘으면 무료 TTS로 강제 전환

let redis: Redis | null = null;
function getRedis(): Redis | null {
	if (redis) return redis;
	// Upstash/Vercel KV가 주입하는 표준 env 이름들 지원
	const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
	const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
	if (!url || !token) return null;
	redis = new Redis({ url, token });
	return redis;
}

export function kvEnabled(): boolean {
	return getRedis() !== null;
}

// CJK는 2배로 과금됨 → 청구 기준 글자 수 산정
export function billableChars(text: string): number {
	let n = 0;
	for (const ch of text) {
		// 한중일 통합한자, 한글, 가나 등은 2배
		n += /[　-鿿가-힣豈-﫿]/.test(ch) ? 2 : 1;
	}
	return n;
}

function monthKey(): string {
	// UTC 기준 월. (KV에 저장되는 키)
	const d = new Date();
	return `tts:${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

// 현재 월 누적 사용량(자). KV 없으면 0.
export async function getUsage(): Promise<number> {
	const r = getRedis();
	if (!r) return 0;
	try {
		const v = await r.get<number>(monthKey());
		return typeof v === 'number' ? v : 0;
	} catch {
		return 0;
	}
}

// 사용량 누적. 반환: 누적 후 총합
export async function addUsage(chars: number): Promise<number> {
	const r = getRedis();
	if (!r) return 0;
	try {
		const total = await r.incrby(monthKey(), chars);
		// 키에 만료를 걸어 다음 달 자동 정리 (63일)
		await r.expire(monthKey(), 60 * 60 * 24 * 63);
		return total;
	} catch {
		return 0;
	}
}

// 한도 초과 여부 (안전선 기준)
export function isOverLimit(used: number): boolean {
	return used >= FREE_LIMIT_CHARS * SAFE_RATIO;
}
