<script lang="ts">
	import { onMount } from 'svelte';
	import { sentencePuzzles } from '$lib/sentences';
	import {
		allWords,
		shuffle,
		makeChoices,
		loadSrs,
		saveSrs,
		recordResult,
		weightedPick,
		masteryStats,
		type SrsMap
	} from '$lib/gameLogic';
	import type { Vocab } from '$lib/vocab';
	import { speak } from '$lib/tts';

	type Mode = 'quiz' | 'flash' | 'order';
	let mode = $state<Mode>('quiz');

	// ─── 공통: 스트릭 · SRS ────────────────────────────
	let srs = $state<SrsMap>({});
	let streak = $state(0);
	let best = $state(0);
	let correctCount = $state(0);
	let totalCount = $state(0);

	onMount(() => {
		srs = loadSrs();
		best = Number(localStorage.getItem('tsc-best-streak') ?? 0);
		nextQuiz();
		nextFlash();
		nextOrder();
	});

	const mastery = $derived(masteryStats(srs, allWords));
	const accuracy = $derived(totalCount ? Math.round((correctCount / totalCount) * 100) : 0);

	function onCorrect(hanzi: string) {
		srs = recordResult(srs, hanzi, true);
		saveSrs(srs);
		streak += 1;
		correctCount += 1;
		totalCount += 1;
		if (streak > best) {
			best = streak;
			localStorage.setItem('tsc-best-streak', String(best));
		}
	}
	function onWrong(hanzi: string) {
		srs = recordResult(srs, hanzi, false);
		saveSrs(srs);
		streak = 0;
		totalCount += 1;
	}

	// ─── 발음 (고품질 Azure Neural TTS) ────────────────
	function say(text: string) {
		speak(text, { lang: 'zh', rate: 0.9 });
	}

	// ─── 게임1: 퀴즈 (뜻 맞히기) ───────────────────────
	let qWord = $state<Vocab | null>(null);
	let qChoices = $state<Vocab[]>([]);
	let qPicked = $state<string | null>(null); // 고른 hanzi

	function nextQuiz() {
		qPicked = null;
		const w = weightedPick(allWords, srs);
		qWord = w;
		qChoices = makeChoices(w, allWords);
	}
	function pickQuiz(choice: Vocab) {
		if (qPicked || !qWord) return;
		qPicked = choice.hanzi;
		if (choice.hanzi === qWord.hanzi) {
			onCorrect(qWord.hanzi);
			say(qWord.hanzi);
			setTimeout(nextQuiz, 700);
		} else {
			onWrong(qWord.hanzi);
		}
	}

	// ─── 게임2: 플래시카드 ─────────────────────────────
	let fWord = $state<Vocab | null>(null);
	let fFlipped = $state(false);
	let fDeck: Vocab[] = [];
	let fPos = 0;

	function nextFlash() {
		if (fPos >= fDeck.length) {
			// 덜 익힌 것 위주로 새 덱 구성
			fDeck = shuffle([...allWords]).sort(
				(a, b) => (srs[a.hanzi] ?? 0) - (srs[b.hanzi] ?? 0)
			);
			fPos = 0;
		}
		fWord = fDeck[fPos++];
		fFlipped = false;
	}
	function flashKnow(known: boolean) {
		if (!fWord) return;
		if (known) onCorrect(fWord.hanzi);
		else onWrong(fWord.hanzi);
		if (known) say(fWord.hanzi);
		nextFlash();
	}

	// ─── 게임3: 문장 순서 맞추기 ───────────────────────
	let oPuzzle = $state(sentencePuzzles[0]);
	let oBank = $state<string[]>([]); // 남은 단어(섞임)
	let oPicked = $state<string[]>([]); // 사용자가 배열한 순서
	let oResult = $state<'none' | 'right' | 'wrong'>('none');

	function nextOrder() {
		oResult = 'none';
		oPicked = [];
		const p = sentencePuzzles[Math.floor(Math.random() * sentencePuzzles.length)];
		oPuzzle = p;
		oBank = shuffle(p.tokens);
	}
	function pickToken(t: string, i: number) {
		if (oResult !== 'none') return;
		oPicked = [...oPicked, t];
		oBank = oBank.filter((_, idx) => idx !== i);
		if (oBank.length === 0) checkOrder();
	}
	function undoToken(i: number) {
		if (oResult !== 'none') return;
		const t = oPicked[i];
		oPicked = oPicked.filter((_, idx) => idx !== i);
		oBank = [...oBank, t];
	}
	function checkOrder() {
		const ok = oPicked.join('') === oPuzzle.tokens.join('');
		oResult = ok ? 'right' : 'wrong';
		// 문장 첫 토큰을 SRS 키로 사용(대표)
		const key = oPuzzle.tokens[0];
		if (ok) {
			onCorrect(key);
			say(oPuzzle.tokens.join(''));
		} else {
			onWrong(key);
		}
	}
	function resetOrder() {
		oPicked = [];
		oBank = shuffle(oPuzzle.tokens);
		oResult = 'none';
	}
</script>

<svelte:head><title>학습 게임 · TSC 3급</title></svelte:head>

<main>
	<header>
		<a class="back" href="/vocab">← 단어장/문법</a>
		<h1>🎮 학습 게임</h1>
	</header>

	<!-- 상태 바 -->
	<div class="stats">
		<div class="stat"><span class="s-num">🔥 {streak}</span><span class="s-lab">연속</span></div>
		<div class="stat"><span class="s-num">🏆 {best}</span><span class="s-lab">최고</span></div>
		<div class="stat"><span class="s-num">{accuracy}%</span><span class="s-lab">정답률</span></div>
		<div class="stat">
			<span class="s-num">{mastery.mastered}/{mastery.total}</span><span class="s-lab">마스터</span>
		</div>
	</div>

	<!-- 모드 전환 -->
	<div class="modes">
		<button class:on={mode === 'quiz'} onclick={() => (mode = 'quiz')}>❓ 퀴즈</button>
		<button class:on={mode === 'flash'} onclick={() => (mode = 'flash')}>🔄 카드</button>
		<button class:on={mode === 'order'} onclick={() => (mode = 'order')}>🧩 순서</button>
	</div>

	{#if mode === 'quiz' && qWord}
		<!-- ❓ 퀴즈 -->
		<section class="board">
			<p class="q-ask">이 단어의 뜻은?</p>
			<div class="q-hz">{qWord.hanzi}</div>
			<div class="q-py">{qWord.pinyin}</div>
			<div class="choices">
				{#each qChoices as c}
					<button
						class="choice"
						class:right={qPicked && c.hanzi === qWord.hanzi}
						class:wrong={qPicked === c.hanzi && c.hanzi !== qWord.hanzi}
						disabled={!!qPicked}
						onclick={() => pickQuiz(c)}
					>
						{c.ko}
					</button>
				{/each}
			</div>
			{#if qPicked && qPicked !== qWord.hanzi}
				<button class="next" onclick={nextQuiz}>다음 →</button>
			{/if}
		</section>
	{/if}

	{#if mode === 'flash' && fWord}
		<!-- 🔄 플래시카드 -->
		<section class="board">
			<button class="flash" class:flipped={fFlipped} onclick={() => (fFlipped = !fFlipped)}>
				{#if !fFlipped}
					<div class="f-hz">{fWord.hanzi}</div>
					<div class="f-hint">눌러서 뜻 보기</div>
				{:else}
					<div class="f-py">{fWord.pinyin}</div>
					<div class="f-ko">{fWord.ko}</div>
					{#if fWord.note}<div class="f-note">{fWord.note}</div>{/if}
				{/if}
			</button>
			{#if fFlipped}
				<div class="know-row">
					<button class="know no" onclick={() => flashKnow(false)}>😵 몰랐어요</button>
					<button class="know yes" onclick={() => flashKnow(true)}>😎 알았어요</button>
				</div>
			{/if}
		</section>
	{/if}

	{#if mode === 'order'}
		<!-- 🧩 문장 순서 맞추기 -->
		<section class="board">
			<p class="q-ask">단어를 눌러 올바른 순서로 문장을 만드세요</p>
			<div class="o-ko">{oPuzzle.ko}</div>

			<div class="o-slots" class:right={oResult === 'right'} class:wrong={oResult === 'wrong'}>
				{#each oPicked as t, i}
					<button class="tok picked" onclick={() => undoToken(i)}>{t}</button>
				{/each}
				{#if oPicked.length === 0}<span class="o-placeholder">여기에 배열됩니다</span>{/if}
			</div>

			<div class="o-bank">
				{#each oBank as t, i}
					<button class="tok" onclick={() => pickToken(t, i)}>{t}</button>
				{/each}
			</div>

			{#if oResult === 'right'}
				<div class="o-msg ok">✅ 정답! {oPuzzle.pinyin}</div>
				<button class="next" onclick={nextOrder}>다음 문장 →</button>
			{:else if oResult === 'wrong'}
				<div class="o-msg bad">
					❌ 아쉬워요. 정답: {oPuzzle.tokens.join(' / ')}
					{#if oPuzzle.hint}<div class="o-hint">💡 {oPuzzle.hint}</div>{/if}
				</div>
				<div class="o-again">
					<button class="next ghost" onclick={resetOrder}>다시 풀기</button>
					<button class="next" onclick={nextOrder}>다음 →</button>
				</div>
			{:else if oPuzzle.hint}
				<div class="o-hint">💡 {oPuzzle.hint}</div>
			{/if}
		</section>
	{/if}

	<footer>틀린 단어는 더 자주 나와요 — 매일 조금씩 하면 금방 마스터! 💪</footer>
</main>

<style>
	:global(body) {
		margin: 0;
		background: #0f1115;
		color: #e8eaed;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
	}
	main {
		max-width: 560px;
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
		margin: 0.5rem 0 1rem;
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
		margin-bottom: 1rem;
	}
	.stat {
		background: #1a1e27;
		border: 1px solid #2a303c;
		border-radius: 10px;
		padding: 0.6rem 0.3rem;
		text-align: center;
	}
	.s-num {
		display: block;
		font-size: 1.1rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}
	.s-lab {
		display: block;
		font-size: 0.72rem;
		color: #8b93a1;
		margin-top: 0.15rem;
	}
	.modes {
		display: flex;
		gap: 0.4rem;
		margin-bottom: 1rem;
	}
	.modes button {
		flex: 1;
		background: #1a1e27;
		border: 1px solid #2a303c;
		color: #8b93a1;
		border-radius: 10px;
		padding: 0.55rem;
		font-size: 0.9rem;
		cursor: pointer;
	}
	.modes button.on {
		background: #2563eb;
		border-color: #2563eb;
		color: #fff;
	}
	.board {
		background: #1a1e27;
		border: 1px solid #2a303c;
		border-radius: 16px;
		padding: 1.5rem;
		text-align: center;
	}
	.q-ask,
	.o-ko {
		color: #8b93a1;
		font-size: 0.9rem;
		margin: 0 0 0.75rem;
	}
	.q-hz {
		font-size: 3rem;
		font-weight: 700;
	}
	.q-py {
		color: #7cc6ff;
		margin: 0.25rem 0 1rem;
	}
	.choices {
		display: grid;
		gap: 0.5rem;
	}
	.choice {
		background: #12151c;
		border: 1px solid #2a303c;
		color: #e8eaed;
		border-radius: 10px;
		padding: 0.75rem;
		font-size: 1rem;
		cursor: pointer;
	}
	.choice:hover:not(:disabled) {
		border-color: #3a4454;
	}
	.choice:disabled {
		cursor: default;
	}
	.choice.right {
		background: #14532d;
		border-color: #22c55e;
	}
	.choice.wrong {
		background: #4c1d1d;
		border-color: #ef4444;
	}
	.next {
		margin-top: 1rem;
		background: #2563eb;
		border: none;
		color: #fff;
		border-radius: 10px;
		padding: 0.65rem 1.2rem;
		font-size: 0.95rem;
		cursor: pointer;
	}
	.next.ghost {
		background: #262c38;
	}
	/* 플래시카드 */
	.flash {
		width: 100%;
		min-height: 180px;
		background: #12151c;
		border: 1px solid #2f4256;
		border-radius: 14px;
		color: #e8eaed;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
	}
	.f-hz {
		font-size: 3.5rem;
		font-weight: 700;
	}
	.f-hint {
		color: #6b7280;
		font-size: 0.8rem;
	}
	.f-py {
		color: #7cc6ff;
		font-size: 1.3rem;
	}
	.f-ko {
		font-size: 1.3rem;
	}
	.f-note {
		color: #8b93a1;
		font-size: 0.9rem;
	}
	.know-row {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}
	.know {
		flex: 1;
		border: none;
		border-radius: 10px;
		padding: 0.75rem;
		font-size: 0.95rem;
		cursor: pointer;
		color: #fff;
	}
	.know.yes {
		background: #16a34a;
	}
	.know.no {
		background: #b91c1c;
	}
	/* 문장 순서 */
	.o-slots {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		justify-content: center;
		min-height: 48px;
		align-items: center;
		background: #12151c;
		border: 1px dashed #3a4454;
		border-radius: 10px;
		padding: 0.6rem;
		margin-bottom: 0.75rem;
	}
	.o-slots.right {
		border-color: #22c55e;
		border-style: solid;
	}
	.o-slots.wrong {
		border-color: #ef4444;
		border-style: solid;
	}
	.o-placeholder {
		color: #4b5563;
		font-size: 0.85rem;
	}
	.o-bank {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		justify-content: center;
	}
	.tok {
		background: #262c38;
		border: 1px solid #3a4454;
		color: #e8eaed;
		border-radius: 8px;
		padding: 0.5rem 0.8rem;
		font-size: 1.1rem;
		cursor: pointer;
	}
	.tok.picked {
		background: #1e3a5f;
		border-color: #3b82f6;
	}
	.o-msg {
		margin-top: 1rem;
		font-size: 0.95rem;
	}
	.o-msg.ok {
		color: #4ade80;
	}
	.o-msg.bad {
		color: #fca5a5;
	}
	.o-hint {
		color: #fcd34d;
		font-size: 0.85rem;
		margin-top: 0.4rem;
	}
	.o-again {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
	}
	footer {
		text-align: center;
		color: #6b7280;
		font-size: 0.8rem;
		margin-top: 2rem;
	}
</style>
