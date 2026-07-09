<script lang="ts">
	import { goto } from '$app/navigation';

	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	let inputEl = $state<HTMLInputElement | null>(null);

	$effect(() => {
		inputEl?.focus();
	});

	async function submit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;
		try {
			const res = await fetch('/api/login', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ password })
			});
			const data = await res.json();
			if (data.ok) {
				await goto('/');
			} else {
				error = data.error ?? '로그인 실패';
			}
		} catch {
			error = '네트워크 오류';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head><title>로그인 · TSC 3급 연습</title></svelte:head>

<main>
	<form onsubmit={submit}>
		<div class="logo">🇨🇳</div>
		<h1>TSC 3급 말하기 연습</h1>
		<p class="sub">비밀번호를 입력하세요</p>
		<input
			bind:this={inputEl}
			type="password"
			bind:value={password}
			placeholder="비밀번호"
			autocomplete="current-password"
		/>
		{#if error}<p class="err">{error}</p>{/if}
		<button type="submit" disabled={loading || !password}>
			{loading ? '확인 중…' : '들어가기'}
		</button>
	</form>
</main>

<style>
	:global(body) {
		margin: 0;
		background: #0f1115;
		color: #e8eaed;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
	}
	main {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}
	form {
		background: #1a1e27;
		border: 1px solid #2a303c;
		border-radius: 16px;
		padding: 2rem 1.5rem;
		width: 100%;
		max-width: 320px;
		text-align: center;
	}
	.logo {
		font-size: 3rem;
	}
	h1 {
		font-size: 1.15rem;
		margin: 0.5rem 0 0.25rem;
	}
	.sub {
		color: #8b93a1;
		font-size: 0.9rem;
		margin: 0 0 1.25rem;
	}
	input {
		width: 100%;
		box-sizing: border-box;
		background: #12151c;
		border: 1px solid #333b49;
		color: #e8eaed;
		border-radius: 10px;
		padding: 0.75rem;
		font-size: 1rem;
		margin-bottom: 0.75rem;
	}
	input:focus {
		outline: none;
		border-color: #3b82f6;
	}
	.err {
		color: #fca5a5;
		font-size: 0.85rem;
		margin: 0 0 0.75rem;
	}
	button {
		width: 100%;
		background: #2563eb;
		border: none;
		color: #fff;
		border-radius: 10px;
		padding: 0.75rem;
		font-size: 1rem;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
