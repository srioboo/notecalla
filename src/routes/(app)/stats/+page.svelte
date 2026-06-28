<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(ts: Date | null) {
		if (!ts) return '—';
		return new Date(ts).toLocaleDateString('es-ES', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head><title>Progreso — Notecalla</title></svelte:head>

<div class="space-y-8">
	<h1 class="text-2xl font-bold text-gray-900">Progreso</h1>

	<!-- Summary stats -->
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
		{#each [
			{ label: 'Racha', value: `${data.streakDays} día${data.streakDays === 1 ? '' : 's'}`, color: 'text-amber-600' },
			{ label: 'Precisión', value: `${data.accuracy}%`, color: 'text-green-600' },
			{ label: 'Tarjetas revisadas', value: data.totalCards, color: 'text-indigo-600' },
			{ label: 'Aciertos', value: data.correctCards, color: 'text-blue-600' }
		] as stat}
			<div class="rounded-2xl bg-white p-5 ring-1 ring-gray-200">
				<p class="text-xs font-medium text-gray-500">{stat.label}</p>
				<p class="mt-1 text-2xl font-bold {stat.color}">{stat.value}</p>
			</div>
		{/each}
	</div>

	<!-- SM-2 distribution -->
	<div class="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
		<h2 class="mb-4 font-semibold text-gray-900">Distribución de tarjetas</h2>
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
			{#each [
				{ label: 'Nuevas', value: data.sm2.new, color: 'bg-gray-100 text-gray-600' },
				{ label: 'Aprendiendo', value: data.sm2.learning, color: 'bg-blue-100 text-blue-700' },
				{ label: 'Consolidadas', value: data.sm2.consolidated, color: 'bg-indigo-100 text-indigo-700' },
				{ label: 'Dominadas', value: data.sm2.mastered, color: 'bg-green-100 text-green-700' }
			] as bucket}
				<div class="rounded-xl {bucket.color} px-4 py-3 text-center">
					<p class="text-2xl font-bold">{bucket.value}</p>
					<p class="text-xs font-medium">{bucket.label}</p>
				</div>
			{/each}
		</div>
	</div>

	<!-- Hard cards -->
	{#if data.hardCards.length > 0}
		<div class="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
			<h2 class="mb-4 font-semibold text-gray-900">Tarjetas más difíciles</h2>
			<div class="space-y-2">
				{#each data.hardCards as card}
					<div class="flex items-center gap-4 rounded-lg px-3 py-2 hover:bg-gray-50">
						<span class="w-16 text-xl">{card.native}</span>
						<span class="text-xs text-gray-400">{card.reading ?? ''}</span>
						<span class="flex-1 text-sm text-gray-700">{card.translation}</span>
						<span class="text-xs text-red-500">{card.fails ?? 0} fallos / {card.total}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Session history -->
	<div class="rounded-2xl bg-white p-6 ring-1 ring-gray-200">
		<h2 class="mb-4 font-semibold text-gray-900">Últimas sesiones</h2>
		{#if data.sessions.length === 0}
			<p class="text-sm text-gray-400">Aún no has completado ninguna sesión.</p>
		{:else}
			<div class="space-y-2">
				{#each data.sessions as session}
					<div class="flex items-center gap-4 rounded-lg px-3 py-2 hover:bg-gray-50">
						<span class="flex-1 text-sm text-gray-700">{formatDate(session.startedAt)}</span>
						<span class="text-sm text-gray-500"
							>{session.correctCards}/{session.totalCards} correctas</span
						>
						{#if session.totalCards > 0}
							<span
								class="text-xs font-medium {Math.round((session.correctCards / session.totalCards) * 100) >= 70
									? 'text-green-600'
									: 'text-amber-600'}"
							>
								{Math.round((session.correctCards / session.totalCards) * 100)}%
							</span>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
