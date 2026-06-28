<script lang="ts">
	interface Props {
		seconds: number;       // total duration
		remaining: number;     // current remaining
		size?: number;
	}

	let { seconds, remaining, size = 64 }: Props = $props();

	const RADIUS = size / 2 - 4;
	const CIRC = 2 * Math.PI * RADIUS;
	const center = size / 2;

	const offset = $derived(seconds > 0 ? CIRC * (1 - remaining / seconds) : 0);
	const urgent = $derived(remaining <= 3 && seconds > 0);
</script>

<svg width={size} height={size} class="-rotate-90" aria-hidden="true">
	<circle cx={center} cy={center} r={RADIUS} fill="none" stroke="#e5e7eb" stroke-width="4" />
	<circle
		cx={center}
		cy={center}
		r={RADIUS}
		fill="none"
		stroke={urgent ? '#ef4444' : '#6366f1'}
		stroke-width="4"
		stroke-dasharray={CIRC}
		stroke-dashoffset={offset}
		stroke-linecap="round"
		class="transition-all duration-1000"
	/>
</svg>
