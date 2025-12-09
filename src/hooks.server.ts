import { validateSession } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Récupérer le cookie de session
	const sessionId = event.cookies.get('session');

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	// Valider la session
	const { session, user } = await validateSession(sessionId);

	if (session && user) {
		event.locals.session = session;
		event.locals.user = user;

		// Mettre à jour le cookie avec la nouvelle date d'expiration
		event.cookies.set('session', session.id, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			expires: session.expiresAt
		});
	} else {
		event.locals.user = null;
		event.locals.session = null;

		// Supprimer le cookie invalide
		event.cookies.delete('session', { path: '/' });
	}

	return resolve(event);
};
