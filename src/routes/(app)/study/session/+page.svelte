<script lang="ts">
	import { enhance } from '$app/forms';
	import FlashCard from '$lib/components/FlashCard.svelte';
	import TimerRing from '$lib/components/TimerRing.svelte';
	import type { PageData } from './$types';
	import type { AppQuality } from '$lib/utils/sm2';

	let { data }: { data: PageData } = $props();

	// ── State ──────────────────────────────────────────────────────────────────
	let currentIndex = $state(0);
	let revealed = $state(false);
	let entries = $state<Array<{ cardId: string; quality: AppQuality; responseTimeMs: number }>>([]);
	let cardStartTime = $state(Date.now());
	let timeLeft = $state(data.timerSeconds);
	let timedOut = $state(false);
	let finished = $state(false);

	const card = $derived(data.cards[currentIndex]);
	const progress = $derived(Math.round((currentIndex / data.cards.length) * 100));

	// ── Timer ─────────────────────────────────────────────────────────────────
	let timerInterval: ReturnType<typeof setInterval> | null = null;

	function startTimer() {
		if (data.timerSeconds === 0) return;
		timeLeft = data.timerSeconds;
		timerInterval = setInterval(() => {
			timeLeft--;
			if (timeLeft <= 0) {
				clearInterval(timerInterval!);
				timedOut = true;
				revealed = true;
			}
		}, 1000);
	}

	function stopTimer() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
	}

	$effect(() => {
		// Restart timer each time we move to a new card
		currentIndex; // track dependency
		if (!finished) startTimer();
		return () => stopTimer();
	});

	// ── Actions ───────────────────────────────────────────────────────────────
	function reveal() {
		if (revealed) return;
		stopTimer();
		revealed = true;
	}

	function rate(quality: AppQuality) {
		const responseTimeMs = Date.now() - cardStartTime;
		entries.push({ cardId: card.id, quality, responseTimeMs });

		if (currentIndex + 1 >= data.cards.length) {
			finished = true;
		} else {
			currentIndex++;
			revealed = false;
			timedOut = false;
			cardStartTime = Date.now();
		}
	}

	const QUALITY_LABELS: { q: AppQuality; label: string; color: string }[] = [
		{ q: 0, label: 'No lo sabía', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
		{ q: 1, label: 'Difícil', color: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
		{ q: 2, label: 'Fácil', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
		{ q: 3, label: 'Muy fácil', color: 'bg-green-100 text-green-700 hover:bg-green-200' }
	];
</script>

<svelte:head><title>Sesión — {data.deckName}</title></svelte:head>

{#if finished}
	<form method="POST" action="?/submitEntries" use:enhance id="submit-form">
		<input type="hidden" name="studySessionId" value={data.studySessionId} />
		<input type="hidden" name="entries" value={JSON.stringify(entries)} />
	</form>
	<div class="flex min-h-[60vh] flex-col items-center justify-center gap-4">
		<p class="text-lg font-medium text-gray-700">Calculando resultados…</p>
		<script>document.getElementById('submit-form').submit();</script>
	</div>
{:else}
	<div class="mx-auto max-w-lg space-y-6">
		<!-- Progress bar + timer -->
		<div class="flex items-center gap-4">
			<a href="/study" class="shrink-0 text-sm text-gray-400 hover:text-gray-600">← Salir</a>
			<div class="flex-1">
				<div class="h-2 rounded-full bg-gray-100">
					<div
						class="h-2 rounded-full bg-indigo-500 transition-all duration-300"
						style="width: {progress}%"
					></div>
				</div>
				<p class="mt-1 text-right text-xs text-gray-400">{currentIndex}/{data.cards.length}</p>
			</div>
			{#if data.timerSeconds > 0}
				<TimerRing seconds={data.timerSeconds} remaining={timeLeft} />
			{/if}
		</div>

		<!-- Card -->
		<FlashCard
			{card}
			{revealed}
			direction={data.cardDirection}
			showRomaji={data.showRomaji}
		/>

		<!-- Actions -->
		{#if !revealed}
			<button
				type="button"
				onclick={reveal}
				class="w-full rounded-2xl bg-indigo-600 py-4 text-base font-medium text-white transition hover:bg-indigo-700 active:scale-95"
			>
				Revelar respuesta
			</button>
		{:else}
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{#each QUALITY_LABELS as { q, label, color }}
					<button
						type="button"
						onclick={() => rate(q)}
						class="min-h-[56px] rounded-2xl px-3 py-4 text-sm font-medium transition active:scale-95 {color}"
					>
						{label}
					</button>
				{/each}
			</div>
		{/if}
	</div>
{/if}
