<script lang="ts">
	import { vocabGroups } from '$lib/vocab';
	import { grammarPoints } from '$lib/grammar';
	import { universalAnswers } from '$lib/universals';
	import { speak } from '$lib/tts';

	let view = $state<'vocab' | 'grammar' | 'universal'>('vocab');
	let speaking = $state<string | null>(null);
	let rate = $state(0.85);

	function say(text: string) {
		speak(text, {
			lang: 'zh',
			rate,
			onstart: () => (speaking = text),
			onend: () => (speaking = null),
			onerror: () => (speaking = null)
		});
	}
</script>

<svelte:head>
	<title>2부 빈출 단어장 · TSC 3급</title>
</svelte:head>

<main>
	<header>
		<a class="back" href="/">← 연습으로</a>
		<h1>第2部分 학습</h1>
	</header>

	<!-- 단어장 / 문법 전환 -->
	<div class="switch">
		<button class:on={view === 'vocab'} onclick={() => (view = 'vocab')}>📖 단어장</button>
		<button class:on={view === 'grammar'} onclick={() => (view = 'grammar')}>📐 문법</button>
		<button class:on={view === 'universal'} onclick={() => (view = 'universal')}>🗝 만능답변</button>
	</div>

	<a class="game-cta" href="/games">🎮 게임으로 연습하기 →</a>

	<div class="rate">
		<span>🐢 속도</span>
		<input type="range" min="0.5" max="1.1" step="0.05" bind:value={rate} aria-label="발음 속도" />
		<span class="rate-val">{rate.toFixed(2)}x</span>
	</div>
	<p class="tip">
		{view === 'vocab' ? '단어를 누르면' : view === 'grammar' ? '예문을 누르면' : '문장을 누르면'} 발음을
		들려줘요 🔊
	</p>

	{#if view === 'vocab'}
		{#each vocabGroups as g}
			<section class="group">
				<h2>{g.title}</h2>
				<p class="desc">{g.desc}</p>
				<div class="grid">
					{#each g.items as v}
						<button class="card" class:on={speaking === v.hanzi} onclick={() => say(v.hanzi)}>
							<div class="hz">{v.hanzi}</div>
							<div class="py">{v.pinyin}</div>
							<div class="ko">{v.ko}</div>
							{#if v.note}<div class="note">{v.note}</div>{/if}
						</button>
					{/each}
				</div>
			</section>
		{/each}
		<footer>양사와 존재문(有/在)만 정확하면 2부는 통과 💪</footer>
	{:else if view === 'universal'}
		<p class="uni-intro">
			질문 유형만 알아들으면 조립해서 쓰는 템플릿이에요. 11개만 외우면 3부·4부에서 어떤 질문이
			나와도 침묵하지 않아요.
		</p>
		{#each universalAnswers as u (u.situation)}
			<section class="gram">
				<h2>{u.situation}</h2>
				<div class="formula">{u.trigger}</div>
				<div class="ex-list">
					<button class="ex" class:on={speaking === u.cn} onclick={() => say(u.cn)}>
						<div class="ex-cn">{u.cn}</div>
						<div class="ex-py">{u.pinyin}</div>
						<div class="ex-ko">{u.ko}</div>
					</button>
				</div>
				{#if u.note}<div class="warn">🔁 {u.note}</div>{/if}
			</section>
		{/each}
		<footer>모르는 질문 = 만능답변 + 들린 키워드. 침묵만 안 하면 됩니다 💪</footer>
	{:else}
		{#each grammarPoints as g}
			<section class="gram">
				<h2>{g.title}</h2>
				<div class="formula">{g.formula}</div>
				<p class="desc">{g.desc}</p>
				<div class="ex-list">
					{#each g.examples as e}
						<button class="ex" class:on={speaking === e.cn} onclick={() => say(e.cn)}>
							<div class="ex-cn">{e.cn}</div>
							<div class="ex-py">{e.pinyin}</div>
							<div class="ex-ko">{e.ko}</div>
						</button>
					{/each}
				</div>
				{#if g.warn}<div class="warn">⚠️ {g.warn}</div>{/if}
			</section>
		{/each}
		<footer>어순(동사가 목적어 앞!)과 양사만 지키면 3급은 충분해요 💪</footer>
	{/if}
</main>

<style>
	:global(body) {
		margin: 0;
		background: #0f1115;
		color: #e8eaed;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
	}
	main {
		max-width: 720px;
		margin: 0 auto;
		padding: 1.5rem 1rem 3rem;
	}
	.uni-intro {
		color: #b7bec9;
		font-size: 0.9rem;
		line-height: 1.6;
		background: #12151c;
		border-radius: 10px;
		padding: 0.75rem 0.9rem;
		margin: 0 0 1rem;
	}
	header {
		margin-bottom: 1rem;
	}
	.back {
		color: #7cc6ff;
		text-decoration: none;
		font-size: 0.9rem;
	}
	h1 {
		font-size: 1.35rem;
		margin: 0.5rem 0 0;
	}
	.rate {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-size: 0.85rem;
		color: #8b93a1;
		margin-bottom: 0.5rem;
	}
	.rate input {
		flex: 1;
		accent-color: #7cc6ff;
		max-width: 240px;
	}
	.rate-val {
		font-variant-numeric: tabular-nums;
	}
	.tip {
		color: #8b93a1;
		font-size: 0.85rem;
		margin: 0 0 1.25rem;
	}
	.group {
		margin-bottom: 1.75rem;
	}
	h2 {
		font-size: 1.05rem;
		margin: 0 0 0.25rem;
	}
	.desc {
		color: #8b93a1;
		font-size: 0.85rem;
		margin: 0 0 0.75rem;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 0.6rem;
	}
	.card {
		text-align: left;
		background: #1a1e27;
		border: 1px solid #2a303c;
		border-radius: 12px;
		padding: 0.75rem 0.85rem;
		cursor: pointer;
		color: #e8eaed;
		transition: transform 0.1s;
	}
	.card:hover {
		transform: translateY(-2px);
		border-color: #3a4454;
	}
	.card.on {
		outline: 2px solid #7cc6ff;
	}
	.hz {
		font-size: 1.6rem;
		font-weight: 600;
	}
	.py {
		color: #7cc6ff;
		font-size: 0.95rem;
		margin-top: 0.15rem;
	}
	.ko {
		color: #d4dae3;
		font-size: 0.9rem;
		margin-top: 0.2rem;
	}
	.note {
		color: #8b93a1;
		font-size: 0.8rem;
		margin-top: 0.35rem;
	}
	.switch {
		display: flex;
		gap: 0.4rem;
		margin-bottom: 0.9rem;
	}
	.switch button {
		flex: 1;
		background: #1a1e27;
		border: 1px solid #2a303c;
		color: #8b93a1;
		border-radius: 10px;
		padding: 0.55rem;
		font-size: 0.95rem;
		cursor: pointer;
	}
	.switch button.on {
		background: #2563eb;
		border-color: #2563eb;
		color: #fff;
	}
	.game-cta {
		display: block;
		text-align: center;
		background: linear-gradient(90deg, #7c3aed, #2563eb);
		color: #fff;
		text-decoration: none;
		border-radius: 10px;
		padding: 0.6rem;
		font-size: 0.95rem;
		margin-bottom: 0.9rem;
	}
	.gram {
		margin-bottom: 1.75rem;
		background: #1a1e27;
		border: 1px solid #2a303c;
		border-radius: 12px;
		padding: 1rem 1.1rem;
	}
	.gram h2 {
		margin-top: 0;
	}
	.formula {
		display: inline-block;
		background: #12151c;
		border: 1px solid #2f4256;
		color: #7cc6ff;
		border-radius: 8px;
		padding: 0.4rem 0.7rem;
		font-size: 0.9rem;
		margin-bottom: 0.5rem;
	}
	.ex-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin: 0.75rem 0;
	}
	.ex {
		text-align: left;
		background: #12151c;
		border: 1px solid #2a303c;
		border-radius: 10px;
		padding: 0.6rem 0.8rem;
		cursor: pointer;
		color: #e8eaed;
	}
	.ex:hover {
		border-color: #3a4454;
	}
	.ex.on {
		outline: 2px solid #7cc6ff;
	}
	.ex-cn {
		font-size: 1.25rem;
		font-weight: 600;
	}
	.ex-py {
		color: #7cc6ff;
		font-size: 0.9rem;
		margin-top: 0.15rem;
	}
	.ex-ko {
		color: #b7bec9;
		font-size: 0.88rem;
		margin-top: 0.15rem;
	}
	.warn {
		background: #2a1215;
		border-radius: 8px;
		padding: 0.6rem 0.75rem;
		font-size: 0.85rem;
		color: #fca5a5;
	}
	footer {
		text-align: center;
		color: #6b7280;
		font-size: 0.8rem;
		margin-top: 2rem;
	}
</style>
