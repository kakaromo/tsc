// 고품질 TTS 재생 유틸 (클라이언트).
// Azure Neural TTS(/api/tts)로 성우급 음성을 받아 재생하고,
// 실패하면 브라우저 내장 TTS로 폴백한다.

import { getZhVoice, getKoVoice } from './voices';

let currentAudio: HTMLAudioElement | null = null;

// 서버가 한도 초과(429)를 알리면 이후 요청은 바로 무료 TTS로 (재요청 안 함)
let quotaExceeded = false;
export function isQuotaExceeded() {
	return quotaExceeded;
}

// 같은 (text,lang,rate,voice) 요청은 캐시 (Blob URL 재사용)
const cache = new Map<string, string>();

function cacheKey(text: string, lang: string, rate: number, voice: string) {
	return `${lang}|${voice}|${rate}|${text}`;
}

export interface SpeakOptions {
	lang?: 'zh' | 'ko';
	rate?: number; // 0.5 ~ 1.5
	voice?: string; // 특정 음성 지정(미리듣기용). 없으면 저장된 선택 사용
	onstart?: () => void;
	onend?: () => void;
	onerror?: () => void;
}

// Azure 우선, 실패 시 브라우저 TTS. Promise는 재생이 "끝날 때" resolve.
export async function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
	const lang = opts.lang ?? 'zh';
	const rate = opts.rate ?? (lang === 'zh' ? 0.9 : 1);
	stopSpeak();

	// 이미 한도 초과가 확인됐으면 서버 호출 없이 바로 무료 TTS
	if (quotaExceeded) {
		await browserSpeak(text, lang, rate, opts);
		return;
	}
	const voice = opts.voice ?? (lang === 'ko' ? getKoVoice() : getZhVoice());
	try {
		const url = await getAudioUrl(text, lang, rate, voice);
		await playUrl(url, opts);
	} catch {
		// 폴백: 브라우저 TTS
		await browserSpeak(text, lang, rate, opts);
	}
}

async function getAudioUrl(
	text: string,
	lang: string,
	rate: number,
	voice: string
): Promise<string> {
	const key = cacheKey(text, lang, rate, voice);
	const cached = cache.get(key);
	if (cached) return cached;

	const res = await fetch(
		`/api/tts?text=${encodeURIComponent(text)}&lang=${lang}&rate=${rate}&voice=${encodeURIComponent(voice)}`
	);
	if (res.status === 429) {
		quotaExceeded = true; // 이후엔 서버 호출 없이 무료 TTS
		throw new Error('tts quota exceeded');
	}
	if (!res.ok) throw new Error(`tts ${res.status}`);
	const blob = await res.blob();
	const objUrl = URL.createObjectURL(blob);
	cache.set(key, objUrl);
	return objUrl;
}

function playUrl(url: string, opts: SpeakOptions): Promise<void> {
	return new Promise((resolve, reject) => {
		const audio = new Audio(url);
		currentAudio = audio;
		opts.onstart?.();
		audio.onended = () => {
			opts.onend?.();
			resolve();
		};
		audio.onerror = () => {
			opts.onerror?.();
			reject(new Error('audio error'));
		};
		audio.play().catch(reject);
	});
}

function browserSpeak(
	text: string,
	lang: string,
	rate: number,
	opts: SpeakOptions
): Promise<void> {
	return new Promise((resolve) => {
		if (typeof speechSynthesis === 'undefined') {
			opts.onerror?.();
			resolve();
			return;
		}
		speechSynthesis.cancel();
		const u = new SpeechSynthesisUtterance(text);
		u.lang = lang === 'ko' ? 'ko-KR' : 'zh-CN';
		u.rate = rate;
		const voices = speechSynthesis.getVoices();
		const prefix = lang === 'ko' ? 'ko' : 'zh';
		const female = /female|xiaoxiao|xiaoyi|ting-?ting|mei-?jia|sinji|yaoyao|sunhi|女/i;
		const cand = voices.filter((v) =>
			v.lang.replace('_', '-').toLowerCase().startsWith(prefix)
		);
		const v = cand.find((x) => female.test(x.name)) ?? cand[0];
		if (v) u.voice = v;
		opts.onstart?.();
		u.onend = () => {
			opts.onend?.();
			resolve();
		};
		u.onerror = () => {
			opts.onerror?.();
			resolve();
		};
		speechSynthesis.speak(u);
	});
}

export function stopSpeak() {
	if (currentAudio) {
		currentAudio.pause();
		currentAudio.onended = null;
		currentAudio.onerror = null;
		currentAudio = null;
	}
	if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
}
