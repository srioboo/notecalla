<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll, goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { LayoutData } from './$types';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();

	const LANGS = [
		{ code: 'ja', label: '日本語', flag: '🇯🇵' },
		{ code: 'ko', label: '한국어', flag: '🇰🇷' }
	] as const;

	async function switchLang(code: string) {
		document.cookie = `lang=${code}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
		await invalidateAll();
	}

	const navLinks = [
		{ href: '/study', label: 'Estudiar' },
		{ href: '/alphabet', label: 'Alfabeto' },
		{ href: '/decks', label: 'Mazos' },
		{ href: '/stats', label: 'Progreso' }
	];
</script>

<div class="flex min-h-screen flex-col bg-gray-50">
	<header class="border-b border-gray-200 bg-white">
		<nav class="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
			<a href="/study" class="mr-2 text-lg font-bold text-indigo-600">Notecalla</a>

			{#each navLinks as link}
				<a
					href={link.href}
					class="text-sm font-medium transition-colors {page.url.pathname.startsWith(link.href)
						? 'text-indigo-600'
						: 'text-gray-600 hover:text-gray-900'}"
				>
					{link.label}
				</a>
			{/each}

			<div class="ml-auto flex items-center gap-3">
				<!-- Language switcher -->
				<div class="flex rounded-lg border border-gray-200 bg-gray-100 p-0.5">
					{#each LANGS as lang}
						<button
							type="button"
							onclick={() => switchLang(lang.code)}
							class="rounded-md px-2.5 py-1 text-xs font-medium transition {data.activeLang ===
							lang.code
								? 'bg-white text-gray-900 shadow-sm'
								: 'text-gray-500 hover:text-gray-700'}"
							title={lang.label}
						>
							{lang.flag}
							{lang.code.toUpperCase()}
						</button>
					{/each}
				</div>

				<span class="hidden text-xs text-gray-400 sm:block">{data.user.email}</span>

				<form method="POST" action="/logout" use:enhance>
					<button
						type="submit"
						class="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
					>
						Salir
					</button>
				</form>
			</div>
		</nav>
	</header>

	<main class="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
		{@render children()}
	</main>
</div>
