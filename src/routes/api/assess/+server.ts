import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

// POST /api/assess
// body: WAV(PCM 16kHz mono 16bit) 바이너리
// query: ?ref=<채점 기준 중국어 문장>
// 반환: Azure 발음평가 점수(정확도/유창성/완성도/종합) + 성조 포함 발음 점수
export const POST: RequestHandler = async ({ request, url }) => {
	const key = env.AZURE_SPEECH_KEY;
	const region = env.AZURE_SPEECH_REGION;

	// 키 미설정 시 프론트가 무료 채점으로 폴백할 수 있도록 명시적 신호
	if (!key || !region) {
		return json({ configured: false }, { status: 200 });
	}

	const refText = url.searchParams.get('ref') ?? '';
	if (!refText) throw error(400, 'ref(채점 기준 문장)가 필요합니다.');

	const audio = new Uint8Array(await request.arrayBuffer());
	if (audio.byteLength === 0) throw error(400, '오디오가 비어 있습니다.');

	try {
		const result = await assess(key, region, refText, audio);
		// 청구 기준이 되는 오디오 길이(초). PCM 16kHz·16bit·mono → 바이트/(16000*2)
		const pcmBytes = extractPcm(audio).byteLength;
		const audioSeconds = Math.round((pcmBytes / (16000 * 2)) * 10) / 10;
		return json({ configured: true, audioSeconds, ...result });
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		throw error(502, `Azure 발음평가 실패: ${msg}`);
	}
};

interface WordScore {
	word: string; // 글자(음절)
	accuracy: number; // 이 글자의 발음 정확도 0~100
	errorType: string; // None | Mispronunciation | Omission | Insertion
}

interface AssessResult {
	recognized: string;
	accuracy: number; // 발음 정확도(성조 포함)
	fluency: number; // 유창성
	completeness: number; // 완성도
	pron: number; // 종합 발음 점수
	words: WordScore[]; // 글자별 상세 점수
}

// WAV 바이트에서 'data' 청크의 PCM 페이로드만 추출.
// 표준 44바이트 헤더가 아닌 경우(fmt에 extra param, LIST 청크 등)도 처리.
function extractPcm(wav: Uint8Array): Uint8Array {
	// "RIFF"...."WAVE" 형식이 아니면 그대로 반환(이미 raw PCM으로 간주)
	if (wav.byteLength < 12 || String.fromCharCode(wav[0], wav[1], wav[2], wav[3]) !== 'RIFF') {
		return wav;
	}
	let off = 12; // RIFF(4) + size(4) + WAVE(4)
	while (off + 8 <= wav.byteLength) {
		const id = String.fromCharCode(wav[off], wav[off + 1], wav[off + 2], wav[off + 3]);
		const size =
			wav[off + 4] | (wav[off + 5] << 8) | (wav[off + 6] << 16) | (wav[off + 7] << 24);
		const dataStart = off + 8;
		if (id === 'data') {
			const end = Math.min(wav.byteLength, dataStart + (size >>> 0));
			return wav.subarray(dataStart, end);
		}
		// 청크는 짝수 바이트 정렬
		off = dataStart + size + (size % 2);
	}
	// data 청크를 못 찾으면 표준 헤더 가정
	return wav.byteLength > 44 ? wav.subarray(44) : wav;
}

function assess(
	key: string,
	region: string,
	refText: string,
	wav: Uint8Array
): Promise<AssessResult> {
	return new Promise((resolve, reject) => {
		const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
		speechConfig.speechRecognitionLanguage = 'zh-CN';

		// WAV(PCM 16kHz mono 16bit) push stream
		const format = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
		const pushStream = sdk.AudioInputStream.createPushStream(format);
		// WAV의 'data' 청크를 찾아 PCM 데이터만 밀어넣음 (헤더 길이가 44 아닐 수 있음)
		const pcm = extractPcm(wav);
		pushStream.write(pcm.slice().buffer);
		pushStream.close();

		const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

		const paConfig = new sdk.PronunciationAssessmentConfig(
			refText,
			sdk.PronunciationAssessmentGradingSystem.HundredMark,
			sdk.PronunciationAssessmentGranularity.Phoneme,
			false
		);

		const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
		paConfig.applyTo(recognizer);

		recognizer.recognizeOnceAsync(
			(res) => {
				try {
					if (res.reason === sdk.ResultReason.RecognizedSpeech) {
						const pa = sdk.PronunciationAssessmentResult.fromResult(res);
						resolve({
							recognized: res.text ?? '',
							accuracy: Math.round(pa.accuracyScore),
							fluency: Math.round(pa.fluencyScore),
							completeness: Math.round(pa.completenessScore),
							pron: Math.round(pa.pronunciationScore),
							words: parseWords(res)
						});
					} else if (res.reason === sdk.ResultReason.NoMatch) {
						reject(new Error('음성을 인식하지 못했습니다. 더 또렷하게 녹음해 주세요.'));
					} else {
						reject(new Error(`인식 실패 (reason=${res.reason})`));
					}
				} finally {
					recognizer.close();
				}
			},
			(err) => {
				recognizer.close();
				reject(new Error(err));
			}
		);
	});
}

// Azure 상세 JSON에서 글자(음절)별 점수를 추출.
// NBest[0].Words[] 각 항목: { Word, PronunciationAssessment: { AccuracyScore, ErrorType } }
function parseWords(res: sdk.SpeechRecognitionResult): WordScore[] {
	try {
		const raw = res.properties.getProperty(
			sdk.PropertyId.SpeechServiceResponse_JsonResult
		);
		if (!raw) return [];
		const json = JSON.parse(raw);
		const words = json?.NBest?.[0]?.Words;
		if (!Array.isArray(words)) return [];
		return words.map((w: any) => ({
			word: w.Word ?? '',
			accuracy: Math.round(w.PronunciationAssessment?.AccuracyScore ?? 0),
			errorType: w.PronunciationAssessment?.ErrorType ?? 'None'
		}));
	} catch {
		return [];
	}
}
