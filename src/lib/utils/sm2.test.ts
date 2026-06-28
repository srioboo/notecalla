import { describe, expect, it } from 'vitest';
import { calculateNextReview, initialProgress, type SM2Progress } from './sm2';

const base: SM2Progress = initialProgress();

describe('calculateNextReview', () => {
	it('first successful review (very easy) sets interval to 1 day', () => {
		const result = calculateNextReview(base, 3);
		expect(result.interval).toBe(1);
		expect(result.repetitions).toBe(1);
		expect(result.easeFactor).toBeGreaterThan(base.easeFactor);
	});

	it('second successful review sets interval to 6 days', () => {
		const after1 = calculateNextReview(base, 3);
		const after2 = calculateNextReview(after1, 3);
		expect(after2.interval).toBe(6);
		expect(after2.repetitions).toBe(2);
	});

	it('third successful review multiplies interval by ease factor', () => {
		const after1 = calculateNextReview(base, 3);
		const after2 = calculateNextReview(after1, 3);
		const after3 = calculateNextReview(after2, 3);
		expect(after3.interval).toBe(Math.round(6 * after2.easeFactor));
		expect(after3.repetitions).toBe(3);
	});

	it('failed recall (quality 0) resets repetitions and interval to 1', () => {
		const after1 = calculateNextReview(base, 3);
		const after2 = calculateNextReview(after1, 3);
		const failed = calculateNextReview(after2, 0);
		expect(failed.repetitions).toBe(0);
		expect(failed.interval).toBe(1);
	});

	it('failed recall reduces ease factor', () => {
		const failed = calculateNextReview(base, 0);
		expect(failed.easeFactor).toBeLessThan(base.easeFactor);
	});

	it('ease factor never drops below 1.3', () => {
		let progress = base;
		for (let i = 0; i < 20; i++) {
			progress = calculateNextReview(progress, 0);
		}
		expect(progress.easeFactor).toBeGreaterThanOrEqual(1.3);
	});

	it('hard review (quality 1) also resets on SM-2 scale (q=2 < 3)', () => {
		const after1 = calculateNextReview(base, 3);
		const hard = calculateNextReview(after1, 1);
		expect(hard.repetitions).toBe(0);
		expect(hard.interval).toBe(1);
	});

	it('nextReview is in the future', () => {
		const now = new Date();
		const result = calculateNextReview(base, 3);
		expect(result.nextReview.getTime()).toBeGreaterThan(now.getTime());
	});
});
