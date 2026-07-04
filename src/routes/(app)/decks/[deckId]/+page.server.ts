import { db } from '$lib/server/db/index';
import { decks, cards } from '$lib/server/db/schema';
import { and, eq, or } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const userId = locals.user!.id;

	const deck = await db.query.decks.findFirst({
		where: and(
			eq(decks.id, params.deckId),
			or(eq(decks.isSystem, true), eq(decks.createdBy, userId))
		)
	});
	if (!deck) error(404, 'Mazo no encontrado.');

	const deckCards = await db.select().from(cards).where(eq(cards.deckId, params.deckId));

	return { deck, cards: deckCards };
};

export const actions: Actions = {
	addCard: async ({ request, locals, params }) => {
		const userId = locals.user!.id;
		const deck = await db.query.decks.findFirst({
			where: and(eq(decks.id, params.deckId), eq(decks.createdBy, userId))
		});
		if (!deck) return fail(403, { error: 'No puedes modificar este mazo.' });

		const data = await request.formData();
		const native = String(data.get('native') ?? '').trim();
		const reading = String(data.get('reading') ?? '').trim();
		const translation = String(data.get('translation') ?? '').trim();

		if (!native || !translation) {
			return fail(400, { error: 'Palabra y traducción son obligatorios.' });
		}

		await db.insert(cards).values({
			deckId: params.deckId,
			native,
			reading: reading || null,
			translation,
			example: String(data.get('example') ?? '').trim() || null,
			notes: String(data.get('notes') ?? '').trim() || null
		});
	},

	toggleSuspend: async ({ request, locals, params }) => {
		const userId = locals.user!.id;
		const data = await request.formData();
		const cardId = String(data.get('cardId') ?? '');

		const card = await db.query.cards.findFirst({
			where: eq(cards.id, cardId),
			with: { deck: true }
		});
		if (!card || (card.deck.createdBy !== userId && !card.deck.isSystem)) {
			return fail(403, { error: 'Sin permiso.' });
		}

		await db
			.update(cards)
			.set({ suspended: !card.suspended })
			.where(eq(cards.id, cardId));
	},

	deleteCard: async ({ request, locals }) => {
		const userId = locals.user!.id;
		const data = await request.formData();
		const cardId = String(data.get('cardId') ?? '');

		const card = await db.query.cards.findFirst({
			where: eq(cards.id, cardId),
			with: { deck: true }
		});
		if (!card || card.deck.isSystem || card.deck.createdBy !== userId) {
			return fail(403, { error: 'Sin permiso.' });
		}

		await db.delete(cards).where(eq(cards.id, cardId));
	}
};
