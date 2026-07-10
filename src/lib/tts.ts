// 고품질 TTS 재생 유틸 (클라이언트).
// Azure Neural TTS(/api/tts)로 성우급 음성을 받아 재생하고,
// 실패하면 브라우저 내장 TTS로 폴백한다.

import { getZhVoice, getKoVoice } from './voices';

// 단일 Audio 객체를 재사용한다. (iOS 등에서 새 Audio마다 제스처를 요구하는 문제 회피 —
// 첫 재생 시 얻은 권한이 같은 객체에 유지되어 연속 재생이 끊기지 않음)
let currentAudio: HTMLAudioElement | null = null;
function getAudioEl(): HTMLAudioElement {
	if (!currentAudio) currentAudio = new Audio();
	return currentAudio;
}

// 첫 사용자 제스처(재생 버튼) 시 호출해 오디오 재생 권한을 '해제'해 둔다.
export function unlockAudio() {
	try {
		const a = getAudioEl();
		a.muted = true;
		void a.play().then(() => {
			a.pause();
			a.muted = false;
		}).catch(() => {
			a.muted = false;
		});
	} catch {
		/* 무시 */
	}
}

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
		const audio = getAudioEl();
		let done = false;
		const finish = (ok: boolean) => {
			if (done) return;
			done = true;
			clearTimeout(safety);
			audio.onended = null;
			audio.onerror = null;
			audio.onloadedmetadata = null;
			if (ok) {
				opts.onend?.();
				resolve();
			} else {
				opts.onerror?.();
				reject(new Error('audio error'));
			}
		};
		// 안전장치: onended가 안 불려도 (duration+2초) 뒤엔 강제로 넘어감
		let safety = setTimeout(() => finish(true), 15000);
		audio.onloadedmetadata = () => {
			clearTimeout(safety);
			const ms = Number.isFinite(audio.duration) ? audio.duration * 1000 + 2000 : 15000;
			safety = setTimeout(() => finish(true), ms);
		};
		audio.onended = () => finish(true);
		audio.onerror = () => finish(false);
		opts.onstart?.();
		audio.src = url;
		audio.play().catch(() => finish(false));
	});
}

// 다음 세그먼트 오디오를 미리 받아둠 (재생 딜레이 제거). 실패는 무시.
export async function prefetch(text: string, lang: 'zh' | 'ko', rate: number, voice?: string) {
	if (quotaExceeded) return;
	const v = voice ?? (lang === 'ko' ? getKoVoice() : getZhVoice());
	try {
		await getAudioUrl(text, lang, rate, v);
	} catch {
		/* 무시 */
	}
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
	// 객체는 유지(재생 권한 보존), 재생만 멈추고 핸들러 제거
	if (currentAudio) {
		currentAudio.onended = null;
		currentAudio.onerror = null;
		currentAudio.onloadedmetadata = null;
		currentAudio.pause();
	}
	if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
}
