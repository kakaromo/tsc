// 오디오(팟캐스트) 모드용 순차 TTS 재생기.
// 여러 발화를 한국어/중국어를 오가며 순서대로 읽고, 중간 멈춤도 넣는다.
// 운전 중 화면 없이 귀로만 학습하는 용도.

export interface Segment {
	text: string;
	lang: 'zh-CN' | 'ko-KR';
	pauseAfterMs?: number; // 이 발화 뒤 쉬는 시간 (뜻 떠올릴 시간 등)
	rate?: number;
}

type StateCb = (playing: boolean, index: number) => void;

export class AudioPlayer {
	private queue: Segment[] = [];
	private idx = 0;
	private stopped = true;
	private onState: StateCb = () => {};
	private pauseTimer: ReturnType<typeof setTimeout> | null = null;

	setOnState(cb: StateCb) {
		this.onState = cb;
	}

	private pickVoice(lang: string): SpeechSynthesisVoice | undefined {
		const voices = speechSynthesis.getVoices();
		if (lang.startsWith('zh')) {
			const zh = voices.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith('zh'));
			const female = /female|xiaoxiao|xiaoyi|ting-?ting|mei-?jia|sinji|yaoyao|女/i;
			return zh.find((v) => female.test(v.name)) ?? zh[0];
		}
		const ko = voices.filter((v) => v.lang.toLowerCase().startsWith('ko'));
		return ko[0];
	}

	play(segments: Segment[], startAt = 0) {
		this.stop();
		this.queue = segments;
		this.idx = startAt;
		this.stopped = false;
		this.speakNext();
	}

	private speakNext() {
		if (this.stopped || this.idx >= this.queue.length) {
			this.stopped = true;
			this.onState(false, this.idx);
			return;
		}
		const seg = this.queue[this.idx];
		this.onState(true, this.idx);
		const u = new SpeechSynthesisUtterance(seg.text);
		u.lang = seg.lang;
		u.rate = seg.rate ?? (seg.lang.startsWith('zh') ? 0.85 : 1);
		const v = this.pickVoice(seg.lang);
		if (v) u.voice = v;
		u.onend = () => {
			if (this.stopped) return;
			this.idx += 1;
			const pause = seg.pauseAfterMs ?? 0;
			if (pause > 0) {
				this.pauseTimer = setTimeout(() => this.speakNext(), pause);
			} else {
				this.speakNext();
			}
		};
		u.onerror = () => {
			if (this.stopped) return;
			this.idx += 1;
			this.speakNext();
		};
		speechSynthesis.speak(u);
	}

	stop() {
		this.stopped = true;
		if (this.pauseTimer) {
			clearTimeout(this.pauseTimer);
			this.pauseTimer = null;
		}
		if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
		this.onState(false, this.idx);
	}

	get isStopped() {
		return this.stopped;
	}
}
