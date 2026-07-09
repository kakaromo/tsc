// 선택 가능한 Azure Neural 여성 음성 목록.
// 사용자가 미리듣고 고르면 localStorage에 저장되어 앱 전체에 적용된다.

export interface VoiceOption {
	id: string; // Azure voice name
	label: string; // 표시 이름
	desc: string; // 톤 설명
}

export const zhVoices: VoiceOption[] = [
	{ id: 'zh-CN-XiaoyiNeural', label: '샤오이 (晓伊)', desc: '부드럽고 상냥한 톤' },
	{ id: 'zh-CN-XiaoxiaoNeural', label: '샤오샤오 (晓晓)', desc: '또렷하고 표준적' },
	{ id: 'zh-CN-XiaomoNeural', label: '샤오모 (晓墨)', desc: '차분하고 안정적' },
	{ id: 'zh-CN-XiaohanNeural', label: '샤오한 (晓涵)', desc: '따뜻하고 자연스러움' },
	{ id: 'zh-CN-XiaoxuanNeural', label: '샤오쉬안 (晓萱)', desc: '또박또박 명료함' }
];

export const koVoices: VoiceOption[] = [
	{ id: 'ko-KR-JiMinNeural', label: '지민', desc: '부드럽고 따뜻한 톤' },
	{ id: 'ko-KR-SunHiNeural', label: '선히', desc: '또렷하고 표준적' },
	{ id: 'ko-KR-SeoHyeonNeural', label: '서현', desc: '차분하고 안정적' },
	{ id: 'ko-KR-YuJinNeural', label: '유진', desc: '밝고 친근함' }
];

export const DEFAULT_ZH = 'zh-CN-XiaoyiNeural';
export const DEFAULT_KO = 'ko-KR-JiMinNeural';

const KEY_ZH = 'tsc-voice-zh';
const KEY_KO = 'tsc-voice-ko';

export function getZhVoice(): string {
	if (typeof localStorage === 'undefined') return DEFAULT_ZH;
	return localStorage.getItem(KEY_ZH) || DEFAULT_ZH;
}
export function getKoVoice(): string {
	if (typeof localStorage === 'undefined') return DEFAULT_KO;
	return localStorage.getItem(KEY_KO) || DEFAULT_KO;
}
export function setZhVoice(id: string) {
	if (typeof localStorage !== 'undefined') localStorage.setItem(KEY_ZH, id);
}
export function setKoVoice(id: string) {
	if (typeof localStorage !== 'undefined') localStorage.setItem(KEY_KO, id);
}
