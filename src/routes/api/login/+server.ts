import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { COOKIE_NAME, checkPassword, issueToken } from '$lib/server/auth';

// POST /api/login  body: { password }
export const POST: RequestHandler = async ({ request, cookies }) => {
	const { password } = await request.json().catch(() => ({ password: '' }));

	if (!checkPassword(password ?? '')) {
		return json({ ok: false, error: '비밀번호가 틀렸어요.' }, { status: 401 });
	}

	cookies.set(COOKIE_NAME, issueToken(), {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 30 // 30일 유지
	});
	return json({ ok: true });
};
