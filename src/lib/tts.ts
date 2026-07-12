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

// ─── 음성 캐시 ─────────────────────────────────────────
// 무료 한도 절약이 목표:
// 1) 항상 기본 속도(1.0)로 받아서 저장 — 재생 속도는 playbackRate로 조절하므로
//    속도를 바꿔도 재요청이 없다.
// 2) 받은 오디오는 IndexedDB에 영구 저장 — 새로고침·재방문에도 Azure 호출 없음.
// 메모리 캐시(Blob URL)는 세션 내 반복 재생용.
const cache = new Map<string, string>();

function cacheKey(text: string, lang: string, voice: string) {
	return `${lang}|${voice}|${text}`;
}

const DB_NAME = 'tts-cache-v1';
const STORE = 'audio';
let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
	if (typeof indexedDB === 'undefined') return Promise.resolve(null);
	if (!dbPromise) {
		dbPromise = new Promise((resolve) => {
			try {
				const req = indexedDB.open(DB_NAME, 1);
				req.onupgradeneeded = () => req.result.createObjectStore(STORE);
				req.onsuccess = () => resolve(req.result);
				req.onerror = () => resolve(null);
			} catch {
				resolve(null);
			}
		});
	}
	return dbPromise;
}

async function idbGet(key: string): Promise<Blob | null> {
	const db = await openDb();
	if (!db) return null;
	return new Promise((resolve) => {
		try {
			const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
			req.onsuccess = () => resolve(req.result instanceof Blob ? req.result : null);
			req.onerror = () => resolve(null);
		} catch {
			resolve(null);
		}
	});
}

async function idbPut(key: string, blob: Blob): Promise<void> {
	const db = await openDb();
	if (!db) return;
	try {
		db.transaction(STORE, 'readwrite').objectStore(STORE).put(blob, key);
	} catch {
		/* 저장 실패는 무시 (다음에 다시 받으면 됨) */
	}
}

// 저장된 음성 캐시 현황 (설정 화면 표시용)
export async function ttsCacheStats(): Promise<{ count: number; bytes: number }> {
	const db = await openDb();
	if (!db) return { count: 0, bytes: 0 };
	return new Promise((resolve) => {
		try {
			const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
			req.onsuccess = () => {
				const blobs = (req.result ?? []) as Blob[];
				resolve({
					count: blobs.length,
					bytes: blobs.reduce((s, b) => s + (b?.size ?? 0), 0)
				});
			};
			req.onerror = () => resolve({ count: 0, bytes: 0 });
		} catch {
			resolve({ count: 0, bytes: 0 });
		}
	});
}

// 캐시 비우기 (음성 변경 후 용량 정리 등)
export async function clearTtsCache(): Promise<void> {
	cache.clear();
	const db = await openDb();
	if (!db) return;
	try {
		db.transaction(STORE, 'readwrite').objectStore(STORE).clear();
	} catch {
		/* 무시 */
	}
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
		const url = await getAudioUrl(text, lang, voice);
		await playUrl(url, rate, opts);
	} catch {
		// 폴백: 브라우저 TTS
		await browserSpeak(text, lang, rate, opts);
	}
}

// 오디오 URL 얻기: 메모리 캐시 → IndexedDB(영구) → Azure 요청(항상 1.0배속)
async function getAudioUrl(text: string, lang: string, voice: string): Promise<string> {
	const key = cacheKey(text, lang, voice);
	const cached = cache.get(key);
	if (cached) return cached;

	const saved = await idbGet(key);
	if (saved) {
		const objUrl = URL.createObjectURL(saved);
		cache.set(key, objUrl);
		return objUrl;
	}

	const res = await fetch(
		`/api/tts?text=${encodeURIComponent(text)}&lang=${lang}&rate=1&voice=${encodeURIComponent(voice)}`
	);
	if (res.status === 429) {
		quotaExceeded = true; // 이후엔 서버 호출 없이 무료 TTS
		throw new Error('tts quota exceeded');
	}
	if (!res.ok) throw new Error(`tts ${res.status}`);
	const blob = await res.blob();
	void idbPut(key, blob); // 영구 저장 (다음 방문에도 재사용)
	const objUrl = URL.createObjectURL(blob);
	cache.set(key, objUrl);
	return objUrl;
}

function playUrl(url: string, rate: number, opts: SpeakOptions): Promise<void> {
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
			const ms = Number.isFinite(audio.duration)
				? (audio.duration / rate) * 1000 + 2000
				: 15000;
			safety = setTimeout(() => finish(true), ms);
		};
		audio.onended = () => finish(true);
		audio.onerror = () => finish(false);
		opts.onstart?.();
		audio.src = url;
		// 저장본은 1.0배속이므로 재생 속도로 조절 (음정은 유지됨)
		audio.playbackRate = rate;
		(audio as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true;
		audio.play().catch(() => finish(false));
	});
}

// 다음 세그먼트 오디오를 미리 받아둠 (재생 딜레이 제거). 실패는 무시.
// rate는 캐시에 영향이 없어졌지만 호출부 호환을 위해 남겨둠.
export async function prefetch(text: string, lang: 'zh' | 'ko', _rate?: number, voice?: string) {
	if (quotaExceeded) return;
	const v = voice ?? (lang === 'ko' ? getKoVoice() : getZhVoice());
	try {
		await getAudioUrl(text, lang, v);
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
