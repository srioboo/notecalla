import { redirect } from '@sveltejs/kit';
import { getActiveLang } from '$lib/server/lang';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ cookies }) => {
	const lang = getActiveLang(cookies);
	redirect(302, `/alphabet/${lang}`);
};
