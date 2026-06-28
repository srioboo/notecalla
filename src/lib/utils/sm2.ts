export type AppQuality = 0 | 1 | 2 | 3;

export interface SM2Progress {
	easeFactor: number;
	interval: number;
	repetitions: number;
	nextReview: Date;
}

// App quality → SM-2 quality (0–5 scale)
// 0 = didn't know  → 0
// 1 = hard          → 2
// 2 = easy          → 4
// 3 = very easy     → 5
const toSM2Quality: Record<AppQuality, number> = { 0: 0, 1: 2, 2: 4, 3: 5 };

const MIN_EASE_FACTOR = 1.3;

export function calculateNextReview(current: SM2Progress, quality: AppQuality): SM2Progress {
	const q = toSM2Quality[quality];
	const { easeFactor, interval, repetitions } = current;

	if (q < 3) {
		// Failed recall — restart repetition count, next review tomorrow
		return {
			easeFactor: Math.max(MIN_EASE_FACTOR, easeFactor - 0.2),
			interval: 1,
			repetitions: 0,
			nextReview: daysFromNow(1)
		};
	}

	// Successful recall
	const newEaseFactor = Math.max(
		MIN_EASE_FACTOR,
		easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
	);

	let newInterval: number;
	if (repetitions === 0) {
		newInterval = 1;
	} else if (repetitions === 1) {
		newInterval = 6;
	} else {
		newInterval = Math.round(interval * easeFactor);
	}

	return {
		easeFactor: newEaseFactor,
		interval: newInterval,
		repetitions: repetitions + 1,
		nextReview: daysFromNow(newInterval)
	};
}

export function initialProgress(): SM2Progress {
	return {
		easeFactor: 2.5,
		interval: 0,
		repetitions: 0,
		nextReview: new Date()
	};
}

function daysFromNow(days: number): Date {
	const d = new Date();
	d.setDate(d.getDate() + days);
	d.setHours(0, 0, 0, 0);
	return d;
}
