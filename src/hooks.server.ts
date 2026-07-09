import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { COOKIE_NAME, authEnabled, verifyToken } from '$lib/server/auth';

// 로그인 없이 접근 가능한 경로 (로그인 화면 자체와 로그인 API)
const PUBLIC = ['/login', '/api/login'];

export const handle: Handle = async ({ event, resolve }) => {
	// APP_PASSWORD 미설정이면 보호 비활성(로컬 개발 등에서 그대로 열림)
	if (!authEnabled()) return resolve(event);

	const path = event.url.pathname;
	const isPublic = PUBLIC.some((p) => path === p || path.startsWith(p + '/'));
	const authed = verifyToken(event.cookies.get(COOKIE_NAME));

	if (!authed && !isPublic) {
		// API는 401, 페이지는 로그인으로 리다이렉트
		if (path.startsWith('/api/')) {
			return new Response('Unauthorized', { status: 401 });
		}
		throw redirect(303, '/login');
	}

	// 이미 로그인했는데 로그인 페이지로 오면 홈으로
	if (authed && path === '/login') {
		throw redirect(303, '/');
	}

	return resolve(event);
};
