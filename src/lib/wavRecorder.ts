// 브라우저에서 WAV(PCM 16kHz mono 16bit)로 녹음하는 간단 레코더.
// Azure 발음평가가 WAV/PCM을 기대하므로 MediaRecorder(WebM) 대신 사용한다.
// 재생용 blob(WAV)도 그대로 쓸 수 있어 "다시듣기"까지 겸한다.

const TARGET_RATE = 16000;

export class WavRecorder {
	private ctx: AudioContext | null = null;
	private source: MediaStreamAudioSourceNode | null = null;
	private processor: ScriptProcessorNode | null = null;
	private stream: MediaStream | null = null;
	private chunks: Float32Array[] = [];
	private sampleRate = TARGET_RATE;

	async start(): Promise<void> {
		this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		// 일부 브라우저는 sampleRate 지정을 무시하므로 실제값을 읽어 리샘플링한다.
		this.ctx = new AudioContext();
		this.sampleRate = this.ctx.sampleRate;
		this.source = this.ctx.createMediaStreamSource(this.stream);
		this.processor = this.ctx.createScriptProcessor(4096, 1, 1);
		this.chunks = [];
		this.processor.onaudioprocess = (e) => {
			this.chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
		};
		this.source.connect(this.processor);
		this.processor.connect(this.ctx.destination);
	}

	/** 녹음을 멈추고 WAV(16kHz mono 16bit) Blob을 반환 */
	async stop(): Promise<Blob> {
		this.processor?.disconnect();
		this.source?.disconnect();
		this.stream?.getTracks().forEach((t) => t.stop());
		await this.ctx?.close();

		const merged = mergeFloat32(this.chunks);
		const down = downsample(merged, this.sampleRate, TARGET_RATE);
		const wav = encodeWav(down, TARGET_RATE);
		this.chunks = [];
		return new Blob([wav], { type: 'audio/wav' });
	}
}

function mergeFloat32(chunks: Float32Array[]): Float32Array {
	const len = chunks.reduce((s, c) => s + c.length, 0);
	const out = new Float32Array(len);
	let off = 0;
	for (const c of chunks) {
		out.set(c, off);
		off += c.length;
	}
	return out;
}

function downsample(buf: Float32Array, from: number, to: number): Float32Array {
	if (to >= from) return buf;
	const ratio = from / to;
	const outLen = Math.floor(buf.length / ratio);
	const out = new Float32Array(outLen);
	for (let i = 0; i < outLen; i++) {
		// 구간 평균으로 간단 리샘플 (앤티앨리어싱 근사)
		const start = Math.floor(i * ratio);
		const end = Math.min(buf.length, Math.floor((i + 1) * ratio));
		let sum = 0;
		for (let j = start; j < end; j++) sum += buf[j];
		out[i] = sum / Math.max(1, end - start);
	}
	return out;
}

function encodeWav(samples: Float32Array, rate: number): ArrayBuffer {
	const buffer = new ArrayBuffer(44 + samples.length * 2);
	const view = new DataView(buffer);
	const writeStr = (off: number, s: string) => {
		for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
	};
	writeStr(0, 'RIFF');
	view.setUint32(4, 36 + samples.length * 2, true);
	writeStr(8, 'WAVE');
	writeStr(12, 'fmt ');
	view.setUint32(16, 16, true); // PCM chunk size
	view.setUint16(20, 1, true); // PCM
	view.setUint16(22, 1, true); // mono
	view.setUint32(24, rate, true);
	view.setUint32(28, rate * 2, true); // byte rate
	view.setUint16(32, 2, true); // block align
	view.setUint16(34, 16, true); // bits per sample
	writeStr(36, 'data');
	view.setUint32(40, samples.length * 2, true);
	// float → 16bit PCM
	let off = 44;
	for (let i = 0; i < samples.length; i++, off += 2) {
		const s = Math.max(-1, Math.min(1, samples[i]));
		view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
	}
	return buffer;
}
