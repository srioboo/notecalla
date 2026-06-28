<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>Crear cuenta — Notecalla</title></svelte:head>

<div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
	<h2 class="mb-6 text-xl font-semibold text-gray-900">Crear cuenta</h2>

	{#if form?.error}
		<p class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{form.error}</p>
	{/if}

	<form method="POST" use:enhance class="space-y-4">
		<div>
			<label for="email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
			<input
				id="email"
				name="email"
				type="email"
				autocomplete="email"
				value={form?.email ?? ''}
				required
				class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
			/>
		</div>

		<div>
			<label for="password" class="mb-1 block text-sm font-medium text-gray-700">Contraseña</label>
			<input
				id="password"
				name="password"
				type="password"
				autocomplete="new-password"
				minlength="8"
				required
				class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
			/>
		</div>

		<div>
			<label for="confirm" class="mb-1 block text-sm font-medium text-gray-700"
				>Repetir contraseña</label
			>
			<input
				id="confirm"
				name="confirm"
				type="password"
				autocomplete="new-password"
				minlength="8"
				required
				class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
			/>
		</div>

		<button
			type="submit"
			class="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 active:scale-95"
		>
			Crear cuenta
		</button>
	</form>

	<p class="mt-4 text-center text-sm text-gray-500">
		¿Ya tienes cuenta?
		<a href="/login" class="font-medium text-indigo-600 hover:underline">Inicia sesión</a>
	</p>
</div>
