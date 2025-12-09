import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { authenticateUser, createSession } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	// Si déjà connecté, rediriger vers la page d'accueil
	if (locals.user) {
		throw redirect(302, '/');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const usernameOrEmail = data.get('usernameOrEmail')?.toString();
		const password = data.get('password')?.toString();

		if (!usernameOrEmail || !password) {
			return fail(400, { error: 'Nom d\'utilisateur et mot de passe requis' });
		}

		const user = await authenticateUser(usernameOrEmail, password);

		if (!user) {
			return fail(400, { error: 'Identifiants invalides' });
		}

		const session = await createSession(user.id);

		cookies.set('session', session.id, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			expires: session.expiresAt
		});

		throw redirect(302, '/');
	}
};
