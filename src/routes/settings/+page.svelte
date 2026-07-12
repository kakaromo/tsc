<script lang="ts">
	import {
		zhVoices,
		koVoices,
		getZhVoice,
		getKoVoice,
		setZhVoice,
		setKoVoice
	} from '$lib/voices';
	import { speak, stopSpeak, ttsCacheStats, clearTtsCache } from '$lib/tts';
	import { onMount, onDestroy } from 'svelte';

	let zhSel = $state('');
	let koSel = $state('');
	let previewing = $state<string | null>(null);

	// TTS 사용량
	interface TtsUsage {
		tracked: boolean;
		used?: number;
		limit?: number;
		over?: boolean;
		pct?: number;
	}
	let usage = $state<TtsUsage | null>(null);

	// 기기에 저장된 음성 캐시 현황
	let cacheInfo = $state<{ count: number; bytes: number } | null>(null);
	let clearing = $state(false);

	async function refreshCache() {
		cacheInfo = await ttsCacheStats();
	}
	async function onClearCache() {
		if (!confirm('저장된 음성을 모두 지울까요? 다음 재생 때 다시 받아요(무료 한도 사용).')) return;
		clearing = true;
		await clearTtsCache();
		await refreshCache();
		clearing = false;
	}
	function fmtBytes(b: number): string {
		if (b >= 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)}MB`;
		return `${Math.round(b / 1024)}KB`;
	}

	onMount(async () => {
		zhSel = getZhVoice();
		koSel = getKoVoice();
		void refreshCache();
		try {
			const res = await fetch('/api/usage/tts');
			usage = await res.json();
		} catch {
			usage = null;
		}
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

	<!-- 성우 TTS 사용량 -->
	{#if usage?.tracked}
		<div class="usage" class:over={usage.over}>
			<div class="usage-top">
				<span>🎙 이번 달 성우 음성 사용량</span>
				<span class="usage-val">{usage.pct}%</span>
			</div>
			<div class="usage-bar"><div class="usage-fill" style="width:{usage.pct}%"></div></div>
			<div class="usage-sub">
				{(usage.used ?? 0).toLocaleString()} / {(usage.limit ?? 0).toLocaleString()}자 (무료 한도)
				{#if usage.over}
					<strong> ⚠️ 한도 소진 — 자동으로 기본(무료) 음성으로 전환됐어요.</strong>
				{/if}
			</div>
		</div>
	{/if}

	<!-- 기기에 저장된 음성 (재요청 없이 재생) -->
	{#if cacheInfo}
		<div class="cache">
			<div class="cache-info">
				💾 저장된 음성 {cacheInfo.count}개 ({fmtBytes(cacheInfo.bytes)})
				<span class="cache-sub">한 번 받은 음성은 기기에 저장돼 무료 한도를 다시 쓰지 않아요</span>
			</div>
			{#if cacheInfo.count > 0}
				<button class="cache-clear" onclick={onClearCache} disabled={clearing}>
					{clearing ? '지우는 중…' : '비우기'}
				</button>
			{/if}
		</div>
	{/if}

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
	.cache {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		background: #1a1e27;
		border: 1px solid #2a303c;
		border-radius: 12px;
		padding: 0.7rem 0.9rem;
		margin-bottom: 1rem;
	}
	.cache-info {
		flex: 1;
		font-size: 0.88rem;
		color: #b7bec9;
	}
	.cache-sub {
		display: block;
		font-size: 0.76rem;
		color: #6b7280;
		margin-top: 0.15rem;
	}
	.cache-clear {
		background: none;
		border: 1px solid #2a303c;
		color: #8b93a1;
		border-radius: 8px;
		padding: 0.45rem 0.8rem;
		font-size: 0.85rem;
		cursor: pointer;
		white-space: nowrap;
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
	.usage {
		background: #1a1e27;
		border: 1px solid #2a303c;
		border-radius: 12px;
		padding: 0.75rem 0.9rem;
		margin-bottom: 1.25rem;
		font-size: 0.85rem;
	}
	.usage.over {
		border-color: #b45309;
	}
	.usage-top {
		display: flex;
		justify-content: space-between;
		color: #b7bec9;
		margin-bottom: 0.4rem;
	}
	.usage-val {
		font-variant-numeric: tabular-nums;
		color: #e8eaed;
	}
	.usage-bar {
		height: 7px;
		background: #12151c;
		border-radius: 4px;
		overflow: hidden;
	}
	.usage-fill {
		height: 100%;
		background: linear-gradient(90deg, #22c55e, #7cc6ff);
		transition: width 0.3s;
	}
	.usage.over .usage-fill {
		background: linear-gradient(90deg, #f59e0b, #ef4444);
	}
	.usage-sub {
		margin-top: 0.35rem;
		color: #8b93a1;
		font-size: 0.78rem;
	}
	.usage-sub strong {
		color: #fca5a5;
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
