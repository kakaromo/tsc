<script lang="ts">
	import { onDestroy } from 'svelte';
	import { vocabGroups } from '$lib/vocab';
	import { grammarPoints } from '$lib/grammar';
	import { questions } from '$lib/questions';
	import { sentencePuzzles } from '$lib/sentences';
	import { universalAnswers } from '$lib/universals';
	import { AudioPlayer, type Segment } from '$lib/audioPlayer';
	import { unlockAudio } from '$lib/tts';
	import { loadSrs } from '$lib/gameLogic';

	type Content = 'vocab' | 'sentence' | 'grammar';
	const OPTS_KEY = 'audio-opts';
	const POS_KEY = 'audio-pos';

	function loadJSON<T>(key: string): T | null {
		if (typeof localStorage === 'undefined') return null;
		try {
			const raw = localStorage.getItem(key);
			return raw ? (JSON.parse(raw) as T) : null;
		} catch {
			return null;
		}
	}

	const savedOpts = loadJSON<Record<string, unknown>>(OPTS_KEY) ?? {};

	let content = $state<Content>((savedOpts.content as Content) ?? 'vocab');
	let playing = $state(false);
	let curIndex = $state(0);
	let repeat = $state((savedOpts.repeat as boolean) ?? true); // 끝나면 처음부터 반복
	let repeatZh = $state((savedOpts.repeatZh as boolean) ?? false); // 단어 모드: 중국어 한 번 더 각인
	let pauseSec = $state((savedOpts.pauseSec as number) ?? 1); // 뜻·답 떠올릴 시간(초)
	let koRate = $state((savedOpts.koRate as number) ?? 1.2); // 한국어(설명·뜻) 재생 속도
	let zhRate = $state((savedOpts.zhRate as number) ?? 0.95); // 중국어 재생 속도
	let direction = $state<'zh' | 'ko'>((savedOpts.direction as 'zh' | 'ko') ?? 'zh'); // 단어: 먼저 들려줄 언어
	let shuffle = $state((savedOpts.shuffle as boolean) ?? false); // 순서 섞기
	let weakOnly = $state((savedOpts.weakOnly as boolean) ?? false); // 약한 단어만 (게임 SRS 연동)
	// 단어 카테고리 선택 (비어있으면 전체)
	let selectedGroups = $state<string[]>((savedOpts.groups as string[]) ?? []);
	// 문장 모드: 부분(部分) 선택 (비어있으면 전체)
	let sentParts = $state<string[]>((savedOpts.sentParts as string[]) ?? []);
	const PART_CHIPS = [
		{ key: '1', label: '1부 자기소개' },
		{ key: '2', label: '2부 그림' },
		{ key: 'pattern', label: '2부 핵심 문형' },
		{ key: '3', label: '3부 대화' },
		{ key: '4', label: '4부 화제' },
		{ key: 'universal', label: '🗝 만능답변' }
	];
	const partOn = (key: string) => sentParts.length === 0 || sentParts.includes(key);

	// 게임(퀴즈·플래시카드)에서 쌓인 숙련도 — 박스 4 미만이면 아직 약한 단어
	const srs = loadSrs();
	const isWeak = (hanzi: string) => (srs[hanzi] ?? 0) < 4;

	// 마지막 재생 위치 (콘텐츠별, 이어듣기용)
	let positions = $state<Record<string, number>>(loadJSON<Record<string, number>>(POS_KEY) ?? {});

	// 설정 자동 저장
	$effect(() => {
		const opts = {
			content,
			repeat,
			repeatZh,
			pauseSec,
			koRate,
			zhRate,
			direction,
			shuffle,
			weakOnly,
			groups: selectedGroups,
			sentParts
		};
		try {
			localStorage.setItem(OPTS_KEY, JSON.stringify(opts));
		} catch {
			/* 무시 */
		}
	});

	const player = new AudioPlayer();
	player.setOnState((p, i) => {
		playing = p;
		curIndex = i;
		if (p) savePosition(i);
		if (!p && repeat && !manualStop && i >= segments.length && segments.length > 0) {
			// 자동 반복 — 처음부터
			savePosition(0);
			player.play(segments, 0);
		}
	});
	let manualStop = false;

	function savePosition(i: number) {
		positions = { ...positions, [content]: i };
		try {
			localStorage.setItem(POS_KEY, JSON.stringify(positions));
		} catch {
			/* 무시 */
		}
	}

	// 재생할 세그먼트 목록 (콘텐츠·옵션에 따라 구성)
	let segments = $state<Segment[]>([]);
	// 세그먼트 index → 화면에 보여줄 라벨
	let labels = $state<string[]>([]);
	// 항목(단어·문장·문법) 시작 세그먼트 index — 건너뛰기 단위
	let itemStarts = $state<number[]>([]);

	// 항목별 상세 텍스트 (화면으로 따라 읽는 용도 — 중국어·병음·한국어·설명)
	interface DetailLine {
		cn?: string;
		pinyin?: string;
		ko?: string;
		note?: string;
	}
	interface ItemDetail {
		tag: string; // 항목 종류 (카테고리·部分 라벨)
		title?: string;
		lines: DetailLine[];
	}
	let details = $state<ItemDetail[]>([]);

	function shuffled<T>(arr: T[]): T[] {
		const a = [...arr];
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

	type Built = { segs: Segment[]; labs: string[]; starts: number[]; dets: ItemDetail[] };

	function buildVocab(): Built {
		const segs: Segment[] = [];
		const labs: string[] = [];
		const starts: number[] = [];
		const dets: ItemDetail[] = [];
		const groups = selectedGroups.length
			? vocabGroups.filter((g) => selectedGroups.includes(g.title))
			: vocabGroups;
		let items = groups.flatMap((g) => g.items.map((v) => ({ ...v, group: g.title })));
		if (weakOnly) items = items.filter((v) => isWeak(v.hanzi));
		if (shuffle) items = shuffled(items);
		for (const v of items) {
			starts.push(segs.length);
			dets.push({
				tag: v.group,
				lines: [{ cn: v.hanzi, pinyin: v.pinyin, ko: v.ko, note: v.note }]
			});
			if (direction === 'zh') {
				// 중국어 → (뜻 떠올릴 시간) → 한국어 뜻
				segs.push({ text: v.hanzi, lang: 'zh-CN', rate: zhRate, pauseAfterMs: pauseSec * 1000 });
				labs.push(`${v.hanzi} (${v.pinyin})`);
				segs.push({ text: v.ko, lang: 'ko-KR', rate: koRate, pauseAfterMs: repeatZh ? 250 : 600 });
				labs.push(`뜻: ${v.ko}`);
			} else {
				// 한국어 뜻 → (중국어 떠올릴 시간) → 중국어 (회상 연습)
				segs.push({ text: v.ko, lang: 'ko-KR', rate: koRate, pauseAfterMs: pauseSec * 1000 });
				labs.push(`뜻: ${v.ko}`);
				segs.push({ text: v.hanzi, lang: 'zh-CN', rate: zhRate, pauseAfterMs: repeatZh ? 250 : 600 });
				labs.push(`${v.hanzi} (${v.pinyin})`);
			}
			// 중국어 한 번 더 (각인) — 옵션
			if (repeatZh) {
				segs.push({ text: v.hanzi, lang: 'zh-CN', rate: zhRate, pauseAfterMs: 600 });
				labs.push(`${v.hanzi} (${v.pinyin})`);
			}
		}
		return { segs, labs, starts, dets };
	}

	function buildSentence(): Built {
		const segs: Segment[] = [];
		const labs: string[] = [];
		const starts: number[] = [];
		const dets: ItemDetail[] = [];
		type Block = { build: () => void };
		const blocks: Block[] = [];

		// 1~4부 문항: 질문 → (답 떠올릴 시간) → 모범답변 → 한국어 뜻
		const qa = (sec: number) => {
			for (const q of questions.filter((q) => q.section === sec)) {
				blocks.push({
					build: () => {
						starts.push(segs.length);
						dets.push({
							tag: q.part,
							lines: [
								{ cn: q.prompt, pinyin: q.promptPinyin, ko: q.promptKo },
								{ cn: q.sample, pinyin: q.samplePinyin, ko: q.sampleKo, note: q.tip }
							]
						});
						segs.push({
							text: q.prompt,
							lang: 'zh-CN',
							rate: zhRate,
							pauseAfterMs: pauseSec * 1000
						});
						labs.push(`Q. ${q.prompt}`);
						segs.push({ text: q.sample, lang: 'zh-CN', rate: zhRate, pauseAfterMs: 300 });
						labs.push(q.sample);
						segs.push({ text: q.sampleKo, lang: 'ko-KR', rate: koRate, pauseAfterMs: 900 });
						labs.push(q.sampleKo);
					}
				});
			}
		};
		if (partOn('1')) qa(1);
		if (partOn('2')) qa(2);
		// 2부 핵심 문형: 한국어 뜻 → (중국어 떠올릴 시간) → 중국어
		if (partOn('pattern')) {
			for (const p of sentencePuzzles) {
				const cn = p.tokens.join('');
				blocks.push({
					build: () => {
						starts.push(segs.length);
						dets.push({
							tag: '2부 핵심 문형',
							lines: [{ cn, pinyin: p.pinyin, ko: p.ko, note: p.hint }]
						});
						segs.push({ text: p.ko, lang: 'ko-KR', rate: koRate, pauseAfterMs: pauseSec * 1000 });
						labs.push(p.ko);
						segs.push({ text: cn, lang: 'zh-CN', rate: zhRate, pauseAfterMs: 700 });
						labs.push(`${cn} (${p.pinyin})`);
					}
				});
			}
		}
		if (partOn('3')) qa(3);
		if (partOn('4')) qa(4);
		// 만능답변: 상황(한국어) → (중국어 떠올릴 시간) → 만능 문장
		if (partOn('universal')) {
			for (const u of universalAnswers) {
				blocks.push({
					build: () => {
						starts.push(segs.length);
						dets.push({
							tag: `만능답변 · ${u.situation}`,
							lines: [{ cn: u.cn, pinyin: u.pinyin, ko: u.ko, note: `${u.trigger} — ${u.note ?? ''}` }]
						});
						segs.push({
							text: `${u.situation}. ${u.ko}`,
							lang: 'ko-KR',
							rate: koRate,
							pauseAfterMs: pauseSec * 1000
						});
						labs.push(`${u.situation} — ${u.ko}`);
						segs.push({ text: u.cn, lang: 'zh-CN', rate: zhRate, pauseAfterMs: 700 });
						labs.push(u.cn);
					}
				});
			}
		}
		for (const b of shuffle ? shuffled(blocks) : blocks) b.build();
		return { segs, labs, starts, dets };
	}

	function buildGrammar(): Built {
		const segs: Segment[] = [];
		const labs: string[] = [];
		const starts: number[] = [];
		const dets: ItemDetail[] = [];
		for (const g of grammarPoints) {
			if (!g.audioScript) continue;
			starts.push(segs.length);
			dets.push({
				tag: '문법',
				title: g.title,
				lines: [
					{ note: `공식: ${g.formula}` },
					{ note: g.desc },
					...g.examples.map((e) => ({ cn: e.cn, pinyin: e.pinyin, ko: e.ko })),
					...(g.warn ? [{ note: `⚠️ ${g.warn}` }] : [])
				]
			});
			segs.push({ text: g.audioScript, lang: 'ko-KR', rate: koRate, pauseAfterMs: 800 });
			labs.push(g.title);
			// 예문 중국어 각인
			for (const e of g.examples) {
				segs.push({ text: e.cn, lang: 'zh-CN', rate: zhRate, pauseAfterMs: 500 });
				labs.push(`${e.cn} — ${e.ko}`);
			}
		}
		return { segs, labs, starts, dets };
	}

	function rebuild() {
		const { segs, labs, starts, dets } =
			content === 'vocab' ? buildVocab() : content === 'sentence' ? buildSentence() : buildGrammar();
		segments = segs;
		labels = labs;
		itemStarts = starts;
		details = dets;
	}
	rebuild();

	function start() {
		manualStop = false;
		unlockAudio(); // 첫 제스처에 오디오 재생 권한 확보 (iOS 등 연속재생 보장)
		rebuild();
		// 이어듣기: 셔플이 아니면 마지막 위치부터 (범위 벗어나면 처음부터)
		let startAt = 0;
		const saved = positions[content] ?? 0;
		if (!shuffle && saved > 0 && saved < segments.length) startAt = saved;
		player.play(segments, startAt);
	}
	function restart() {
		manualStop = false;
		unlockAudio();
		savePosition(0);
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
		curIndex = positions[c] ?? 0;
		rebuild();
	}
	function optChanged() {
		// 구조가 바뀌는 옵션 변경 — 재생 중이면 멈추고 다시 구성
		if (playing) stop();
		rebuild();
	}
	function toggleGroup(title: string) {
		selectedGroups = selectedGroups.includes(title)
			? selectedGroups.filter((t) => t !== title)
			: [...selectedGroups, title];
		optChanged();
	}
	function togglePart(key: string) {
		sentParts = sentParts.includes(key)
			? sentParts.filter((k) => k !== key)
			: [...sentParts, key];
		optChanged();
	}

	// 현재 항목 번호 (건너뛰기 단위)
	const curItem = $derived.by(() => {
		let k = 0;
		for (let i = 0; i < itemStarts.length; i++) {
			if (itemStarts[i] <= curIndex) k = i;
			else break;
		}
		return k;
	});
	function skipTo(itemIdx: number) {
		if (!itemStarts.length) return;
		const clamped = Math.max(0, Math.min(itemIdx, itemStarts.length - 1));
		manualStop = false;
		unlockAudio();
		if (!segments.length) rebuild();
		player.play(segments, itemStarts[clamped]);
	}
	function nextItem() {
		skipTo(curItem + 1);
	}
	function prevItem() {
		// 항목 초반이면 이전 항목으로, 그 외엔 현재 항목 처음으로
		skipTo(curIndex - (itemStarts[curItem] ?? 0) > 1 ? curItem : curItem - 1);
	}

	// 잠금화면·차량(핸들/헤드셋) 미디어 컨트롤
	$effect(() => {
		if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
		const ms = navigator.mediaSession;
		ms.setActionHandler('play', () => {
			if (!playing) start();
		});
		ms.setActionHandler('pause', () => stop());
		ms.setActionHandler('nexttrack', nextItem);
		ms.setActionHandler('previoustrack', prevItem);
		return () => {
			ms.setActionHandler('play', null);
			ms.setActionHandler('pause', null);
			ms.setActionHandler('nexttrack', null);
			ms.setActionHandler('previoustrack', null);
		};
	});
	$effect(() => {
		if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
		try {
			navigator.mediaSession.metadata = new MediaMetadata({
				title: labels[curIndex] ?? '오디오 학습',
				artist: 'TSC 3급',
				album: content === 'vocab' ? '단어' : content === 'sentence' ? '문장' : '문법'
			});
			navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
		} catch {
			/* 무시 */
		}
	});

	onDestroy(() => player.stop());

	const curLabel = $derived(labels[curIndex] ?? '');
	const progress = $derived(
		segments.length ? Math.round((curIndex / segments.length) * 100) : 0
	);
	const canResume = $derived(
		!playing && !shuffle && (positions[content] ?? 0) > 0 && (positions[content] ?? 0) < segments.length
	);
	const contentName = $derived(
		content === 'vocab' ? '단어 학습' : content === 'sentence' ? '문장 학습' : '문법 설명'
	);
	// 선택된 카테고리 기준 약한 단어 수 / 전체 수
	const weakStat = $derived.by(() => {
		const groups = selectedGroups.length
			? vocabGroups.filter((g) => selectedGroups.includes(g.title))
			: vocabGroups;
		const items = groups.flatMap((g) => g.items);
		return { weak: items.filter((v) => isWeak(v.hanzi)).length, total: items.length };
	});
</script>

<svelte:head><title>오디오 학습 (운전용) · TSC 3급</title></svelte:head>

<main>
	<header>
		<a class="back" href="/">← 홈</a>
		<h1>🎧 오디오 학습</h1>
	</header>

	<p class="hint">
		운전 중엔 재생만 누르고 화면을 보지 마세요. 잠금화면·차 핸들 버튼으로 정지/건너뛰기 조작
		가능해요.
	</p>

	<div class="switch">
		<button class:on={content === 'vocab'} onclick={() => switchContent('vocab')}>📖 단어</button>
		<button class:on={content === 'sentence'} onclick={() => switchContent('sentence')}>
			🗣 문장
		</button>
		<button class:on={content === 'grammar'} onclick={() => switchContent('grammar')}>
			📐 문법
		</button>
	</div>

	<!-- 현재 재생 항목 -->
	<div class="now" class:active={playing}>
		<div class="now-label">{playing ? '재생 중' : canResume ? '이어듣기 가능' : '정지'}</div>
		<div class="now-text">{curLabel || contentName}</div>
		<div class="now-bar"><div class="now-fill" style="width:{progress}%"></div></div>
		<div class="now-sub">{curItem + 1} / {itemStarts.length}</div>
	</div>

	<!-- 재생 컨트롤 -->
	<div class="controls">
		<button class="skip" onclick={prevItem} aria-label="이전">⏮</button>
		<button class="play" class:on={playing} onclick={toggle}>
			{playing ? '⏸ 정지' : canResume ? '▶ 이어듣기' : '▶ 재생'}
		</button>
		<button class="skip" onclick={nextItem} aria-label="다음">⏭</button>
	</div>
	{#if canResume}
		<button class="restart" onclick={restart}>↺ 처음부터 재생</button>
	{/if}

	<!-- 현재 항목 상세 (따라 읽기용 — 중국어·병음·한국어) -->
	{#if details[curItem]}
		{@const d = details[curItem]}
		<div class="detail">
			<div class="detail-tag">{d.tag}</div>
			{#if d.title}<div class="detail-title">{d.title}</div>{/if}
			{#each d.lines as line, li (li)}
				<div class="dline">
					{#if line.cn}<div class="d-cn">{line.cn}</div>{/if}
					{#if line.pinyin}<div class="d-py">{line.pinyin}</div>{/if}
					{#if line.ko}<div class="d-ko">{line.ko}</div>{/if}
					{#if line.note}<div class="d-note">{line.note}</div>{/if}
				</div>
			{/each}
		</div>
	{/if}

	<!-- 설정 -->
	<div class="opts">
		<label class="opt">
			<input type="checkbox" bind:checked={repeat} /> 끝나면 반복
		</label>
		<label class="opt">
			<input type="checkbox" bind:checked={shuffle} onchange={optChanged} /> 순서 섞기 (셔플 중엔
			이어듣기 없음)
		</label>
		<label class="opt slider">
			<span>🇰🇷 한국어 속도: {koRate.toFixed(2)}x</span>
			<input type="range" min="0.8" max="1.6" step="0.05" bind:value={koRate} onchange={rebuild} />
		</label>
		<label class="opt slider">
			<span>🇨🇳 중국어 속도: {zhRate.toFixed(2)}x</span>
			<input type="range" min="0.6" max="1.2" step="0.05" bind:value={zhRate} onchange={rebuild} />
		</label>
		{#if content !== 'grammar'}
			<label class="opt slider">
				<span>⏳ 떠올릴 시간: {pauseSec}초</span>
				<input type="range" min="0" max="4" step="0.5" bind:value={pauseSec} onchange={rebuild} />
			</label>
		{/if}
		{#if content === 'sentence'}
			<div class="opt chips-wrap">
				<span>부분 선택 {sentParts.length ? `(${sentParts.length}개 선택)` : '(전체)'}</span>
				<div class="chips">
					{#each PART_CHIPS as p (p.key)}
						<button
							class="chip"
							class:on={sentParts.includes(p.key)}
							onclick={() => togglePart(p.key)}
						>
							{p.label}
						</button>
					{/each}
				</div>
			</div>
		{/if}
		{#if content === 'vocab'}
			<div class="opt seg">
				<span>먼저 들려줄 언어</span>
				<div class="seg-btns">
					<button class:on={direction === 'zh'} onclick={() => { direction = 'zh'; optChanged(); }}>
						🇨🇳 중국어 먼저
					</button>
					<button class:on={direction === 'ko'} onclick={() => { direction = 'ko'; optChanged(); }}>
						🇰🇷 뜻 먼저 (회상)
					</button>
				</div>
			</div>
			<label class="opt">
				<input type="checkbox" bind:checked={repeatZh} onchange={optChanged} /> 중국어 한 번 더
				(각인)
			</label>
			<label class="opt">
				<input type="checkbox" bind:checked={weakOnly} onchange={optChanged} />
				⚠️ 약한 단어만 ({weakStat.weak}/{weakStat.total}개 — 게임에서 익힌 단어 제외)
			</label>
			{#if weakOnly && weakStat.weak === 0}
				<p class="all-mastered">🎉 이 범위는 전부 마스터했어요! 다른 카테고리를 선택해 보세요.</p>
			{/if}
			<div class="opt chips-wrap">
				<span>카테고리 {selectedGroups.length ? `(${selectedGroups.length}개 선택)` : '(전체)'}</span>
				<div class="chips">
					{#each vocabGroups as g (g.title)}
						<button
							class="chip"
							class:on={selectedGroups.includes(g.title)}
							onclick={() => toggleGroup(g.title)}
						>
							{g.title}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<p class="tip">
		💡 단어: 중국어↔한국어 순서를 골라 들어요. 「뜻 먼저」는 중국어를 떠올리는 회상 연습이라 암기
		효과가 더 좋아요.<br />
		문장: 1~4부 전체 문항의 질문→모범답변과 2부 핵심 문형을 통째로 귀에 익혀요.<br />
		문법: 각 문법을 설명과 예문으로 팟캐스트처럼 들려줘요.<br />
		정차 중엔 아래 상세 카드로 중국어·병음·해석을 눈으로 따라 읽으세요.
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
		padding: 0.6rem 0.2rem;
		font-size: 0.95rem;
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
		font-size: 1.6rem;
		font-weight: 600;
		margin: 0.5rem 0;
		line-height: 1.35;
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
	.controls {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}
	.skip {
		flex: 0 0 72px;
		background: #1a1e27;
		border: 1px solid #2a303c;
		color: #e8eaed;
		border-radius: 16px;
		font-size: 1.5rem;
		cursor: pointer;
	}
	.play {
		flex: 1;
		background: #7c3aed;
		border: none;
		color: #fff;
		border-radius: 16px;
		padding: 1.5rem 0.5rem;
		font-size: 1.5rem;
		font-weight: 700;
		cursor: pointer;
	}
	.play.on {
		background: #b91c1c;
	}
	.restart {
		width: 100%;
		background: none;
		border: 1px dashed #2a303c;
		color: #8b93a1;
		border-radius: 12px;
		padding: 0.6rem;
		font-size: 0.9rem;
		cursor: pointer;
		margin-bottom: 0.75rem;
	}
	.detail {
		background: #1a1e27;
		border: 1px solid #2a303c;
		border-radius: 16px;
		padding: 1rem 1.1rem;
		margin-bottom: 1rem;
	}
	.detail-tag {
		font-size: 0.75rem;
		color: #7cc6ff;
		margin-bottom: 0.35rem;
	}
	.detail-title {
		font-size: 1.05rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
	}
	.dline {
		padding: 0.5rem 0;
	}
	.dline + .dline {
		border-top: 1px solid #232936;
	}
	.d-cn {
		font-size: 1.25rem;
		font-weight: 600;
		line-height: 1.45;
	}
	.d-py {
		color: #a78bfa;
		font-size: 0.92rem;
		line-height: 1.45;
		margin-top: 0.1rem;
	}
	.d-ko {
		color: #b7bec9;
		font-size: 0.9rem;
		line-height: 1.5;
		margin-top: 0.15rem;
	}
	.d-note {
		color: #8b93a1;
		font-size: 0.82rem;
		line-height: 1.5;
		margin-top: 0.25rem;
	}
	.opts {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin: 0.5rem 0 1.25rem;
	}
	.opt {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.95rem;
		color: #b7bec9;
	}
	.opt.slider,
	.opt.seg,
	.opt.chips-wrap {
		flex-direction: column;
		align-items: stretch;
		gap: 0.35rem;
	}
	.opt.slider input {
		accent-color: #7c3aed;
	}
	.seg-btns {
		display: flex;
		gap: 0.4rem;
	}
	.seg-btns button {
		flex: 1;
		background: #1a1e27;
		border: 1px solid #2a303c;
		color: #8b93a1;
		border-radius: 10px;
		padding: 0.55rem 0.3rem;
		font-size: 0.9rem;
		cursor: pointer;
	}
	.seg-btns button.on {
		background: #7c3aed;
		border-color: #7c3aed;
		color: #fff;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.chip {
		background: #1a1e27;
		border: 1px solid #2a303c;
		color: #8b93a1;
		border-radius: 999px;
		padding: 0.35rem 0.7rem;
		font-size: 0.82rem;
		cursor: pointer;
	}
	.chip.on {
		background: #2563eb;
		border-color: #2563eb;
		color: #fff;
	}
	.all-mastered {
		margin: 0;
		font-size: 0.85rem;
		color: #4ade80;
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
