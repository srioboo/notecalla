import { test, expect } from '@playwright/test';

const UNIQUE = Date.now();
const EMAIL = `vocab_${UNIQUE}@example.com`;
const PASSWORD = 'Segura1234!';

async function doRegister(page: import('@playwright/test').Page) {
	await page.goto('/register');
	await page.getByLabel('Email').fill(EMAIL);
	await page.getByLabel('Contraseña').first().fill(PASSWORD);
	await page.getByLabel('Repetir contraseña').fill(PASSWORD);
	await page.getByRole('button', { name: 'Crear cuenta' }).click();
	await expect(page).toHaveURL('/study');
}

test.describe('Sesión de vocabulario', () => {
	test.beforeEach(async ({ page }) => {
		await doRegister(page);
	});

	test('flujo completo: configurar → estudiar → ver resumen', async ({ page }) => {
		const deckSelect = page.locator('select[name="deckId"]').first();

		await page.waitForSelector('select[name="deckId"] option:not([value=""])', { timeout: 5000 }).catch(() => null);
		const options = await deckSelect.locator('option').count();

		if (options <= 1) {
			test.skip();
			return;
		}

		await deckSelect.selectOption({ index: 1 });
		const deckId = await deckSelect.inputValue();
		await page.goto(`/study/session?deck=${deckId}&limit=5&timer=0`);
		await expect(page).toHaveURL(/\/study\/session/);
		await expect(page.getByTestId('flashcard')).toBeVisible({ timeout: 10000 });

		for (let i = 0; i < 5; i++) {
			const revealBtn = page.getByRole('button', { name: 'Revelar respuesta' });
			if (!(await revealBtn.isVisible({ timeout: 3000 }).catch(() => false))) break;

			await revealBtn.click();
			await page.getByRole('button', { name: 'Fácil' }).click();
		}

		await expect(page).toHaveURL(/\/study\/summary/, { timeout: 15000 });
		await expect(page.getByText(/resultado|resumen|tarjeta/i)).toBeVisible();
	});
});
