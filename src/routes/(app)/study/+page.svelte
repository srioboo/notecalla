<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const TIMER_OPTIONS = [
		{ value: 5, label: '5 s' },
		{ value: 10, label: '10 s' },
		{ value: 15, label: '15 s' },
		{ value: 20, label: '20 s' },
		{ value: 0, label: 'Sin límite' }
	];

	const DIRECTION_OPTIONS = [
		{ value: 'random', label: 'Aleatoria' },
		{ value: 'target_to_native', label: 'Idioma → Español' },
		{ value: 'native_to_target', label: 'Español → Idioma' }
	];

	let selectedDeck = $state('');
	let timerSeconds = $state(data.settings.timerSeconds);
	let cardDirection = $state(data.settings.cardDirection);
	let showRomaji = $state(data.settings.showRomaji);

	// Sync local state when navigating back with updated settings
	$effect(() => {
		timerSeconds = data.settings.timerSeconds;
		cardDirection = data.settings.cardDirection;
		showRomaji = data.settings.showRomaji;
	});
</script>

<svelte:head><title>Estudiar — Notecalla</title></svelte:head>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-bold text-gray-900">Nueva sesión</h1>
		<p class="mt-1 text-sm text-gray-500">Selecciona un mazo y configura tu sesión.</p>
	</div>

	{#if data.decks.length === 0}
		<div class="rounded-2xl border-2 border-dashed border-gray-200 px-8 py-16 text-center">
			<p class="text-gray-500">No hay mazos disponibles para este idioma.</p>
			<p class="mt-1 text-sm text-gray-400">
				Ve a <a href="/decks" class="text-indigo-600 hover:underline">Mazos</a> para crear el primero.
			</p>
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.decks as deck}
				<button
					type="button"
					onclick={() => (selectedDeck = deck.id)}
					class="rounded-2xl border-2 p-5 text-left transition {selectedDeck === deck.id
						? 'border-indigo-500 bg-indigo-50'
						: 'border-gray-200 bg-white hover:border-gray-300'}"
				>
					<p class="font-medium text-gray-900">{deck.name}</p>
					{#if deck.description}
						<p class="mt-1 text-xs text-gray-500">{deck.description}</p>
					{/if}
					{#if deck.isSystem}
						<span
							class="mt-3 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500"
							>Sistema</span
						>
					{/if}
				</button>
			{/each}
		</div>

		<!-- Session settings -->
		<div class="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
			<h2 class="mb-4 font-semibold text-gray-900">Configuración</h2>
			<div class="grid gap-4 sm:grid-cols-3">
				<div>
					<label for="timerSeconds" class="mb-1 block text-sm font-medium text-gray-700">Tiempo por tarjeta</label>
					<select
						id="timerSeconds"
						bind:value={timerSeconds}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
					>
						{#each TIMER_OPTIONS as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="cardDirection" class="mb-1 block text-sm font-medium text-gray-700">Dirección</label>
					<select
						id="cardDirection"
						bind:value={cardDirection}
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
					>
						{#each DIRECTION_OPTIONS as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<div class="flex items-end">
					<label class="flex items-center gap-2 text-sm font-medium text-gray-700">
						<input type="checkbox" bind:checked={showRomaji} class="rounded" />
						Mostrar romanización
					</label>
				</div>
			</div>
		</div>

		<div class="flex justify-end gap-3">
			<form method="POST" action="?/saveSettings" use:enhance>
				<input type="hidden" name="timerSeconds" value={timerSeconds} />
				<input type="hidden" name="cardDirection" value={cardDirection} />
				<input type="hidden" name="showRomaji" value={showRomaji} />
				<button type="submit" class="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">
					Guardar ajustes
				</button>
			</form>

			<a
				href={selectedDeck
					? `/study/session?deck=${selectedDeck}&timer=${timerSeconds}&direction=${cardDirection}&romaji=${showRomaji}`
					: '#'}
				class="rounded-lg px-6 py-2.5 text-sm font-medium transition {selectedDeck
					? 'bg-indigo-600 text-white hover:bg-indigo-700'
					: 'cursor-not-allowed bg-gray-200 text-gray-400'}"
				aria-disabled={!selectedDeck}
			>
				Iniciar sesión →
			</a>
		</div>
	{/if}
</div>
