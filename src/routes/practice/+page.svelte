<script lang="ts">
	import { questions } from '$lib/questions';
	import { checklist } from '$lib/checklist';
	import { matchScore, markChars, scoreComment, passVerdict, type CharMark } from '$lib/score';
	import { WavRecorder } from '$lib/wavRecorder';
	import { scenes } from '$lib/scenes';
	import { loadUsage, addUsage, usageDisplay } from '$lib/usage';
	import { speak, stopSpeak, unlockAudio } from '$lib/tts';
	import { onMount } from 'svelte';

	// ─── 상태 ───────────────────────────────────────────
	let index = $state(0);
	let showPinyin = $state(true);
	let showKo = $state(true);
	let showSample = $state(false);

	const q = $derived(questions[index]);

	// ─── 타이머 ─────────────────────────────────────────
	type Phase = 'idle' | 'question' | 'prep' | 'answer' | 'done';
	let phase = $state<Phase>('idle');
	let remaining = $state(0);
	let timerId: ReturnType<typeof setInterval> | null = null;

	function clearTimer() {
		if (timerId !== null) {
			clearInterval(timerId);
			timerId = null;
		}
	}

	function tick() {
		remaining -= 1;
		if (remaining <= 0) {
			clearTimer();
			if (phase === 'prep') {
				startAnswer();
			} else if (phase === 'answer') {
				phase = 'done';
				finishAndScore();
			}
		}
	}

	// 실제 시험처럼: 질문 음성 재생 → 준비 시간 → 답변(녹음)
	async function startPrep() {
		clearTimer();
		unlockAudio(); // iOS 등에서 이어지는 자동 재생 권한 확보
		phase = 'question';
		remaining = 0;
		await speakPrompt();
		if (phase !== 'question') return; // 재생 중 리셋/문항 이동함
		phase = 'prep';
		remaining = q.prepSec;
		timerId = setInterval(tick, 1000);
	}

	// 질문(중국어) 음성 재생. 재생이 끝날 때 resolve.
	async function speakPrompt() {
		isSpeaking = true;
		try {
			await speak(q.prompt, { lang: 'zh', rate: speechRate });
		} finally {
			isSpeaking = false;
		}
	}

	function startAnswer() {
		clearTimer();
		phase = 'answer';
		remaining = q.answerSec;
		startRecording();
		startRecognition();
		timerId = setInterval(tick, 1000);
	}

	function resetTimer() {
		clearTimer();
		phase = 'idle';
		remaining = 0;
		stopSpeak();
		isSpeaking = false;
		stopRecording();
		stopRecognition();
	}

	// 답변 중 "중지" 버튼: 타이머만 멈추고 지금까지 녹음분으로 채점
	function stopAnswer() {
		clearTimer();
		if (phase === 'answer') {
			phase = 'done';
			finishAndScore();
		} else {
			resetTimer();
		}
	}

	// ─── 마이크 녹음 (WAV, Azure 발음평가용) ───────────
	let wavRec: WavRecorder | null = null;
	let recordedBlob: Blob | null = null;
	let recordingUrl = $state<string | null>(null);
	let isRecording = $state(false);
	let micError = $state<string | null>(null);

	async function startRecording() {
		micError = null;
		if (recordingUrl) {
			URL.revokeObjectURL(recordingUrl);
			recordingUrl = null;
		}
		recordedBlob = null;
		try {
			wavRec = new WavRecorder();
			await wavRec.start();
			isRecording = true;
		} catch (err) {
			micError = '마이크를 사용할 수 없습니다. 브라우저 권한을 확인해 주세요.';
			isRecording = false;
			wavRec = null;
		}
	}

	async function stopRecording() {
		if (wavRec) {
			try {
				recordedBlob = await wavRec.stop();
				recordingUrl = URL.createObjectURL(recordedBlob);
			} catch {
				/* noop */
			}
			wavRec = null;
		}
		isRecording = false;
	}

	// ─── TTS (모범 발음 듣기) ──────────────────────────
	let ttsSupported = $state(true);
	let isSpeaking = $state(false);
	let speakingWord = $state<string | null>(null); // 지금 읽고 있는 글자
	let speechRate = $state(0.85); // 사용자가 조절하는 재생 속도(0.5~1.2)

	// 고품질(Azure Neural) TTS로 중국어 텍스트 재생. slow=true면 더 느리게.
	function speakText(text: string, slow = false, word: string | null = null) {
		const rate = slow ? Math.max(0.5, speechRate - 0.2) : speechRate;
		speak(text, {
			lang: 'zh',
			rate,
			onstart: () => {
				isSpeaking = true;
				speakingWord = word;
			},
			onend: () => {
				isSpeaking = false;
				speakingWord = null;
			},
			onerror: () => {
				isSpeaking = false;
				speakingWord = null;
			}
		});
	}

	function speak_() {
		speakText(q.sample, false);
	}

	// 글자 하나를 천천히 읽어줌 (클릭 시)
	function speakWord(w: string) {
		speakText(w, true, w);
	}

	// ─── 음성인식 채점 (무료, Chrome 계열) ─────────────
	// SpeechRecognition은 성조를 구분하지 못하므로 "글자 전달"만 채점합니다.
	let recognition: any = null;
	let heardText = $state(''); // 인식된 누적 텍스트
	let scoreValue = $state<number | null>(null);
	let charMarks = $state<CharMark[]>([]);
	let comment = $state('');
	// 브라우저가 음성인식을 지원하는지
	const SR =
		typeof window !== 'undefined'
			? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
			: undefined;
	const srSupported = !!SR;

	function startRecognition() {
		if (!SR) return;
		heardText = '';
		scoreValue = null;
		charMarks = [];
		comment = '';
		try {
			recognition = new SR();
			recognition.lang = 'zh-CN';
			recognition.continuous = true;
			recognition.interimResults = true;
			recognition.onresult = (e: any) => {
				let full = '';
				for (let i = 0; i < e.results.length; i++) {
					full += e.results[i][0].transcript;
				}
				heardText = full;
			};
			recognition.onerror = () => {};
			recognition.start();
		} catch {
			recognition = null;
		}
	}

	function stopRecognition() {
		if (recognition) {
			try {
				recognition.stop();
			} catch {
				/* noop */
			}
			recognition = null;
		}
		// 인식된 게 있으면 채점 (인사말 등을 뺀 scoreTarget 우선)
		if (srSupported && heardText.trim()) {
			const target = q.scoreTarget ?? q.sample;
			const r = matchScore(heardText, target);
			scoreValue = r.score;
			charMarks = markChars(heardText, target);
			comment = scoreComment(r.score);
		}
	}

	// ─── Azure 발음평가 (성조 포함 · 서버 경유) ────────
	interface AzureWord {
		word: string;
		accuracy: number;
		errorType: string;
	}
	interface AzureScore {
		configured: boolean;
		recognized?: string;
		accuracy?: number;
		fluency?: number;
		completeness?: number;
		pron?: number;
		words?: AzureWord[];
		audioSeconds?: number;
	}
	let azure = $state<AzureScore | null>(null);
	// 발음평가 점수 → 「중국인이 알아듣는가 / 3급 합격권인가」 판정
	const verdict = $derived(azure?.configured ? passVerdict(azure) : null);
	let azureLoading = $state(false);
	let azureError = $state<string | null>(null);

	// Azure 사용량 (월별 누적)
	let usage = $state(loadUsage());
	const usageInfo = $derived(usageDisplay(usage));
	onMount(() => {
		usage = loadUsage(); // 클라이언트에서 최신값 로드(월 리셋 반영)
	});

	// 발음이 약한 글자(60점 미만 또는 빠뜨린 글자)
	const weakWords = $derived(
		(azure?.words ?? []).filter((w) => w.errorType === 'Omission' || w.accuracy < 60)
	);

	async function assessWithAzure() {
		if (!recordedBlob) return;
		azure = null;
		azureError = null;
		azureLoading = true;
		try {
			const target = q.scoreTarget ?? q.sample;
			const res = await fetch(`/api/assess?ref=${encodeURIComponent(target)}`, {
				method: 'POST',
				headers: { 'content-type': 'audio/wav' },
				body: recordedBlob
			});
			if (!res.ok) {
				const t = await res.text();
				throw new Error(t || `서버 오류 (${res.status})`);
			}
			const data = (await res.json()) as AzureScore;
			azure = data; // configured=false면 프론트가 무료 채점만 보여줌
			// 실제 Azure 채점이 일어난 경우에만 사용량 누적
			if (data.configured && typeof data.audioSeconds === 'number') {
				usage = addUsage(data.audioSeconds);
			}
		} catch (e) {
			azureError = e instanceof Error ? e.message : String(e);
		} finally {
			azureLoading = false;
		}
	}

	// 답변 종료 후 채점 파이프라인: 녹음 정지 → (무료 인식 채점) → Azure 채점
	async function finishAndScore() {
		await stopRecording();
		stopRecognition();
		await assessWithAzure();
	}

	// ─── 자가 점검 체크리스트 ──────────────────────────
	let checked = $state<Record<string, boolean>>({});
	const selfScore = $derived(
		Math.round((checklist.filter((c) => checked[c.id]).length / checklist.length) * 100)
	);

	// ─── 문제 이동 ─────────────────────────────────────
	// 존재하는 부분 번호 목록 (탭용)
	const sections = $derived([...new Set(questions.map((x) => x.section))].sort((a, b) => a - b));

	function goTo(next: number) {
		if (next < 0 || next >= questions.length || next === index) return;
		resetTimer();
		stopRecognition();
		if (recordingUrl) {
			URL.revokeObjectURL(recordingUrl);
			recordingUrl = null;
		}
		heardText = '';
		scoreValue = null;
		charMarks = [];
		comment = '';
		checked = {};
		azure = null;
		azureError = null;
		azureLoading = false;
		showSample = false;
		index = next;
	}

	function go(delta: number) {
		goTo(index + delta);
	}

	// 해당 부분의 첫 문항으로 점프
	function goToSection(s: number) {
		const target = questions.findIndex((x) => x.section === s);
		if (target >= 0) goTo(target);
	}

	// mm:ss 포맷
	function fmt(sec: number): string {
		const m = Math.floor(sec / 60);
		const s = sec % 60;
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	const phaseLabel = $derived(
		phase === 'question'
			? '질문 듣는 중…'
			: phase === 'prep'
				? '준비 시간'
				: phase === 'answer'
					? '답변 시간 (녹음 중)'
					: phase === 'done'
						? '완료'
						: '대기'
	);
</script>

<svelte:head>
	<title>말하기 연습 · TSC 3급</title>
</svelte:head>

<main>
	<header>
		<a class="back" href="/" aria-label="홈으로">←</a>
		<h1>말하기 연습</h1>
		<p class="progress">{index + 1}/{questions.length}</p>
	</header>
	<div class="pbar">
		<div class="pfill" style="width:{((index + 1) / questions.length) * 100}%"></div>
	</div>

	<!-- 부분(部分) 이동 탭 -->
	<div class="tabs">
		{#each sections as s}
			<button class="tab" class:on={q.section === s} onclick={() => goToSection(s)}>
				第{s}部分
			</button>
		{/each}
	</div>

	<section class="card">
		<div class="part">{q.part}</div>

		<!-- 2부: 그림 (SVG 일러스트) -->
		{#if q.scene}
			<figure class="scene">
				{#if scenes[q.id]}
					<div class="scene-img">{@html scenes[q.id]}</div>
				{/if}
				<figcaption class="scene-text">{q.scene}</figcaption>
			</figure>
		{/if}

		<div class="prompt">
			<div class="cn">{q.prompt}</div>
			{#if showPinyin}<div class="pinyin">{q.promptPinyin}</div>{/if}
			{#if showKo}<div class="ko">{q.promptKo}</div>{/if}
		</div>

		<!-- 타이머 -->
		<div
			class="timer"
			class:active={phase === 'question' || phase === 'prep' || phase === 'answer'}
			class:answer={phase === 'answer'}
		>
			<div class="phase-label">{phaseLabel}</div>
			<div class="time">{phase === 'question' ? '🔊' : fmt(remaining)}</div>
			<div class="hint">질문 듣기 → 준비 {q.prepSec}초 → 답변 {q.answerSec}초</div>
		</div>

		{#if phase === 'idle' || phase === 'done'}
			<button class="cta" onclick={startPrep}>
				{phase === 'done' ? '다시 도전하기' : '시작하기'}
			</button>
		{:else}
			<button class="cta stop" onclick={stopAnswer}>중지</button>
		{/if}
		<div class="sub-actions">
			<button
				onclick={() => speakPrompt()}
				disabled={isSpeaking || phase === 'answer' || !ttsSupported}
			>
				❓ 질문 듣기
			</button>
			<button onclick={speak_} disabled={isSpeaking || !ttsSupported}>
				🔊 {isSpeaking ? '재생 중…' : '모범 발음'}
			</button>
		</div>

		<!-- 재생 속도 조절 (여성 음성) -->
		<div class="rate">
			<span class="rate-label">🐢 속도</span>
			<input
				type="range"
				min="0.5"
				max="1.2"
				step="0.05"
				bind:value={speechRate}
				aria-label="발음 재생 속도"
			/>
			<span class="rate-val">{speechRate.toFixed(2)}x</span>
		</div>

		{#if micError}<p class="error">{micError}</p>{/if}
		{#if !ttsSupported}<p class="error">이 브라우저는 음성 합성(TTS)을 지원하지 않습니다.</p>{/if}

		<!-- 녹음 다시듣기 -->
		{#if recordingUrl}
			<div class="playback">
				<div class="playback-label">🎙 내 답변 다시듣기</div>
				<audio controls src={recordingUrl}></audio>
			</div>
		{/if}

		<!-- Azure 발음평가 (성조 포함) -->
		{#if phase === 'done'}
			{#if azureLoading}
				<div class="scorebox muted">🎯 발음평가 채점 중… (Azure)</div>
			{:else if azureError}
				<div class="scorebox muted">발음평가 오류: {azureError}</div>
			{:else if azure?.configured}
				<div class="scorebox azure">
					<div class="score-head">
						<span class="score-title">🎯 발음 종합 점수 (성조 포함)</span>
						<span class="score-num">{azure.pron}<small>/100</small></span>
					</div>
					<div class="azure-grid">
						<div><span class="g-num">{azure.accuracy}</span><span class="g-lab">정확도</span></div>
						<div><span class="g-num">{azure.fluency}</span><span class="g-lab">유창성</span></div>
						<div>
							<span class="g-num">{azure.completeness}</span><span class="g-lab">완성도</span>
						</div>
					</div>

					<!-- 중국인 청취 기준 합격권 판정 -->
					{#if verdict}
						<div class="verdict {verdict.grade}">
							<div class="v-title">
								{verdict.title} <span class="v-sub">— 중국인이 알아들을 수 있는가 기준</span>
							</div>
							<div class="v-desc">{verdict.desc}</div>
						</div>
					{/if}

					<!-- 글자별 발음 점수 -->
					{#if azure.words && azure.words.length}
						<div class="word-label">글자를 누르면 정확한 발음을 들려줘요 🔊 (색이 진할수록 잘못됨)</div>
						<div class="words">
							{#each azure.words as w}
								<button
									type="button"
									class="w"
									class:omit={w.errorType === 'Omission'}
									class:playing={speakingWord === w.word}
									style="--acc:{w.accuracy}"
									onclick={() => speakWord(w.word)}
									title="눌러서 발음 듣기"
								>
									{w.word}
									<span class="w-score">{w.errorType === 'Omission' ? '빠짐' : w.accuracy}</span>
								</button>
							{/each}
						</div>
						{#if weakWords.length}
							<div class="weak">
								⚠️ 특히 연습할 글자: {weakWords.map((w) => w.word).join(', ')}
							</div>
						{/if}
					{/if}

					{#if azure.recognized}<div class="heard">인식됨: {azure.recognized}</div>{/if}
					<div class="comment">{scoreComment(azure.pron ?? 0)}</div>
				</div>
			{/if}
		{/if}

		<!-- 자동 채점 결과 (음성인식 · 글자 전달) — Azure 미설정 시 폴백 -->
		{#if phase === 'done' && !azure?.configured && !azureLoading}
			{#if !srSupported}
				<div class="scorebox muted">
					이 브라우저는 자동 음성인식을 지원하지 않아요. (Chrome 권장) 아래 자가 점검으로 채점해보세요.
				</div>
			{:else if scoreValue !== null}
				<div class="scorebox">
					<div class="score-head">
						<span class="score-title">글자 전달 점수</span>
						<span class="score-num">{scoreValue}<small>/100</small></span>
					</div>
					<div class="marks">
						{#each charMarks as m}<span class="mark" class:bad={!m.ok}>{m.ch}</span>{/each}
					</div>
					{#if heardText}<div class="heard">인식됨: {heardText}</div>{/if}
					<div class="comment">{comment}</div>
					<div class="disclaimer">
						※ 음성인식은 성조를 구분하지 못해요. 성조는 아래 자가 점검으로 확인하세요.
					</div>
				</div>
			{:else}
				<div class="scorebox muted">소리가 인식되지 않았어요. 마이크에 가까이, 또렷하게 다시 해보세요.</div>
			{/if}
		{/if}

		<!-- 자가 점검 체크리스트 -->
		{#if phase === 'done'}
			<div class="selfcheck">
				<div class="selfcheck-head">
					<span>✅ 자가 점검 (성조·유창성)</span>
					<span class="self-num">{selfScore}점</span>
				</div>
				{#each checklist as c}
					<label class="check-row">
						<input type="checkbox" bind:checked={checked[c.id]} />
						<span class="check-label">
							{c.label}
							<span class="check-hint">{c.hint}</span>
						</span>
					</label>
				{/each}
				<div class="selfcheck-tip">
					모범 발음(🔊)과 내 녹음(🎙)을 번갈아 들으며 체크하세요.
				</div>
			</div>
		{/if}

		<!-- 모범 답변 -->
		<div class="sample">
			<button class="link" onclick={() => (showSample = !showSample)}>
				{showSample ? '▲ 모범 답변 숨기기' : '▼ 모범 답변 보기'}
			</button>
			{#if showSample}
				<div class="sample-body">
					<div class="cn">{q.sample}</div>
					{#if showPinyin}<div class="pinyin">{q.samplePinyin}</div>{/if}
					{#if showKo}<div class="ko">{q.sampleKo}</div>{/if}
					{#if q.tip}<div class="tip">💡 {q.tip}</div>{/if}
				</div>
			{/if}
		</div>
	</section>

	<!-- 하단 도구 -->
	<div class="toolbar">
		<button onclick={() => go(-1)} disabled={index === 0}>← 이전</button>
		<label><input type="checkbox" bind:checked={showPinyin} /> 병음</label>
		<label><input type="checkbox" bind:checked={showKo} /> 해석</label>
		<button onclick={() => go(1)} disabled={index === questions.length - 1}>다음 →</button>
	</div>

	<!-- Azure 발음평가 사용량 (이번 달) -->
	{#if usage.calls > 0}
		<div class="usage" class:near={usageInfo.near}>
			<div class="usage-top">
				<span>🎯 이번 달 발음평가 사용량</span>
				<span class="usage-val">{usageInfo.usedLabel} / {usageInfo.limitMin}분</span>
			</div>
			<div class="usage-bar">
				<div class="usage-fill" style="width:{usageInfo.pct}%"></div>
			</div>
			<div class="usage-sub">
				{usageInfo.calls}회 채점 · 무료 한도의 {usageInfo.pct}%
				{#if usageInfo.near}<strong> ⚠️ 한도 임박!</strong>{/if}
			</div>
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
		max-width: 640px;
		margin: 0 auto;
		padding: 1.5rem 1rem 3rem;
	}
	header {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		margin-bottom: 0.6rem;
	}
	.back {
		color: #8b93a1;
		text-decoration: none;
		font-size: 1.3rem;
		line-height: 1;
		padding: 0.2rem 0.3rem;
	}
	h1 {
		font-size: 1.2rem;
		margin: 0;
		flex: 1;
		letter-spacing: -0.01em;
	}
	.progress {
		color: #8b93a1;
		margin: 0;
		font-variant-numeric: tabular-nums;
		font-size: 0.9rem;
	}
	.pbar {
		height: 4px;
		background: #1a1e27;
		border-radius: 2px;
		overflow: hidden;
		margin-bottom: 1rem;
	}
	.pfill {
		height: 100%;
		background: #3182f6;
		transition: width 0.25s ease;
	}
	.tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-bottom: 0.9rem;
	}
	.tab {
		background: #1a1e27;
		border: 1px solid #2a303c;
		color: #8b93a1;
		border-radius: 999px;
		padding: 0.35rem 0.85rem;
		font-size: 0.85rem;
		cursor: pointer;
	}
	.tab.on {
		background: #2563eb;
		border-color: #2563eb;
		color: #fff;
	}
	.usage {
		background: #1a1e27;
		border: 1px solid #2a303c;
		border-radius: 12px;
		padding: 0.75rem 0.9rem;
		margin-bottom: 0.9rem;
		font-size: 0.85rem;
	}
	.usage.near {
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
	.usage.near .usage-fill {
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
	.card {
		background: #1a1e27;
		border: 1px solid #2a303c;
		border-radius: 16px;
		padding: 1.5rem;
	}
	.part {
		font-size: 0.8rem;
		color: #8b93a1;
		margin-bottom: 0.75rem;
	}
	.scene {
		margin: 0 0 1rem;
		background: #12151c;
		border: 1px solid #2a303c;
		border-radius: 12px;
		padding: 1rem;
		text-align: center;
	}
	.scene-img {
		max-width: 300px;
		margin: 0 auto;
	}
	.scene-img :global(svg) {
		width: 100%;
		height: auto;
		display: block;
	}
	.scene-text {
		font-size: 0.9rem;
		color: #8b93a1;
		margin-top: 0.6rem;
	}
	.prompt {
		margin-bottom: 1.25rem;
	}
	.cn {
		font-size: 1.6rem;
		font-weight: 600;
		line-height: 1.4;
	}
	.pinyin {
		color: #7cc6ff;
		margin-top: 0.35rem;
		font-size: 1rem;
	}
	.ko {
		color: #b7bec9;
		margin-top: 0.25rem;
		font-size: 0.95rem;
	}
	.timer {
		text-align: center;
		background: #12151c;
		border-radius: 12px;
		padding: 1rem;
		margin-bottom: 1rem;
		border: 1px solid #2a303c;
		transition: border-color 0.2s;
	}
	.timer.active {
		border-color: #3b82f6;
	}
	.timer.answer {
		border-color: #ef4444;
	}
	.phase-label {
		font-size: 0.8rem;
		color: #8b93a1;
	}
	.time {
		font-size: 2.75rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		line-height: 1.1;
	}
	.hint {
		font-size: 0.75rem;
		color: #6b7280;
	}
	.cta {
		width: 100%;
		background: #3182f6;
		border: none;
		color: #fff;
		border-radius: 14px;
		padding: 1.05rem;
		font-size: 1.1rem;
		font-weight: 700;
		cursor: pointer;
		margin-bottom: 0.6rem;
		transition: transform 0.12s ease, background 0.15s;
	}
	.cta:hover {
		background: #2b74dd;
	}
	.cta:active {
		transform: scale(0.98);
	}
	.cta.stop {
		background: #b91c1c;
	}
	.sub-actions {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}
	.sub-actions button {
		flex: 1;
		white-space: nowrap;
	}
	.verdict {
		border-radius: 10px;
		padding: 0.7rem 0.85rem;
		margin: 0.75rem 0 0.25rem;
		border: 1px solid;
		border-left-width: 5px;
	}
	.verdict.pass {
		border-color: #22c55e;
		background: rgba(34, 197, 94, 0.08);
	}
	.verdict.borderline {
		border-color: #eab308;
		background: rgba(234, 179, 8, 0.08);
	}
	.verdict.risk {
		border-color: #f97316;
		background: rgba(249, 115, 22, 0.08);
	}
	.verdict.fail {
		border-color: #ef4444;
		background: rgba(239, 68, 68, 0.08);
	}
	.v-title {
		font-weight: 700;
		font-size: 0.95rem;
	}
	.v-sub {
		font-weight: 400;
		font-size: 0.78rem;
		color: #8b93a1;
	}
	.v-desc {
		font-size: 0.85rem;
		color: #b7bec9;
		line-height: 1.55;
		margin-top: 0.3rem;
	}
	.rate {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.75rem;
		padding: 0 0.2rem;
	}
	.rate input[type='range'] {
		flex: 1;
		accent-color: #7cc6ff;
	}
	.rate-label {
		font-size: 0.85rem;
		color: #8b93a1;
		white-space: nowrap;
	}
	.rate-val {
		font-size: 0.85rem;
		color: #b7bec9;
		font-variant-numeric: tabular-nums;
		min-width: 3.2ch;
		text-align: right;
	}
	button {
		background: #262c38;
		color: #e8eaed;
		border: 1px solid #333b49;
		border-radius: 10px;
		padding: 0.65rem 0.9rem;
		font-size: 0.95rem;
		cursor: pointer;
		transition: background 0.15s;
	}
	button:hover:not(:disabled) {
		background: #2f3644;
	}
	button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	button.link {
		background: none;
		border: none;
		color: #7cc6ff;
		padding: 0.5rem 0;
		font-size: 0.9rem;
	}
	.error {
		color: #fca5a5;
		font-size: 0.85rem;
	}
	.playback {
		margin: 1rem 0;
		padding: 0.75rem;
		background: #12151c;
		border-radius: 10px;
	}
	.playback-label {
		font-size: 0.8rem;
		color: #8b93a1;
		margin-bottom: 0.5rem;
	}
	.playback audio {
		width: 100%;
	}
	.sample {
		margin-top: 0.5rem;
		border-top: 1px solid #2a303c;
		padding-top: 0.5rem;
	}
	.sample-body {
		background: #12151c;
		border-radius: 10px;
		padding: 1rem;
		margin-top: 0.5rem;
	}
	.sample-body .cn {
		font-size: 1.15rem;
	}
	.tip {
		margin-top: 0.75rem;
		font-size: 0.85rem;
		color: #fcd34d;
		line-height: 1.5;
	}
	.toolbar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 1rem;
	}
	.toolbar button {
		flex: 0 0 auto;
	}
	.toolbar label {
		font-size: 0.9rem;
		color: #b7bec9;
		display: flex;
		align-items: center;
		gap: 0.3rem;
		cursor: pointer;
	}
	.toolbar label:first-of-type {
		margin-left: auto;
	}
	.scorebox {
		margin-top: 1rem;
		padding: 1rem;
		background: #12151c;
		border: 1px solid #2a303c;
		border-radius: 10px;
	}
	.scorebox.azure {
		border-color: #7c3aed;
		background: linear-gradient(180deg, #1a1526, #12151c);
	}
	.azure-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
		margin: 0.75rem 0;
		text-align: center;
	}
	.azure-grid > div {
		background: #12151c;
		border: 1px solid #2a303c;
		border-radius: 8px;
		padding: 0.6rem 0.3rem;
	}
	.g-num {
		display: block;
		font-size: 1.5rem;
		font-weight: 700;
		color: #c4b5fd;
		font-variant-numeric: tabular-nums;
	}
	.g-lab {
		display: block;
		font-size: 0.75rem;
		color: #8b93a1;
		margin-top: 0.2rem;
	}
	.word-label {
		font-size: 0.78rem;
		color: #8b93a1;
		margin: 0.25rem 0 0.5rem;
	}
	.words {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-bottom: 0.6rem;
	}
	.w {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		padding: 0.35rem 0.5rem;
		border-radius: 8px;
		font-size: 1.25rem;
		line-height: 1.1;
		color: #e8eaed;
		cursor: pointer;
		transition: transform 0.1s;
		/* 점수(--acc, 0~100)에 따라 초록(120deg)→빨강(0deg) */
		background: hsl(calc(var(--acc) * 1.2) 55% 22%);
		border: 1px solid hsl(calc(var(--acc) * 1.2) 55% 40%);
	}
	.w:hover {
		transform: translateY(-2px);
		filter: brightness(1.2);
	}
	.w.playing {
		outline: 2px solid #7cc6ff;
		outline-offset: 1px;
	}
	.w.omit {
		background: #3a1e1e;
		border-color: #7f1d1d;
		opacity: 0.85;
	}
	.w-score {
		font-size: 0.65rem;
		color: #cbd5e1;
		margin-top: 0.15rem;
		font-variant-numeric: tabular-nums;
	}
	.weak {
		font-size: 0.85rem;
		color: #fca5a5;
		background: #2a1215;
		border-radius: 8px;
		padding: 0.5rem 0.6rem;
		margin-bottom: 0.5rem;
	}
	.scorebox.muted {
		color: #8b93a1;
		font-size: 0.9rem;
	}
	.score-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
	}
	.score-title {
		font-size: 0.85rem;
		color: #8b93a1;
	}
	.score-num {
		font-size: 2rem;
		font-weight: 700;
		color: #4ade80;
		font-variant-numeric: tabular-nums;
	}
	.score-num small {
		font-size: 0.9rem;
		color: #6b7280;
		font-weight: 400;
	}
	.marks {
		margin: 0.6rem 0;
		font-size: 1.5rem;
		line-height: 1.6;
		letter-spacing: 0.05em;
	}
	.mark {
		color: #4ade80;
	}
	.mark.bad {
		color: #f87171;
		text-decoration: underline wavy;
	}
	.heard {
		font-size: 0.85rem;
		color: #b7bec9;
		margin-bottom: 0.4rem;
	}
	.comment {
		font-size: 0.9rem;
		color: #e8eaed;
	}
	.disclaimer {
		margin-top: 0.5rem;
		font-size: 0.75rem;
		color: #6b7280;
	}
	.selfcheck {
		margin-top: 1rem;
		padding: 1rem;
		background: #12151c;
		border: 1px solid #2a303c;
		border-radius: 10px;
	}
	.selfcheck-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		font-size: 0.9rem;
		margin-bottom: 0.75rem;
	}
	.self-num {
		font-weight: 700;
		color: #fcd34d;
	}
	.check-row {
		display: flex;
		gap: 0.5rem;
		padding: 0.4rem 0;
		cursor: pointer;
		align-items: flex-start;
	}
	.check-row input {
		margin-top: 0.2rem;
	}
	.check-label {
		font-size: 0.92rem;
	}
	.check-hint {
		display: block;
		font-size: 0.78rem;
		color: #6b7280;
		margin-top: 0.1rem;
	}
	.selfcheck-tip {
		margin-top: 0.6rem;
		font-size: 0.78rem;
		color: #8b93a1;
	}
	footer {
		text-align: center;
		color: #6b7280;
		font-size: 0.8rem;
		margin-top: 2rem;
	}
</style>
