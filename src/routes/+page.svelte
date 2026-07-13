<script lang="ts">
	// 홈 — 토스 스타일: 한 화면 한 가지 일, 큰 타이포, 명확한 다음 행동.
	import { questions } from '$lib/questions';
	import { loadSrs, masteryStats, allWords } from '$lib/gameLogic';
	import { loadUsage, usageDisplay } from '$lib/usage';
	import { onMount } from 'svelte';

	const totalWords = allWords.length;
	let mastered = $state(0);
	let usageInfo = $state<{ usedLabel: string; limitMin: number; pct: number; near: boolean } | null>(
		null
	);

	onMount(() => {
		mastered = masteryStats(loadSrs(), allWords).mastered;
		const u = loadUsage();
		if (u.calls > 0) usageInfo = usageDisplay(u);
	});

	const menus = [
		{ href: '/audio', icon: '🎧', title: '오디오 학습', desc: '운전 중에도 귀로 반복' },
		{ href: '/games', icon: '🎮', title: '단어 게임', desc: '퀴즈로 빠르게 암기' },
		{ href: '/vocab', icon: '📖', title: '단어장', desc: `빈출 단어 ${totalWords}개` },
		{ href: '/settings', icon: '🔊', title: '음성 설정', desc: '성우 선택 · 저장 관리' }
	];
</script>

<svelte:head><title>TSC 3급 말하기</title></svelte:head>

<main>
	<p class="eyebrow">TSC 3급 말하기</p>
	<h1>오늘은 어떤 연습을<br />해볼까요?</h1>

	<!-- 핵심 행동 하나 -->
	<a class="hero" href="/practice">
		<div class="hero-body">
			<div class="hero-title">🎤 말하기 연습</div>
			<div class="hero-desc">실전처럼 질문 듣고 녹음하면, 발음까지 채점해 드려요</div>
			<div class="hero-meta">{questions.length}문항 · 1~4부</div>
		</div>
		<span class="hero-arrow">→</span>
	</a>

	<div class="grid">
		{#each menus as m (m.href)}
			<a class="card" href={m.href}>
				<span class="card-icon">{m.icon}</span>
				<span class="card-title">{m.title}</span>
				<span class="card-desc">{m.desc}</span>
			</a>
		{/each}
	</div>

	<!-- 학습 현황 -->
	{#if mastered > 0}
		<div class="stat">
			<div class="stat-top">
				<span>외운 단어</span>
				<span class="stat-val">{mastered} / {totalWords}개</span>
			</div>
			<div class="stat-bar">
				<div class="stat-fill" style="width:{Math.round((mastered / totalWords) * 100)}%"></div>
			</div>
		</div>
	{/if}
	{#if usageInfo}
		<div class="stat" class:near={usageInfo.near}>
			<div class="stat-top">
				<span>이번 달 발음평가</span>
				<span class="stat-val">{usageInfo.usedLabel} / {usageInfo.limitMin}분</span>
			</div>
			<div class="stat-bar">
				<div class="stat-fill" style="width:{usageInfo.pct}%"></div>
			</div>
			{#if usageInfo.near}
				<div class="stat-warn">⚠️ 무료 한도가 얼마 안 남았어요</div>
			{/if}
		</div>
	{/if}

	<footer>매일 15분, 소리 내어 · 성조 조심 · 침묵하지 말기 💪</footer>
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
		padding: 2.25rem 1.25rem 3rem;
	}
	.eyebrow {
		color: #8b93a1;
		font-size: 0.9rem;
		margin: 0 0 0.4rem;
	}
	h1 {
		font-size: 1.7rem;
		line-height: 1.35;
		margin: 0 0 1.5rem;
		letter-spacing: -0.02em;
	}
	.hero {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: #3182f6;
		color: #fff;
		text-decoration: none;
		border-radius: 20px;
		padding: 1.35rem 1.25rem;
		margin-bottom: 0.9rem;
		transition: transform 0.12s ease;
	}
	.hero:active {
		transform: scale(0.98);
	}
	.hero-body {
		flex: 1;
	}
	.hero-title {
		font-size: 1.25rem;
		font-weight: 700;
	}
	.hero-desc {
		font-size: 0.9rem;
		opacity: 0.92;
		margin-top: 0.3rem;
		line-height: 1.45;
	}
	.hero-meta {
		font-size: 0.78rem;
		opacity: 0.75;
		margin-top: 0.5rem;
	}
	.hero-arrow {
		font-size: 1.4rem;
		opacity: 0.9;
	}
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.7rem;
		margin-bottom: 1.5rem;
	}
	.card {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		background: #1a1e27;
		border: 1px solid #2a303c;
		border-radius: 16px;
		padding: 1rem;
		text-decoration: none;
		color: #e8eaed;
		transition: transform 0.12s ease;
	}
	.card:active {
		transform: scale(0.97);
	}
	.card-icon {
		font-size: 1.5rem;
		margin-bottom: 0.3rem;
	}
	.card-title {
		font-weight: 700;
		font-size: 0.98rem;
	}
	.card-desc {
		color: #8b93a1;
		font-size: 0.8rem;
		line-height: 1.4;
	}
	.stat {
		background: #1a1e27;
		border: 1px solid #2a303c;
		border-radius: 14px;
		padding: 0.85rem 1rem;
		margin-bottom: 0.7rem;
		font-size: 0.88rem;
	}
	.stat.near {
		border-color: #b45309;
	}
	.stat-top {
		display: flex;
		justify-content: space-between;
		color: #b7bec9;
		margin-bottom: 0.45rem;
	}
	.stat-val {
		color: #e8eaed;
		font-variant-numeric: tabular-nums;
		font-weight: 600;
	}
	.stat-bar {
		height: 6px;
		background: #12151c;
		border-radius: 3px;
		overflow: hidden;
	}
	.stat-fill {
		height: 100%;
		background: linear-gradient(90deg, #3182f6, #7cc6ff);
		transition: width 0.3s;
	}
	.stat.near .stat-fill {
		background: linear-gradient(90deg, #f59e0b, #ef4444);
	}
	.stat-warn {
		color: #fbbf24;
		font-size: 0.8rem;
		margin-top: 0.45rem;
	}
	footer {
		text-align: center;
		color: #6b7280;
		font-size: 0.8rem;
		margin-top: 2rem;
	}
</style>
