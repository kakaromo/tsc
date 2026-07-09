import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

// GET /api/tts?text=...&lang=zh|ko&rate=0.9
// Azure Neural TTS로 성우급 음성(MP3)을 생성해 반환.
// 응답은 audio/mpeg 바이너리 (브라우저 <audio>로 바로 재생).

// 언어별 기본 뉴럴 음성 (부드러운 여성 성우)
const VOICE = {
	zh: 'zh-CN-XiaoyiNeural', // 중국어 여성, 부드럽고 상냥한 톤
	ko: 'ko-KR-JiMinNeural' // 한국어 여성, 부드럽고 따뜻한 톤
};

// 허용 음성 (임의 음성 주입 방지). 클라이언트가 voice 파라미터로 이 중 하나 지정 가능.
const ALLOWED = new Set([
	'zh-CN-XiaoyiNeural',
	'zh-CN-XiaoxiaoNeural',
	'zh-CN-XiaomoNeural',
	'zh-CN-XiaohanNeural',
	'zh-CN-XiaoxuanNeural',
	'ko-KR-JiMinNeural',
	'ko-KR-SunHiNeural',
	'ko-KR-SeoHyeonNeural',
	'ko-KR-YuJinNeural'
]);

export const GET: RequestHandler = async ({ url }) => {
	const key = env.AZURE_SPEECH_KEY;
	const region = env.AZURE_SPEECH_REGION;
	if (!key || !region) throw error(503, 'TTS 미설정');

	const text = url.searchParams.get('text') ?? '';
	const lang = (url.searchParams.get('lang') ?? 'zh') === 'ko' ? 'ko' : 'zh';
	const rate = clampRate(url.searchParams.get('rate'));
	// 클라이언트가 선택한 음성(허용 목록에 있고 언어가 맞을 때만). 아니면 기본값.
	const reqVoice = url.searchParams.get('voice') ?? '';
	const localeName = lang === 'ko' ? 'ko-KR' : 'zh-CN';
	const voice = ALLOWED.has(reqVoice) && reqVoice.startsWith(localeName) ? reqVoice : VOICE[lang];
	if (!text) throw error(400, 'text가 필요합니다.');
	if (text.length > 600) throw error(400, '텍스트가 너무 깁니다.');

	try {
		const audio = await synth(key, region, text, voice, localeName, rate);
		return new Response(new Uint8Array(audio), {
			headers: {
				'content-type': 'audio/mpeg',
				// 같은 텍스트는 캐시 (재생 반복 시 재요청 안 함)
				'cache-control': 'public, max-age=86400'
			}
		});
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		throw error(502, `TTS 실패: ${msg}`);
	}
};

function clampRate(v: string | null): number {
	const n = Number(v);
	if (!Number.isFinite(n)) return 1;
	return Math.min(1.5, Math.max(0.5, n));
}

// SSML로 속도 조절 포함해 합성
function synth(
	key: string,
	region: string,
	text: string,
	voice: string,
	localeName: string,
	rate: number
): Promise<ArrayBuffer> {
	return new Promise((resolve, reject) => {
		const cfg = sdk.SpeechConfig.fromSubscription(key, region);
		cfg.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3;
		// rate를 퍼센트로 (1.0 → 0%, 0.85 → -15%)
		const ratePct = `${Math.round((rate - 1) * 100)}%`;
		const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		const ssml =
			`<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${localeName}">` +
			`<voice name="${voice}"><prosody rate="${ratePct}">${escaped}</prosody></voice></speak>`;

		// pull 스트림으로 받기 (오디오 출력 장치 없이 메모리로)
		const synthesizer = new sdk.SpeechSynthesizer(cfg, undefined);
		synthesizer.speakSsmlAsync(
			ssml,
			(result) => {
				if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
					const data = result.audioData;
					synthesizer.close();
					resolve(data);
				} else {
					synthesizer.close();
					reject(new Error(result.errorDetails || `합성 실패 (reason=${result.reason})`));
				}
			},
			(err) => {
				synthesizer.close();
				reject(new Error(err));
			}
		);
	});
}
