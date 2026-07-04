import { db } from '$lib/server/db/index';
import { decks } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

const ALPHABET_DECK_NAMES = ['Consonantes (자음)', 'Vocales (모음)'];

export const load: PageServerLoad = async () => {
	const alphabetDecks = await db
		.select({ id: decks.id, name: decks.name, description: decks.description })
		.from(decks)
		.where(and(eq(decks.languageId, 'ko'), eq(decks.isSystem, true)));

	const filtered = alphabetDecks.filter((d) => ALPHABET_DECK_NAMES.includes(d.name));

	return { decks: filtered };
};
