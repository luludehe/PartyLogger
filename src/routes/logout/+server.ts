import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { invalidateSession } from '$lib/server/auth';

export const POST: RequestHandler = async ({ locals, cookies }) => {
	if (!locals.session) {
		throw redirect(302, '/login');
	}

	await invalidateSession(locals.session.id);
	cookies.delete('session', { path: '/' });

	throw redirect(302, '/login');
};
