<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selectedDeck = $state('');
	let direction = $state<'target_to_native' | 'native_to_target'>('target_to_native');
	let timerSeconds = $state(10);

	const TIMER_OPTIONS = [
		{ value: 5, label: '5 s' },
		{ value: 10, label: '10 s' },
		{ value: 15, label: '15 s' },
		{ value: 20, label: '20 s' },
		{ value: 0, label: 'Sin límite' }
	];

	// Hiragana has 46, katakana has 46 — always load all
	const cardLimit = 50;

	const sessionUrl = $derived(
		selectedDeck
			? `/study/session?deck=${selectedDeck}&timer=${timerSeconds}&direction=${direction}&romaji=false&limit=${cardLimit}`
			: '#'
	);
</script>

<svelte:head><title>Japonés — Alfabeto</title></svelte:head>

<div class="mx-auto max-w-lg space-y-8">
	<div class="flex items-center gap-4">
		<a href="/alphabet" class="text-sm text-gray-400 hover:text-gray-600">← Alfabeto</a>
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Japonés — Alfabeto</h1>
			<p class="mt-0.5 text-sm text-gray-500">Practica hiragana y katakana.</p>
		</div>
	</div>

	<!-- Script selector -->
	<div>
		<p class="mb-3 text-sm font-medium text-gray-700">Elige el alfabeto:</p>
		{#if data.decks.length === 0}
			<p class="text-sm text-amber-600">
				No se encontraron mazos de alfabeto. Ejecuta <code class="rounded bg-gray-100 px-1">bun run db:seed</code>.
			</p>
		{:else}
			<div class="grid gap-3 sm:grid-cols-2">
				{#each data.decks as deck}
					<button
						type="button"
						onclick={() => (selectedDeck = deck.id)}
						class="rounded-2xl border-2 p-5 text-left transition {selectedDeck === deck.id
							? 'border-indigo-500 bg-indigo-50'
							: 'border-gray-200 bg-white hover:border-gray-300'}"
					>
						<p class="text-2xl font-medium text-gray-900">
							{deck.name === 'Hiragana' ? 'あいう' : 'アイウ'}
						</p>
						<p class="mt-1 font-medium text-gray-800">{deck.name}</p>
						{#if deck.description}
							<p class="mt-0.5 text-xs text-gray-500">{deck.description}</p>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Direction -->
	<div>
		<p class="mb-3 text-sm font-medium text-gray-700">Dirección:</p>
		<div class="flex gap-3">
			<button
				type="button"
				onclick={() => (direction = 'target_to_native')}
				class="flex-1 rounded-xl border-2 px-4 py-3 text-sm transition {direction ===
				'target_to_native'
					? 'border-indigo-500 bg-indigo-50 font-medium text-indigo-700'
					: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
			>
				Símbolo → Lectura
				<span class="mt-1 block text-lg">あ → a</span>
			</button>
			<button
				type="button"
				onclick={() => (direction = 'native_to_target')}
				class="flex-1 rounded-xl border-2 px-4 py-3 text-sm transition {direction ===
				'native_to_target'
					? 'border-indigo-500 bg-indigo-50 font-medium text-indigo-700'
					: 'border-gray-200 text-gray-600 hover:border-gray-300'}"
			>
				Lectura → Símbolo
				<span class="mt-1 block text-lg">a → あ</span>
			</button>
		</div>
	</div>

	<!-- Timer -->
	<div>
		<label for="timer-ja" class="mb-2 block text-sm font-medium text-gray-700">
			Tiempo por tarjeta
		</label>
		<select
			id="timer-ja"
			bind:value={timerSeconds}
			class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
		>
			{#each TIMER_OPTIONS as opt}
				<option value={opt.value}>{opt.label}</option>
			{/each}
		</select>
	</div>

	<a
		href={sessionUrl}
		class="block w-full rounded-2xl py-4 text-center text-base font-medium transition {selectedDeck
			? 'bg-indigo-600 text-white hover:bg-indigo-700'
			: 'cursor-not-allowed bg-gray-200 text-gray-400'}"
		aria-disabled={!selectedDeck}
	>
		Iniciar sesión →
	</a>
</div>
