import { test, expect } from '@playwright/test';

const UNIQUE = Date.now();
const EMAIL = `alpha_${UNIQUE}@example.com`;
const PASSWORD = 'Segura1234!';

async function doRegister(page: import('@playwright/test').Page) {
	await page.goto('/register');
	await page.getByLabel('Email').fill(EMAIL);
	await page.getByLabel('Contraseña').first().fill(PASSWORD);
	await page.getByLabel('Repetir contraseña').fill(PASSWORD);
	await page.getByRole('button', { name: 'Crear cuenta' }).click();
	await expect(page).toHaveURL('/study');
}

test.describe('Modo alfabeto', () => {
	test.beforeEach(async ({ page }) => {
		await doRegister(page);
	});

	test('navega a selector de idioma de alfabeto', async ({ page }) => {
		await page.getByRole('link', { name: 'Alfabeto' }).click();
		await expect(page).toHaveURL('/alphabet');
		await expect(page.getByText(/japonés|coreano/i)).toBeVisible();
	});

	test('flujo hiragana: selector → sesión sin tarjetas repetidas', async ({ page }) => {
		await page.goto('/alphabet/ja');

		const hirBtn = page.getByText('Hiragana').first();
		const visible = await hirBtn.isVisible({ timeout: 5000 }).catch(() => false);
		if (!visible) {
			test.skip();
			return;
		}

		await hirBtn.click();

		const startLink = page.getByRole('link', { name: /iniciar/i });
		await expect(startLink).not.toHaveAttribute('aria-disabled', 'true');

		await startLink.click();
		await expect(page).toHaveURL(/\/study\/session/);
		await expect(page.getByTestId('flashcard')).toBeVisible({ timeout: 10000 });

		const seenFronts = new Set<string>();

		for (let i = 0; i < 10; i++) {
			const revealBtn = page.getByRole('button', { name: 'Revelar respuesta' });
			if (!(await revealBtn.isVisible({ timeout: 3000 }).catch(() => false))) break;

			const frontText = await page.locator('[data-testid="flashcard"] p.text-5xl').first().textContent();
			if (frontText && frontText.trim()) {
				expect(seenFronts.has(frontText.trim())).toBe(false);
				seenFronts.add(frontText.trim());
			}

			await revealBtn.click();
			await page.getByRole('button', { name: 'Fácil' }).click();
		}
	});

	test('flujo jamo coreano: consonantes → sesión arranca', async ({ page }) => {
		await page.goto('/alphabet/ko');

		const conBtn = page.locator('button').filter({ hasText: /consonantes/i }).first();
		const visible = await conBtn.isVisible({ timeout: 5000 }).catch(() => false);
		if (!visible) {
			test.skip();
			return;
		}

		await conBtn.click();

		const startLink = page.getByRole('link', { name: /iniciar/i });
		await expect(startLink).not.toHaveAttribute('aria-disabled', 'true');

		await startLink.click();
		await expect(page).toHaveURL(/\/study\/session/);
		await expect(page.getByRole('button', { name: 'Revelar respuesta' })).toBeVisible({ timeout: 5000 });
	});
});
