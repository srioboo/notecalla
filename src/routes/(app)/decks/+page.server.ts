import { db } from '$lib/server/db/index';
import { decks, cards } from '$lib/server/db/schema';
import { and, eq, or, count } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { getActiveLang, getLangId } from '$lib/server/lang';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	const activeLang = getActiveLang(cookies);
	const userId = locals.user!.id;
	const langId = await getLangId(activeLang);

	const rows = await db
		.select({
			id: decks.id,
			name: decks.name,
			description: decks.description,
			isSystem: decks.isSystem,
			createdBy: decks.createdBy,
			cardCount: count(cards.id)
		})
		.from(decks)
		.leftJoin(cards, and(eq(cards.deckId, decks.id), eq(cards.suspended, false)))
		.where(and(eq(decks.languageId, langId), or(eq(decks.isSystem, true), eq(decks.createdBy, userId))))
		.groupBy(decks.id);

	return { decks: rows };
};

export const actions: Actions = {
	create: async ({ request, locals, cookies }) => {
		const activeLang = getActiveLang(cookies);
		const userId = locals.user!.id;
		const langId = await getLangId(activeLang);
		const data = await request.formData();

		const name = String(data.get('name') ?? '').trim();
		if (!name) return fail(400, { error: 'El nombre del mazo es obligatorio.' });

		await db.insert(decks).values({
			languageId: langId,
			name,
			description: String(data.get('description') ?? '').trim() || null,
			isSystem: false,
			createdBy: userId
		});
	},

	clone: async ({ request, locals, cookies }) => {
		const activeLang = getActiveLang(cookies);
		const userId = locals.user!.id;
		const langId = await getLangId(activeLang);
		const data = await request.formData();
		const sourceDeckId = String(data.get('deckId') ?? '');

		const source = await db.query.decks.findFirst({
			where: eq(decks.id, sourceDeckId),
			with: { cards: true }
		});
		if (!source) return fail(404, { error: 'Mazo no encontrado.' });

		const [newDeck] = await db
			.insert(decks)
			.values({
				languageId: langId,
				name: `${source.name} (copia)`,
				description: source.description,
				isSystem: false,
				createdBy: userId
			})
			.returning({ id: decks.id });

		if (source.cards.length > 0) {
			await db.insert(cards).values(
				source.cards.map((c) => ({
					deckId: newDeck.id,
					native: c.native,
					reading: c.reading,
					translation: c.translation,
					example: c.example,
					notes: c.notes
				}))
			);
		}
	},

	delete: async ({ request, locals }) => {
		const userId = locals.user!.id;
		const data = await request.formData();
		const deckId = String(data.get('deckId') ?? '');

		const deck = await db.query.decks.findFirst({ where: eq(decks.id, deckId) });
		if (!deck || deck.isSystem || deck.createdBy !== userId) {
			return fail(403, { error: 'No tienes permiso para eliminar este mazo.' });
		}

		await db.delete(decks).where(eq(decks.id, deckId));
		redirect(302, '/decks');
	}
};
