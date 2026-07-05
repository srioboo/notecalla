import { db } from '$lib/server/db/index';
import { decks, userSettings } from '$lib/server/db/schema';
import { and, eq, or } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { getActiveLang, getLangId } from '$lib/server/lang';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	const activeLang = getActiveLang(cookies);
	const userId = locals.user!.id;
	const langId = await getLangId(activeLang);

	const [availableDecks, settings] = await Promise.all([
		db
			.select({ id: decks.id, name: decks.name, description: decks.description, isSystem: decks.isSystem })
			.from(decks)
			.where(and(eq(decks.languageId, langId), or(eq(decks.isSystem, true), eq(decks.createdBy, userId)))),
		db.query.userSettings.findFirst({
			where: and(eq(userSettings.userId, userId), eq(userSettings.languageCode, activeLang))
		})
	]);

	return {
		decks: availableDecks,
		settings: settings ?? { timerSeconds: 10, cardDirection: 'random' as const, showRomaji: true }
	};
};

export const actions: Actions = {
	saveSettings: async ({ request, locals, cookies }) => {
		const activeLang = getActiveLang(cookies);
		const userId = locals.user!.id;
		const data = await request.formData();

		const timerSeconds = Number(data.get('timerSeconds')) || 10;
		const cardDirection = String(data.get('cardDirection') || 'random') as
			| 'target_to_native'
			| 'native_to_target'
			| 'random';
		const showRomaji = data.get('showRomaji') === 'true';

		if (![5, 10, 15, 20, 0].includes(timerSeconds)) {
			return fail(400, { error: 'Tiempo inválido.' });
		}

		await db
			.insert(userSettings)
			.values({ userId, languageCode: activeLang, timerSeconds, cardDirection, showRomaji })
			.onConflictDoUpdate({
				target: [userSettings.userId, userSettings.languageCode],
				set: { timerSeconds, cardDirection, showRomaji }
			});
	}
};
