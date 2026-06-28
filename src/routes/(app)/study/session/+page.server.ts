import { db } from '$lib/server/db/index';
import { cards, cardProgress, studySessions, sessionEntries, decks } from '$lib/server/db/schema';
import { and, eq, lte, asc, sql } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import { calculateNextReview, initialProgress } from '$lib/utils/sm2';
import type { PageServerLoad, Actions } from './$types';
import type { AppQuality } from '$lib/utils/sm2';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const load: PageServerLoad = async ({ locals, url }) => {
	const userId = locals.user!.id;
	const deckId = url.searchParams.get('deck') ?? '';
	const timerSeconds = Number(url.searchParams.get('timer') ?? 10);
	const cardLimit = Math.min(Number(url.searchParams.get('limit') ?? DEFAULT_LIMIT), MAX_LIMIT);
	const cardDirection = (url.searchParams.get('direction') ?? 'random') as
		| 'random'
		| 'target_to_native'
		| 'native_to_target';
	const showRomaji = url.searchParams.get('romaji') !== 'false';

	if (!deckId) redirect(302, '/study');

	const deck = await db.query.decks.findFirst({ where: eq(decks.id, deckId) });
	if (!deck) error(404, 'Mazo no encontrado.');

	const now = new Date();

	// Cards due for review (have progress) or new (no progress yet)
	const due = await db
		.select({
			id: cards.id,
			native: cards.native,
			reading: cards.reading,
			translation: cards.translation,
			example: cards.example,
			nextReview: cardProgress.nextReview
		})
		.from(cards)
		.leftJoin(
			cardProgress,
			and(eq(cardProgress.cardId, cards.id), eq(cardProgress.userId, userId))
		)
		.where(
			and(
				eq(cards.deckId, deckId),
				eq(cards.suspended, false),
				// Due now: either no progress (new) or nextReview <= now
				sql`(${cardProgress.id} IS NULL OR ${cardProgress.nextReview} <= ${now})`
			)
		)
		.orderBy(asc(cardProgress.nextReview))
		.limit(cardLimit)
		.all();

	if (due.length === 0) redirect(302, '/study');

	// Create the study session record
	const [studySession] = await db
		.insert(studySessions)
		.values({ userId, languageId: deck.languageId, deckId })
		.returning({ id: studySessions.id });

	return {
		studySessionId: studySession.id,
		deckName: deck.name,
		timerSeconds,
		cardDirection,
		showRomaji,
		cards: due.map((c) => ({
			id: c.id,
			native: c.native,
			reading: c.reading,
			translation: c.translation,
			example: c.example
		}))
	};
};

export const actions: Actions = {
	submitEntries: async ({ request, locals }) => {
		const userId = locals.user!.id;
		const data = await request.formData();

		const studySessionId = String(data.get('studySessionId') ?? '');
		const entriesJson = String(data.get('entries') ?? '[]');

		let entries: Array<{ cardId: string; quality: number; responseTimeMs: number }>;
		try {
			entries = JSON.parse(entriesJson);
		} catch {
			return fail(400, { error: 'Datos de sesión inválidos.' });
		}

		const session = await db.query.studySessions.findFirst({
			where: and(eq(studySessions.id, studySessionId), eq(studySessions.userId, userId))
		});
		if (!session) return fail(403, { error: 'Sesión no encontrada.' });

		const correctCards = entries.filter((e) => e.quality >= 2).length;

		// Insert session entries and update card progress in parallel
		await Promise.all([
			db.insert(sessionEntries).values(
				entries.map((e) => ({
					studySessionId,
					cardId: e.cardId,
					quality: e.quality,
					responseTimeMs: e.responseTimeMs,
					reviewedAt: new Date()
				}))
			),
			...entries.map(async (e) => {
				const existing = await db.query.cardProgress.findFirst({
					where: and(eq(cardProgress.cardId, e.cardId), eq(cardProgress.userId, userId))
				});
				const current = existing ?? { ...initialProgress(), id: '', cardId: e.cardId, userId };
				const next = calculateNextReview(current, e.quality as AppQuality);

				if (existing) {
					await db
						.update(cardProgress)
						.set({ easeFactor: next.easeFactor, interval: next.interval, nextReview: next.nextReview, repetitions: next.repetitions })
						.where(eq(cardProgress.id, existing.id));
				} else {
					await db.insert(cardProgress).values({
						cardId: e.cardId,
						userId,
						easeFactor: next.easeFactor,
						interval: next.interval,
						nextReview: next.nextReview,
						repetitions: next.repetitions
					});
				}
			})
		]);

		// Update session totals
		await db
			.update(studySessions)
			.set({ completedAt: new Date(), totalCards: entries.length, correctCards })
			.where(eq(studySessions.id, studySessionId));

		redirect(302, `/study/summary?session=${studySessionId}`);
	}
};
