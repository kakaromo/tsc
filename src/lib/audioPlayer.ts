// 오디오(팟캐스트) 모드용 순차 TTS 재생기.
// Azure Neural TTS(성우급) 기반 — lib/tts.ts의 speak()로 재생하고,
// 실패 시 자동으로 브라우저 TTS로 폴백된다.

import { speak, stopSpeak } from './tts';

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

	play(segments: Segment[], startAt = 0) {
		this.stop();
		this.queue = segments;
		this.idx = startAt;
		this.stopped = false;
		void this.run();
	}

	private async run() {
		while (!this.stopped && this.idx < this.queue.length) {
			const seg = this.queue[this.idx];
			this.onState(true, this.idx);
			await speak(seg.text, {
				lang: seg.lang.startsWith('zh') ? 'zh' : 'ko',
				// 중국어는 또박또박(0.9), 한국어 설명은 조금 빠르게(1.15)
				rate: seg.rate ?? (seg.lang.startsWith('zh') ? 0.9 : 1.15)
			});
			if (this.stopped) return;
			this.idx += 1;
			const pause = seg.pauseAfterMs ?? 0;
			if (pause > 0) {
				await this.wait(pause);
				if (this.stopped) return;
			}
		}
		if (!this.stopped) {
			this.stopped = true;
			this.onState(false, this.idx);
		}
	}

	private wait(ms: number): Promise<void> {
		return new Promise((resolve) => {
			this.pauseTimer = setTimeout(resolve, ms);
		});
	}

	stop() {
		this.stopped = true;
		if (this.pauseTimer) {
			clearTimeout(this.pauseTimer);
			this.pauseTimer = null;
		}
		stopSpeak();
		this.onState(false, this.idx);
	}

	get isStopped() {
		return this.stopped;
	}
}
