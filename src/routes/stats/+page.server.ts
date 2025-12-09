import StatService from '../../services/StatService';
import { redirect } from '@sveltejs/kit';
import { hasPermission, PERMISSIONS } from '$lib/server/permissions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Vérifier l'authentification
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Vérifier les permissions
	if (!hasPermission(locals.user, PERMISSIONS.VIEW_STATS)) {
		throw redirect(302, '/');
	}

	try {
		const ticketsByHour = await StatService.getTicketsByHour();
		const studentsTickets = await StatService.getStudentsWithTickets();
		const studentsCount = await StatService.getStudentsCount();
		const guestsTickets = await StatService.getGuestsWithTickets();
		const guestsCount = await StatService.getGuestsCount();
		return { ticketsByHour, studentsTickets, studentsCount, guestsTickets, guestsCount };
	} catch (error) {
		console.error('Error loading stats:', error);
		// Return empty stats instead of crashing
		return { ticketsByHour: [], studentsTickets: 0, studentsCount: 0, guestsTickets: 0, guestsCount: 0 };
	}
};