import type { AppQuality } from '$lib/utils/sm2';

export interface SessionCard {
	id: string;
	native: string;
	reading: string | null;
	translation: string;
	example: string | null;
}

export interface SessionEntry {
	cardId: string;
	quality: AppQuality;
	responseTimeMs: number;
}

export interface StudySession {
	deckId: string;
	timerSeconds: number;
	showRomaji: boolean;
	cards: SessionCard[];
	currentIndex: number;
	entries: SessionEntry[];
	revealed: boolean;
	studySessionId: string | null;
}

function createSessionStore() {
	let session = $state<StudySession | null>(null);

	return {
		get current() {
			return session;
		},
		start(s: Omit<StudySession, 'currentIndex' | 'entries' | 'revealed' | 'studySessionId'> & { studySessionId: string }) {
			session = { ...s, currentIndex: 0, entries: [], revealed: false };
		},
		reveal() {
			if (session) session.revealed = true;
		},
		record(quality: AppQuality, responseTimeMs: number) {
			if (!session) return;
			session.entries.push({ cardId: session.cards[session.currentIndex].id, quality, responseTimeMs });
			session.revealed = false;
			session.currentIndex++;
		},
		clear() {
			session = null;
		}
	};
}

export const studyStore = createSessionStore();
