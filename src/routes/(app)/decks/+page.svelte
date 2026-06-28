<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showCreate = $state(false);
</script>

<svelte:head><title>Mazos — Notecalla</title></svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Mazos</h1>
			<p class="mt-1 text-sm text-gray-500">Gestiona tus colecciones de tarjetas.</p>
		</div>
		<button
			type="button"
			onclick={() => (showCreate = !showCreate)}
			class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
		>
			+ Nuevo mazo
		</button>
	</div>

	{#if form?.error}
		<p class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{form.error}</p>
	{/if}

	{#if showCreate}
		<div class="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
			<h2 class="mb-4 font-semibold text-gray-900">Nuevo mazo</h2>
			<form method="POST" action="?/create" use:enhance={() => async ({ update }) => { showCreate = false; await update(); }} class="space-y-3">
				<div>
					<label for="name" class="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
					<input
						id="name"
						name="name"
						type="text"
						required
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
					/>
				</div>
				<div>
					<label for="description" class="mb-1 block text-sm font-medium text-gray-700"
						>Descripción (opcional)</label
					>
					<input
						id="description"
						name="description"
						type="text"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
					/>
				</div>
				<div class="flex gap-2">
					<button
						type="submit"
						class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
						>Crear</button
					>
					<button
						type="button"
						onclick={() => (showCreate = false)}
						class="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">Cancelar</button
					>
				</div>
			</form>
		</div>
	{/if}

	{#if data.decks.length === 0}
		<div class="rounded-2xl border-2 border-dashed border-gray-200 px-8 py-16 text-center">
			<p class="text-gray-500">No hay mazos todavía.</p>
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.decks as deck}
				<div class="rounded-2xl bg-white p-5 ring-1 ring-gray-200">
					<div class="flex items-start justify-between">
						<div>
							<h3 class="font-medium text-gray-900">{deck.name}</h3>
							{#if deck.description}
								<p class="mt-0.5 text-xs text-gray-500">{deck.description}</p>
							{/if}
						</div>
						{#if deck.isSystem}
							<span
								class="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500"
								>Sistema</span
							>
						{/if}
					</div>

					<p class="mt-3 text-xs text-gray-400">{deck.cardCount} tarjetas</p>

					<div class="mt-4 flex gap-2">
						<a
							href="/decks/{deck.id}"
							class="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
							>Ver tarjetas</a
						>
						{#if deck.isSystem}
							<form method="POST" action="?/clone" use:enhance>
								<input type="hidden" name="deckId" value={deck.id} />
								<button
									type="submit"
									class="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
									>Clonar</button
								>
							</form>
						{:else}
							<form method="POST" action="?/delete" use:enhance>
								<input type="hidden" name="deckId" value={deck.id} />
								<button
									type="submit"
									class="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
									onclick={(e) => {
										if (!confirm('¿Eliminar este mazo?')) e.preventDefault();
									}}
									>Eliminar</button
								>
							</form>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
