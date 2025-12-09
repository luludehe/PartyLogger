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

	const ticketsByHour = await StatService.getTicketsByHour();
	const studentsTickets = await StatService.getStudentsWithTickets();
	const studentsCount = await StatService.getStudentsCount();
	const guestsTickets = await StatService.getGuestsWithTickets();
	const guestsCount = await StatService.getGuestsCount();
	return { ticketsByHour, studentsTickets, studentsCount, guestsTickets, guestsCount };
};