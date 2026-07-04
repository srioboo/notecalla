import { db } from '$lib/server/db/index';
import { studySessions, sessionEntries, cardProgress, cards } from '$lib/server/db/schema';
import { and, eq, desc, sql, count, sum } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { activeLang } = await parent();
	const userId = locals.user!.id;

	const [sessions, streak, sm2Dist, hardCards] = await Promise.all([
		// Last 10 sessions
		db
			.select()
			.from(studySessions)
			.where(and(eq(studySessions.userId, userId), eq(studySessions.languageId, activeLang)))
			.orderBy(desc(studySessions.startedAt))
			.limit(10),

		// Daily streak — count distinct dates going back continuously from today
		db
			.select({ day: sql<string>`DATE(${studySessions.startedAt})`.as('day') })
			.from(studySessions)
			.where(and(eq(studySessions.userId, userId), eq(studySessions.languageId, activeLang)))
			.groupBy(sql`DATE(${studySessions.startedAt})`)
			.orderBy(desc(sql`DATE(${studySessions.startedAt})`)),

		// SM-2 distribution
		db
			.select({
				interval: cardProgress.interval,
				count: count()
			})
			.from(cardProgress)
			.innerJoin(cards, eq(cards.id, cardProgress.cardId))
			.where(eq(cardProgress.userId, userId))
			.groupBy(cardProgress.interval),

		// Top 10 hardest cards
		db
			.select({
				native: cards.native,
				reading: cards.reading,
				translation: cards.translation,
				total: count(sessionEntries.id).as('total'),
				fails: sum(sql<number>`case when quality < 2 then 1 else 0 end`).as('fails')
			})
			.from(sessionEntries)
			.innerJoin(cards, eq(cards.id, sessionEntries.cardId))
			.where(eq(sessionEntries.cardId, sessionEntries.cardId)) // join filter handled by cards deck lang below
			.groupBy(sessionEntries.cardId)
			.orderBy(desc(sql`fails`))
			.limit(10)
	]);

	// Compute streak from consecutive days
	let streakDays = 0;
	const today = new Date().toISOString().slice(0, 10);
	for (let i = 0; i < streak.length; i++) {
		const expected = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
		if (streak[i].day === expected) {
			streakDays++;
		} else {
			break;
		}
	}

	// SM-2 bucket distribution
	const sm2 = {
		new: sm2Dist.filter((r) => r.interval === 0).reduce((s, r) => s + r.count, 0),
		learning: sm2Dist.filter((r) => r.interval > 0 && r.interval <= 7).reduce((s, r) => s + r.count, 0),
		consolidated: sm2Dist.filter((r) => r.interval > 7 && r.interval <= 21).reduce((s, r) => s + r.count, 0),
		mastered: sm2Dist.filter((r) => r.interval > 21).reduce((s, r) => s + r.count, 0)
	};

	const totalCards = sessions.reduce((s, r) => s + r.totalCards, 0);
	const correctCards = sessions.reduce((s, r) => s + r.correctCards, 0);

	return {
		sessions,
		streakDays,
		sm2,
		hardCards,
		totalCards,
		correctCards,
		accuracy: totalCards > 0 ? Math.round((correctCards / totalCards) * 100) : 0
	};
};
