import type { RequestHandler } from '@sveltejs/kit';
import GuestService from '../../../../services/GuestService';
import { hasPermission, PERMISSIONS } from '$lib/server/permissions';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	// Vérifier l'authentification et les permissions
	if (!locals.user || !hasPermission(locals.user, PERMISSIONS.VIEW_GUESTS)) {
		return json({ error: 'Permission refusée' }, { status: 403 });
	}
	try {
		const guests = await GuestService.getAllGuests();
		return new Response(JSON.stringify(guests), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Failed to fetch guests' }), { status: 500 });
	}
};