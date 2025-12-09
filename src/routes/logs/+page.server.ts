import LogService from '../../services/LogService';
import PartyService from '../../services/PartyService';
import { redirect } from '@sveltejs/kit';
import { hasPermission, PERMISSIONS } from '$lib/server/permissions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Vérifier l'authentification
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Vérifier les permissions
	if (!hasPermission(locals.user, PERMISSIONS.VIEW_LOGS)) {
		throw redirect(302, '/');
	}

	try {
		const activeParty = await PartyService.getActiveParty();
		const logs = await LogService.getAllLogs();
		return { logs, activeParty };
	} catch (error) {
		console.error('Error loading logs:', error);
		// Return empty logs instead of crashing
		return { logs: [], activeParty: null };
	}
};