import type { RequestHandler } from '@sveltejs/kit';
import LogService from '../../../services/LogService';
import { hasPermission, PERMISSIONS } from '$lib/server/permissions';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	// Vérifier l'authentification et les permissions
	if (!locals.user || !hasPermission(locals.user, PERMISSIONS.VIEW_LOGS)) {
		return json({ error: 'Permission refusée' }, { status: 403 });
	}
	try {
		const logs = await LogService.getAllLogs();
		return new Response(JSON.stringify(logs), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Failed to fetch logs' }), { status: 500 });
	}
};