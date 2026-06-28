import { redirect } from '@sveltejs/kit';
import { lucia } from '$lib/server/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ locals, cookies }) => {
		if (!locals.session) redirect(302, '/login');

		await lucia.invalidateSession(locals.session.id);
		const cookie = lucia.createBlankSessionCookie();
		cookies.set(cookie.name, cookie.value, { path: '.', ...cookie.attributes });

		redirect(302, '/login');
	}
};
