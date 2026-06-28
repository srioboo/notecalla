import { db } from '$lib/server/db/index';
import { studySessions, sessionEntries, cards } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const userId = locals.user!.id;
	const sessionId = url.searchParams.get('session') ?? '';
	if (!sessionId) redirect(302, '/study');

	const session = await db.query.studySessions.findFirst({
		where: and(eq(studySessions.id, sessionId), eq(studySessions.userId, userId))
	});
	if (!session) error(404, 'Sesión no encontrada.');

	const entries = await db
		.select({
			quality: sessionEntries.quality,
			responseTimeMs: sessionEntries.responseTimeMs,
			native: cards.native,
			reading: cards.reading,
			translation: cards.translation
		})
		.from(sessionEntries)
		.innerJoin(cards, eq(cards.id, sessionEntries.cardId))
		.where(eq(sessionEntries.studySessionId, sessionId))
		.all();

	const accuracy =
		entries.length > 0
			? Math.round((entries.filter((e) => e.quality >= 2).length / entries.length) * 100)
			: 0;

	const avgResponseMs =
		entries.length > 0
			? Math.round(entries.reduce((s, e) => s + (e.responseTimeMs ?? 0), 0) / entries.length)
			: 0;

	return {
		total: session.totalCards,
		correct: session.correctCards,
		accuracy,
		avgResponseMs,
		entries
	};
};
