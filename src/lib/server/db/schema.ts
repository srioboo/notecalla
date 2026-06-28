import { integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const languages = sqliteTable('languages', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	code: text('code').notNull().unique(), // 'ja' | 'ko'
	name: text('name').notNull()
});

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	nativeLanguage: text('native_language').notNull().default('es'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// Lucia v3 sessions table
export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const decks = sqliteTable('decks', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	languageId: text('language_id')
		.notNull()
		.references(() => languages.id),
	name: text('name').notNull(),
	description: text('description'),
	isSystem: integer('is_system', { mode: 'boolean' }).notNull().default(false),
	createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

export const deckTags = sqliteTable('deck_tags', {
	deckId: text('deck_id')
		.notNull()
		.references(() => decks.id, { onDelete: 'cascade' }),
	tag: text('tag').notNull(),
	tagType: text('tag_type', { enum: ['theme', 'grammar'] }).notNull()
});

export const cards = sqliteTable('cards', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	deckId: text('deck_id')
		.notNull()
		.references(() => decks.id, { onDelete: 'cascade' }),
	native: text('native').notNull(), // word/symbol in target language
	reading: text('reading'), // romaji / hangul romanization
	translation: text('translation').notNull(),
	example: text('example'),
	notes: text('notes'),
	suspended: integer('suspended', { mode: 'boolean' }).notNull().default(false)
});

export const cardProgress = sqliteTable('card_progress', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	cardId: text('card_id')
		.notNull()
		.references(() => cards.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	easeFactor: real('ease_factor').notNull().default(2.5),
	interval: integer('interval').notNull().default(0), // days until next review
	nextReview: integer('next_review', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	repetitions: integer('repetitions').notNull().default(0)
});

export const studySessions = sqliteTable('study_sessions', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	languageId: text('language_id')
		.notNull()
		.references(() => languages.id),
	deckId: text('deck_id').references(() => decks.id, { onDelete: 'set null' }),
	startedAt: integer('started_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	completedAt: integer('completed_at', { mode: 'timestamp' }),
	totalCards: integer('total_cards').notNull().default(0),
	correctCards: integer('correct_cards').notNull().default(0)
});

export const sessionEntries = sqliteTable('session_entries', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	studySessionId: text('study_session_id')
		.notNull()
		.references(() => studySessions.id, { onDelete: 'cascade' }),
	cardId: text('card_id')
		.notNull()
		.references(() => cards.id, { onDelete: 'cascade' }),
	quality: integer('quality').notNull(), // 0–3 mapped to SM-2 quality 0–5
	responseTimeMs: integer('response_time_ms'),
	reviewedAt: integer('reviewed_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// Composite primary key: one row per (user, language) pair
export const userSettings = sqliteTable(
	'user_settings',
	{
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		languageCode: text('language_code').notNull(),
		timerSeconds: integer('timer_seconds').notNull().default(10),
		cardDirection: text('card_direction', {
			enum: ['target_to_native', 'native_to_target', 'random']
		})
			.notNull()
			.default('random'),
		showRomaji: integer('show_romaji', { mode: 'boolean' }).notNull().default(true)
	},
	(t) => [primaryKey({ columns: [t.userId, t.languageCode] })]
);

// ── Relations (used by Drizzle relational query builder) ──────────────────────

export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	decks: many(decks),
	cardProgress: many(cardProgress),
	studySessions: many(studySessions),
	settings: many(userSettings)
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] })
}));

export const decksRelations = relations(decks, ({ one, many }) => ({
	language: one(languages, { fields: [decks.languageId], references: [languages.id] }),
	creator: one(users, { fields: [decks.createdBy], references: [users.id] }),
	cards: many(cards),
	tags: many(deckTags)
}));

export const deckTagsRelations = relations(deckTags, ({ one }) => ({
	deck: one(decks, { fields: [deckTags.deckId], references: [decks.id] })
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
	deck: one(decks, { fields: [cards.deckId], references: [decks.id] }),
	progress: many(cardProgress),
	sessionEntries: many(sessionEntries)
}));

export const cardProgressRelations = relations(cardProgress, ({ one }) => ({
	card: one(cards, { fields: [cardProgress.cardId], references: [cards.id] }),
	user: one(users, { fields: [cardProgress.userId], references: [users.id] })
}));

export const studySessionsRelations = relations(studySessions, ({ one, many }) => ({
	user: one(users, { fields: [studySessions.userId], references: [users.id] }),
	deck: one(decks, { fields: [studySessions.deckId], references: [decks.id] }),
	entries: many(sessionEntries)
}));

export const sessionEntriesRelations = relations(sessionEntries, ({ one }) => ({
	session: one(studySessions, {
		fields: [sessionEntries.studySessionId],
		references: [studySessions.id]
	}),
	card: one(cards, { fields: [sessionEntries.cardId], references: [cards.id] })
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
	user: one(users, { fields: [userSettings.userId], references: [users.id] })
}));
