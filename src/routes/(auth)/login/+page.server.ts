import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { db } from '$lib/server/db/index';
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

		const user = await db.query.users.findFirst({
			where: (u, { eq }) => eq(u.email, email)
		});

		// Use constant-time comparison to avoid timing attacks
		const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
		if (!user || !valid) {
			return fail(400, { email, error: 'Email o contraseña incorrectos.' });
		}

		const session = await lucia.createSession(user.id, {});
		const cookie = lucia.createSessionCookie(session.id);
		cookies.set(cookie.name, cookie.value, { path: '.', ...cookie.attributes });

		redirect(302, '/study');
	}
};
