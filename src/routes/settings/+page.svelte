<script lang="ts">
	import {
		zhVoices,
		koVoices,
		getZhVoice,
		getKoVoice,
		setZhVoice,
		setKoVoice
	} from '$lib/voices';
	import { speak, stopSpeak } from '$lib/tts';
	import { onMount, onDestroy } from 'svelte';

	let zhSel = $state('');
	let koSel = $state('');
	let previewing = $state<string | null>(null);

	onMount(() => {
		zhSel = getZhVoice();
		koSel = getKoVoice();
	});
	onDestroy(() => stopSpeak());

	const ZH_SAMPLE = '你好，我叫金松炫。我们一起学习中文吧。';
	const KO_SAMPLE = '이 문법은 기본 어순입니다. 천천히 따라 해 보세요.';

	function preview(voice: string, lang: 'zh' | 'ko') {
		previewing = voice;
		speak(lang === 'zh' ? ZH_SAMPLE : KO_SAMPLE, {
			lang,
			voice,
			rate: lang === 'zh' ? 0.9 : 1.15,
			onend: () => (previewing = null),
			onerror: () => (previewing = null)
		});
	}

	function chooseZh(id: string) {
		zhSel = id;
		setZhVoice(id);
		preview(id, 'zh');
	}
	function chooseKo(id: string) {
		koSel = id;
		setKoVoice(id);
		preview(id, 'ko');
	}
</script>

<svelte:head><title>음성 설정 · TSC 3급</title></svelte:head>

<main>
	<header>
		<a class="back" href="/">← 홈</a>
		<h1>🔊 음성 설정</h1>
	</header>
	<p class="hint">원하는 목소리를 고르세요. 누르면 미리 들려주고, 앱 전체에 적용됩니다.</p>

	<section>
		<h2>🇨🇳 중국어 음성</h2>
		{#each zhVoices as v}
			<button class="voice" class:sel={zhSel === v.id} onclick={() => chooseZh(v.id)}>
				<span class="v-info">
					<span class="v-label">{v.label}</span>
					<span class="v-desc">{v.desc}</span>
				</span>
				<span class="v-icon">{previewing === v.id ? '🔊' : zhSel === v.id ? '✓' : '▶'}</span>
			</button>
		{/each}
	</section>

	<section>
		<h2>🇰🇷 한국어 음성 (설명용)</h2>
		{#each koVoices as v}
			<button class="voice" class:sel={koSel === v.id} onclick={() => chooseKo(v.id)}>
				<span class="v-info">
					<span class="v-label">{v.label}</span>
					<span class="v-desc">{v.desc}</span>
				</span>
				<span class="v-icon">{previewing === v.id ? '🔊' : koSel === v.id ? '✓' : '▶'}</span>
			</button>
		{/each}
	</section>

	<footer>선택은 자동 저장돼요 · 오디오 학습·모범발음·게임에 모두 적용됩니다</footer>
</main>

<style>
	:global(body) {
		margin: 0;
		background: #0f1115;
		color: #e8eaed;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
	}
	main {
		max-width: 520px;
		margin: 0 auto;
		padding: 1.5rem 1rem 3rem;
	}
	.back {
		color: #7cc6ff;
		text-decoration: none;
		font-size: 0.9rem;
	}
	h1 {
		font-size: 1.35rem;
		margin: 0.5rem 0 0.5rem;
	}
	.hint {
		color: #8b93a1;
		font-size: 0.85rem;
		margin: 0 0 1.5rem;
	}
	h2 {
		font-size: 1rem;
		margin: 1.5rem 0 0.75rem;
	}
	.voice {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: #1a1e27;
		border: 1px solid #2a303c;
		border-radius: 12px;
		padding: 0.9rem 1rem;
		margin-bottom: 0.5rem;
		cursor: pointer;
		color: #e8eaed;
		text-align: left;
	}
	.voice:hover {
		border-color: #3a4454;
	}
	.voice.sel {
		border-color: #2563eb;
		background: #182130;
	}
	.v-info {
		display: flex;
		flex-direction: column;
	}
	.v-label {
		font-size: 1.05rem;
		font-weight: 600;
	}
	.v-desc {
		font-size: 0.82rem;
		color: #8b93a1;
		margin-top: 0.15rem;
	}
	.v-icon {
		font-size: 1.2rem;
		color: #7cc6ff;
	}
	footer {
		text-align: center;
		color: #6b7280;
		font-size: 0.8rem;
		margin-top: 2rem;
	}
</style>
