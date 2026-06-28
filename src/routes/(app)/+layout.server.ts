import { redirect } from '@sveltejs/kit';
import { getActiveLang } from '$lib/server/lang';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals, cookies }) => {
	if (!locals.user) redirect(302, '/login');

	const activeLang = getActiveLang(cookies);

	return {
		user: { email: locals.user.email },
		activeLang
	};
};
