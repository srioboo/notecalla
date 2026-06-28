import { db } from '$lib/server/db/index';
import { decks } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

// System deck names created by seed.ts
const ALPHABET_DECK_NAMES = ['Hiragana', 'Katakana'];

export const load: PageServerLoad = async () => {
	const alphabetDecks = await db
		.select({ id: decks.id, name: decks.name, description: decks.description })
		.from(decks)
		.where(
			and(
				eq(decks.languageId, 'ja'),
				eq(decks.isSystem, true)
			)
		)
		.all();

	// Filter to alphabet decks only (exclude vocabulary decks)
	const filtered = alphabetDecks.filter((d) => ALPHABET_DECK_NAMES.includes(d.name));

	return { decks: filtered };
};
