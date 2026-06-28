<script lang="ts">
	let { children } = $props();
</script>

<main class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
	<div class="w-full max-w-sm">
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-bold tracking-tight text-gray-900">Notecalla</h1>
			<p class="mt-1 text-sm text-gray-500">Aprende idiomas con tarjetas de memoria</p>
		</div>
		{@render children()}
	</div>
</main>
