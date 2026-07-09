<script lang="ts">
	import { onDestroy } from 'svelte';
	import { vocabGroups } from '$lib/vocab';
	import { grammarPoints } from '$lib/grammar';
	import { AudioPlayer, type Segment } from '$lib/audioPlayer';

	type Content = 'vocab' | 'grammar';
	let content = $state<Content>('vocab');
	let playing = $state(false);
	let curIndex = $state(0);
	let repeat = $state(true); // 끝나면 처음부터 반복
	let pauseSec = $state(2); // 단어 뜻 떠올릴 시간
	let koRate = $state(1.2); // 한국어(설명·뜻) 재생 속도
	let zhRate = $state(0.9); // 중국어 재생 속도

	const player = new AudioPlayer();
	player.setOnState((p, i) => {
		playing = p;
		curIndex = i;
		if (!p && repeat && !manualStop && i >= segments.length && segments.length > 0) {
			// 자동 반복
			manualStop = false;
			player.play(segments, 0);
		}
	});
	let manualStop = false;

	// 재생할 세그먼트 목록 (컨텐츠·간격에 따라 구성)
	let segments = $state<Segment[]>([]);
	// 세그먼트 index → 화면에 보여줄 라벨
	let labels = $state<string[]>([]);

	function buildVocab(): { segs: Segment[]; labs: string[] } {
		const segs: Segment[] = [];
		const labs: string[] = [];
		for (const g of vocabGroups) {
			for (const v of g.items) {
				// 중국어 → (멈춤, 뜻 떠올리기) → 한국어 뜻
				segs.push({ text: v.hanzi, lang: 'zh-CN', rate: zhRate, pauseAfterMs: pauseSec * 1000 });
				labs.push(`${v.hanzi} (${v.pinyin})`);
				segs.push({ text: v.ko, lang: 'ko-KR', rate: koRate, pauseAfterMs: 400 });
				labs.push(`뜻: ${v.ko}`);
				// 중국어 한 번 더 (각인)
				segs.push({ text: v.hanzi, lang: 'zh-CN', rate: zhRate, pauseAfterMs: 700 });
				labs.push(`${v.hanzi} (${v.pinyin})`);
			}
		}
		return { segs, labs };
	}

	function buildGrammar(): { segs: Segment[]; labs: string[] } {
		const segs: Segment[] = [];
		const labs: string[] = [];
		for (const g of grammarPoints) {
			if (!g.audioScript) continue;
			segs.push({ text: g.audioScript, lang: 'ko-KR', rate: koRate, pauseAfterMs: 800 });
			labs.push(g.title);
			// 예문 중국어 각인
			for (const e of g.examples) {
				segs.push({ text: e.cn, lang: 'zh-CN', rate: zhRate, pauseAfterMs: 500 });
				labs.push(`${e.cn} — ${e.ko}`);
			}
		}
		return { segs, labs };
	}

	function rebuild() {
		const { segs, labs } = content === 'vocab' ? buildVocab() : buildGrammar();
		segments = segs;
		labels = labs;
	}
	rebuild();

	function start() {
		manualStop = false;
		rebuild();
		player.play(segments, 0);
	}
	function stop() {
		manualStop = true;
		player.stop();
	}
	function toggle() {
		if (playing) stop();
		else start();
	}
	function switchContent(c: Content) {
		stop();
		content = c;
		curIndex = 0;
		rebuild();
	}

	onDestroy(() => player.stop());

	const curLabel = $derived(labels[curIndex] ?? '');
	const progress = $derived(
		segments.length ? Math.round((curIndex / segments.length) * 100) : 0
	);
</script>

<svelte:head><title>오디오 학습 (운전용) · TSC 3급</title></svelte:head>

<main>
	<header>
		<a class="back" href="/">← 홈</a>
		<h1>🎧 오디오 학습</h1>
	</header>

	<p class="hint">운전 중엔 재생만 누르고 화면을 보지 마세요. 자동으로 계속 읽어줍니다.</p>

	<div class="switch">
		<button class:on={content === 'vocab'} onclick={() => switchContent('vocab')}>📖 단어</button>
		<button class:on={content === 'grammar'} onclick={() => switchContent('grammar')}>
			📐 문법
		</button>
	</div>

	<!-- 현재 재생 항목 -->
	<div class="now" class:active={playing}>
		<div class="now-label">{playing ? '재생 중' : '정지'}</div>
		<div class="now-text">{curLabel || (content === 'vocab' ? '단어 학습' : '문법 설명')}</div>
		<div class="now-bar"><div class="now-fill" style="width:{progress}%"></div></div>
		<div class="now-sub">{curIndex} / {segments.length}</div>
	</div>

	<!-- 큰 재생 버튼 -->
	<button class="play" class:on={playing} onclick={toggle}>
		{playing ? '⏸ 정지' : '▶ 재생'}
	</button>

	<!-- 설정 -->
	<div class="opts">
		<label class="opt">
			<input type="checkbox" bind:checked={repeat} /> 끝나면 반복
		</label>
		<label class="opt slider">
			<span>🇰🇷 한국어 속도: {koRate.toFixed(2)}x</span>
			<input type="range" min="0.8" max="1.6" step="0.05" bind:value={koRate} onchange={rebuild} />
		</label>
		<label class="opt slider">
			<span>🇨🇳 중국어 속도: {zhRate.toFixed(2)}x</span>
			<input type="range" min="0.6" max="1.2" step="0.05" bind:value={zhRate} onchange={rebuild} />
		</label>
		{#if content === 'vocab'}
			<label class="opt slider">
				<span>⏳ 뜸 들이는 시간: {pauseSec}초</span>
				<input type="range" min="0" max="5" step="1" bind:value={pauseSec} onchange={rebuild} />
			</label>
		{/if}
	</div>

	<p class="tip">
		💡 단어 모드: 중국어 → (뜻 떠올릴 시간) → 한국어 → 중국어 순으로 반복돼요.<br />
		문법 모드: 각 문법을 설명과 예문으로 팟캐스트처럼 들려줘요.
	</p>

	<footer>운전 중엔 안전이 최우선! 조작은 정차 시에만 하세요 🚗</footer>
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
		margin: 0 0 1rem;
	}
	.switch {
		display: flex;
		gap: 0.4rem;
		margin-bottom: 1rem;
	}
	.switch button {
		flex: 1;
		background: #1a1e27;
		border: 1px solid #2a303c;
		color: #8b93a1;
		border-radius: 10px;
		padding: 0.6rem;
		font-size: 1rem;
		cursor: pointer;
	}
	.switch button.on {
		background: #2563eb;
		border-color: #2563eb;
		color: #fff;
	}
	.now {
		background: #1a1e27;
		border: 1px solid #2a303c;
		border-radius: 16px;
		padding: 1.5rem 1rem;
		text-align: center;
		margin-bottom: 1rem;
		min-height: 120px;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.now.active {
		border-color: #7c3aed;
	}
	.now-label {
		font-size: 0.8rem;
		color: #8b93a1;
	}
	.now-text {
		font-size: 1.8rem;
		font-weight: 600;
		margin: 0.5rem 0;
		line-height: 1.3;
		word-break: keep-all;
	}
	.now-bar {
		height: 6px;
		background: #12151c;
		border-radius: 3px;
		overflow: hidden;
		margin: 0.5rem 0 0.35rem;
	}
	.now-fill {
		height: 100%;
		background: linear-gradient(90deg, #7c3aed, #7cc6ff);
		transition: width 0.3s;
	}
	.now-sub {
		font-size: 0.75rem;
		color: #6b7280;
		font-variant-numeric: tabular-nums;
	}
	.play {
		width: 100%;
		background: #7c3aed;
		border: none;
		color: #fff;
		border-radius: 16px;
		padding: 1.5rem;
		font-size: 1.6rem;
		font-weight: 700;
		cursor: pointer;
		margin-bottom: 1.25rem;
	}
	.play.on {
		background: #b91c1c;
	}
	.opts {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1.25rem;
	}
	.opt {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.95rem;
		color: #b7bec9;
	}
	.opt.slider {
		flex-direction: column;
		align-items: stretch;
		gap: 0.35rem;
	}
	.opt.slider input {
		accent-color: #7c3aed;
	}
	.tip {
		color: #8b93a1;
		font-size: 0.82rem;
		line-height: 1.6;
		background: #12151c;
		border-radius: 10px;
		padding: 0.75rem 0.9rem;
	}
	footer {
		text-align: center;
		color: #6b7280;
		font-size: 0.8rem;
		margin-top: 2rem;
	}
</style>
