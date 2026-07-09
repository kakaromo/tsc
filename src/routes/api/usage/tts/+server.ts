import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getUsage, kvEnabled, FREE_LIMIT_CHARS, SAFE_RATIO, isOverLimit } from '$lib/server/ttsUsage';

// GET /api/usage/tts → 이번 달 TTS 사용량(자) + 한도 정보
export const GET: RequestHandler = async () => {
	if (!kvEnabled()) {
		return json({ tracked: false });
	}
	const used = await getUsage();
	return json({
		tracked: true,
		used,
		limit: FREE_LIMIT_CHARS,
		safeLimit: Math.round(FREE_LIMIT_CHARS * SAFE_RATIO),
		over: isOverLimit(used),
		pct: Math.min(100, Math.round((used / FREE_LIMIT_CHARS) * 100))
	});
};
