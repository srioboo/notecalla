import { fail, redirect } from '@sveltejs/kit';
import { generateIdFromEntropySize } from 'lucia';
import bcrypt from 'bcryptjs';
import { db } from '$lib/server/db/index';
import { users } from '$lib/server/db/schema';
import { lucia } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(302, '/study');
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = String(data.get('email') ?? '').trim().toLowerCase();
		const password = String(data.get('password') ?? '');
		const confirm = String(data.get('confirm') ?? '');

		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return fail(400, { email, error: 'Email inválido.' });
		}
		if (password.length < 8) {
			return fail(400, { email, error: 'La contraseña debe tener al menos 8 caracteres.' });
		}
		if (password !== confirm) {
			return fail(400, { email, error: 'Las contraseñas no coinciden.' });
		}

		const existing = await db.query.users.findFirst({
			where: (u, { eq }) => eq(u.email, email)
		});
		if (existing) {
			return fail(400, { email, error: 'Ya existe una cuenta con ese email.' });
		}

		const userId = generateIdFromEntropySize(10);
		const passwordHash = await bcrypt.hash(password, 12);

		await db.insert(users).values({ id: userId, email, passwordHash });

		const session = await lucia.createSession(userId, {});
		const cookie = lucia.createSessionCookie(session.id);
		cookies.set(cookie.name, cookie.value, { path: '.', ...cookie.attributes });

		redirect(302, '/study');
	}
};
