<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showAdd = $state(false);
</script>

<svelte:head><title>{data.deck.name} — Notecalla</title></svelte:head>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<a href="/decks" class="text-sm text-gray-400 hover:text-gray-600">← Mazos</a>
		<div class="flex-1">
			<h1 class="text-2xl font-bold text-gray-900">{data.deck.name}</h1>
			{#if data.deck.description}
				<p class="mt-0.5 text-sm text-gray-500">{data.deck.description}</p>
			{/if}
		</div>
		{#if !data.deck.isSystem}
			<button
				type="button"
				onclick={() => (showAdd = !showAdd)}
				class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
			>
				+ Añadir tarjeta
			</button>
		{/if}
	</div>

	{#if form?.error}
		<p class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{form.error}</p>
	{/if}

	{#if showAdd}
		<div class="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
			<h2 class="mb-4 font-semibold text-gray-900">Nueva tarjeta</h2>
			<form
				method="POST"
				action="?/addCard"
				use:enhance={() => async ({ update }) => { showAdd = false; await update(); }}
				class="grid gap-3 sm:grid-cols-2"
			>
				<div>
					<label for="native" class="mb-1 block text-sm font-medium text-gray-700"
						>Palabra (idioma objetivo)</label
					>
					<input
						id="native"
						name="native"
						type="text"
						required
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-lg outline-none focus:border-indigo-500"
					/>
				</div>
				<div>
					<label for="reading" class="mb-1 block text-sm font-medium text-gray-700"
						>Lectura / romanización</label
					>
					<input
						id="reading"
						name="reading"
						type="text"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
					/>
				</div>
				<div>
					<label for="translation" class="mb-1 block text-sm font-medium text-gray-700"
						>Traducción</label
					>
					<input
						id="translation"
						name="translation"
						type="text"
						required
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
					/>
				</div>
				<div>
					<label for="example" class="mb-1 block text-sm font-medium text-gray-700"
						>Ejemplo (opcional)</label
					>
					<input
						id="example"
						name="example"
						type="text"
						class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
					/>
				</div>
				<div class="flex gap-2 sm:col-span-2">
					<button
						type="submit"
						class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
						>Añadir</button
					>
					<button
						type="button"
						onclick={() => (showAdd = false)}
						class="rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-100">Cancelar</button
					>
				</div>
			</form>
		</div>
	{/if}

	{#if data.cards.length === 0}
		<div class="rounded-2xl border-2 border-dashed border-gray-200 px-8 py-16 text-center">
			<p class="text-gray-500">Este mazo no tiene tarjetas todavía.</p>
		</div>
	{:else}
		<div class="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200">
			<table class="w-full text-sm">
				<thead class="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500">
					<tr>
						<th class="px-4 py-3 text-left">Palabra</th>
						<th class="px-4 py-3 text-left">Lectura</th>
						<th class="px-4 py-3 text-left">Traducción</th>
						<th class="px-4 py-3 text-left">Estado</th>
						{#if !data.deck.isSystem}
							<th class="px-4 py-3"></th>
						{/if}
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each data.cards as card}
						<tr class="hover:bg-gray-50 {card.suspended ? 'opacity-40' : ''}">
							<td class="px-4 py-3 text-lg">{card.native}</td>
							<td class="px-4 py-3 text-gray-500">{card.reading ?? '—'}</td>
							<td class="px-4 py-3">{card.translation}</td>
							<td class="px-4 py-3">
								<form method="POST" action="?/toggleSuspend" use:enhance>
									<input type="hidden" name="cardId" value={card.id} />
									<button
										type="submit"
										class="rounded-full px-2 py-0.5 text-[10px] font-medium {card.suspended
											? 'bg-amber-100 text-amber-700'
											: 'bg-green-100 text-green-700'}"
									>
										{card.suspended ? 'Suspendida' : 'Activa'}
									</button>
								</form>
							</td>
							{#if !data.deck.isSystem}
								<td class="px-4 py-3 text-right">
									<form method="POST" action="?/deleteCard" use:enhance>
										<input type="hidden" name="cardId" value={card.id} />
										<button
											type="submit"
											class="text-xs text-red-400 hover:text-red-600"
											onclick={(e) => {
												if (!confirm('¿Eliminar tarjeta?')) e.preventDefault();
											}}>✕</button
										>
									</form>
								</td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
