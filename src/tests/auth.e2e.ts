import { test, expect } from '@playwright/test';

const UNIQUE = Date.now();
const EMAIL = `test_${UNIQUE}@example.com`;
const PASSWORD = 'Segura1234!';

async function register(page: import('@playwright/test').Page, email: string, password: string) {
	await page.goto('/register');
	await page.getByLabel('Email').fill(email);
	await page.getByLabel('Contraseña').first().fill(password);
	await page.getByLabel('Repetir contraseña').fill(password);
	await page.getByRole('button', { name: 'Crear cuenta' }).click();
	await expect(page).toHaveURL('/study');
}


test.describe('Autenticación', () => {
	test('registro → logout → login', async ({ page }) => {
		await register(page, EMAIL, PASSWORD);
		await expect(page.getByText('Estudiar')).toBeVisible();

		// Logout
		await page.getByRole('button', { name: 'Salir' }).click();
		await expect(page).toHaveURL('/login');

		// Login
		await page.getByLabel('Email').fill(EMAIL);
		await page.getByLabel('Contraseña').fill(PASSWORD);
		await page.getByRole('button', { name: 'Entrar' }).click();
		await expect(page).toHaveURL('/study');
	});

	test('login con credenciales incorrectas muestra error', async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel('Email').fill('noexiste@example.com');
		await page.getByLabel('Contraseña').fill('claveErronea');
		await page.getByRole('button', { name: 'Entrar' }).click();

		await expect(page).toHaveURL('/login');
		await expect(page.locator('.text-red-700')).toBeVisible();
	});

	test('rutas protegidas redirigen a login sin sesión', async ({ page }) => {
		await page.goto('/study');
		await expect(page).toHaveURL('/login');
	});
});
