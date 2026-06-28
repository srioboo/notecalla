<script lang="ts">
	interface Card {
		native: string;
		reading: string | null;
		translation: string;
		example?: string | null;
	}

	interface Props {
		card: Card;
		revealed: boolean;
		direction?: 'target_to_native' | 'native_to_target' | 'random';
		showRomaji?: boolean;
		/** Label for the front side — shown above the main word */
		frontHint?: string;
		/** Label for the back side */
		backHint?: string;
	}

	let {
		card,
		revealed,
		direction = 'target_to_native',
		showRomaji = true,
		frontHint,
		backHint
	}: Props = $props();

	const showNativeFirst = $derived(direction !== 'native_to_target');
</script>

<div
	class="min-h-56 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200"
	role="region"
	aria-label="Tarjeta de estudio"
>
	{#if showNativeFirst}
		<p class="text-sm font-medium text-gray-400">{frontHint ?? '¿Qué significa?'}</p>
		<p class="mt-4 text-5xl font-medium text-gray-900">{card.native}</p>
		{#if showRomaji && card.reading && !revealed}
			<p class="mt-2 text-sm text-gray-400">{card.reading}</p>
		{/if}
	{:else}
		<p class="text-sm font-medium text-gray-400">{frontHint ?? 'Traduce al idioma objetivo:'}</p>
		<p class="mt-4 text-2xl font-semibold text-gray-900">{card.translation}</p>
	{/if}

	{#if revealed}
		<div class="mt-6 border-t border-gray-100 pt-6">
			{#if showNativeFirst}
				<p class="text-xl font-semibold text-indigo-700">{card.translation}</p>
				{#if showRomaji && card.reading}
					<p class="mt-1 text-sm text-gray-400">{card.reading}</p>
				{/if}
			{:else}
				<p class="text-5xl font-medium text-gray-900">{card.native}</p>
				{#if showRomaji && card.reading}
					<p class="mt-2 text-sm text-gray-400">{card.reading}</p>
				{/if}
			{/if}
			{#if card.example}
				<p class="mt-3 text-sm italic text-gray-400">{card.example}</p>
			{/if}
		</div>
	{/if}
</div>
