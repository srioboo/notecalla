<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const QUALITY_LABELS = ['No lo sabía', 'Difícil', 'Fácil', 'Muy fácil'];
	const QUALITY_COLORS = [
		'bg-red-100 text-red-700',
		'bg-amber-100 text-amber-700',
		'bg-blue-100 text-blue-700',
		'bg-green-100 text-green-700'
	];

	function formatMs(ms: number) {
		return ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${ms} ms`;
	}
</script>

<svelte:head><title>Resumen — Notecalla</title></svelte:head>

<div class="mx-auto max-w-lg space-y-6">
	<h1 class="text-2xl font-bold text-gray-900">¡Sesión completada!</h1>

	<!-- Summary cards -->
	<div class="grid grid-cols-3 gap-3">
		<div class="rounded-2xl bg-white p-4 text-center ring-1 ring-gray-200">
			<p class="text-3xl font-bold text-indigo-600">{data.accuracy}%</p>
			<p class="mt-1 text-xs font-medium text-gray-500">Precisión</p>
		</div>
		<div class="rounded-2xl bg-white p-4 text-center ring-1 ring-gray-200">
			<p class="text-3xl font-bold text-green-600">{data.correct}</p>
			<p class="mt-1 text-xs font-medium text-gray-500">Aciertos</p>
		</div>
		<div class="rounded-2xl bg-white p-4 text-center ring-1 ring-gray-200">
			<p class="text-3xl font-bold text-gray-700">{formatMs(data.avgResponseMs)}</p>
			<p class="mt-1 text-xs font-medium text-gray-500">T. medio</p>
		</div>
	</div>

	<!-- Card breakdown -->
	<div class="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200">
		<table class="w-full text-sm">
			<thead class="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500">
				<tr>
					<th class="px-4 py-3 text-left">Palabra</th>
					<th class="px-4 py-3 text-left">Traducción</th>
					<th class="px-4 py-3 text-left">Resultado</th>
					<th class="px-4 py-3 text-right">Tiempo</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100">
				{#each data.entries as entry}
					<tr class="hover:bg-gray-50">
						<td class="px-4 py-2.5 text-lg">{entry.native}</td>
						<td class="px-4 py-2.5 text-gray-600">{entry.translation}</td>
						<td class="px-4 py-2.5">
							<span class="rounded-full px-2 py-0.5 text-[11px] font-medium {QUALITY_COLORS[entry.quality]}">
								{QUALITY_LABELS[entry.quality]}
							</span>
						</td>
						<td class="px-4 py-2.5 text-right text-xs text-gray-400">
							{formatMs(entry.responseTimeMs ?? 0)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="flex gap-3">
		<a
			href="/study"
			class="flex-1 rounded-2xl bg-indigo-600 py-3 text-center text-sm font-medium text-white hover:bg-indigo-700"
		>
			Nueva sesión
		</a>
		<a
			href="/stats"
			class="rounded-2xl bg-gray-100 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-200"
		>
			Ver progreso
		</a>
	</div>
</div>
