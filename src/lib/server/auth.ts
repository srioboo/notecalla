import { Lucia } from 'lucia';
import { eq, lte } from 'drizzle-orm';
import { db } from './db/index';
import { sessions, users } from './db/schema';
import type { Adapter, DatabaseSession, DatabaseUser } from 'lucia';

const adapter: Adapter = {
	async getSessionAndUser(sessionId) {
		const [row] = await db
			.select({
				session: sessions,
				user: users
			})
			.from(sessions)
			.innerJoin(users, eq(sessions.userId, users.id))
			.where(eq(sessions.id, sessionId))
			.limit(1);

		if (!row) return [null, null];

		return [
			{
				id: row.session.id,
				userId: row.session.userId,
				expiresAt: row.session.expiresAt,
				attributes: {}
			},
			{
				id: row.user.id,
				attributes: {
					email: row.user.email,
					nativeLanguage: row.user.nativeLanguage
				}
			}
		];
	},

	async getUserSessions(userId) {
		const rows = await db.select().from(sessions).where(eq(sessions.userId, userId));
		return rows.map(
			(s): DatabaseSession => ({
				id: s.id,
				userId: s.userId,
				expiresAt: s.expiresAt,
				attributes: {}
			})
		);
	},

	async setSession(session) {
		await db.insert(sessions).values({
			id: session.id,
			userId: session.userId,
			expiresAt: session.expiresAt
		});
	},

	async updateSessionExpiration(sessionId, expiresAt) {
		await db.update(sessions).set({ expiresAt }).where(eq(sessions.id, sessionId));
	},

	async deleteSession(sessionId) {
		await db.delete(sessions).where(eq(sessions.id, sessionId));
	},

	async deleteUserSessions(userId) {
		await db.delete(sessions).where(eq(sessions.userId, userId));
	},

	async deleteExpiredSessions() {
		await db.delete(sessions).where(lte(sessions.expiresAt, new Date()));
	}
};

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: process.env.NODE_ENV === 'production'
		}
	},
	getUserAttributes(attrs) {
		return {
			email: (attrs as { email: string; nativeLanguage: string }).email,
			nativeLanguage: (attrs as { email: string; nativeLanguage: string }).nativeLanguage
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			email: string;
			nativeLanguage: string;
		};
	}
}
