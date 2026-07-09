// 간단한 비밀번호 로그인용 서버 유틸.
// 비밀번호는 환경변수 APP_PASSWORD로만 관리(코드에 없음).
// 로그인 성공 시 HMAC 서명 토큰을 httpOnly 쿠키로 발급 → 위조 불가.

import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';

export const COOKIE_NAME = 'tsc_auth';

// 보호 기능이 켜져 있는지 (APP_PASSWORD가 설정된 경우에만 로그인 요구)
export function authEnabled(): boolean {
	return !!env.APP_PASSWORD;
}

// 서명 비밀키: 별도 SECRET이 있으면 사용, 없으면 비번에서 파생
function secret(): string {
	return env.APP_SECRET || `sk-${env.APP_PASSWORD ?? 'none'}`;
}

// 고정 토큰(비번이 맞으면 발급하는 값). 세션 만료는 쿠키 Max-Age로 관리.
export function issueToken(): string {
	const payload = 'ok';
	const sig = createHmac('sha256', secret()).update(payload).digest('hex');
	return `${payload}.${sig}`;
}

export function verifyToken(token: string | undefined): boolean {
	if (!token) return false;
	const [payload, sig] = token.split('.');
	if (payload !== 'ok' || !sig) return false;
	const expected = createHmac('sha256', secret()).update(payload).digest('hex');
	try {
		return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
	} catch {
		return false;
	}
}

// 비밀번호 대조 (타이밍 공격 방지)
export function checkPassword(input: string): boolean {
	const pw = env.APP_PASSWORD ?? '';
	if (!pw) return false;
	const a = Buffer.from(input);
	const b = Buffer.from(pw);
	if (a.length !== b.length) return false;
	try {
		return timingSafeEqual(a, b);
	} catch {
		return false;
	}
}
