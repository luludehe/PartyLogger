import TicketService from '../services/TicketService';
import type { PageServerLoad, Actions } from './$types';
import StudentService from '../services/StudentService';
import GuestService from '../services/GuestService';
import { redirect } from '@sveltejs/kit';
import { hasPermission, PERMISSIONS } from '$lib/server/permissions';

// export const prerender = false;

export const load = (async ({ locals }) => {
	// Vérifier l'authentification
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Vérifier les permissions
	if (!hasPermission(locals.user, PERMISSIONS.VIEW_STUDENTS)) {
		throw redirect(302, '/');
	}

	const studentsList = await StudentService.getAllStudents();
	const guestsList = await GuestService.getAllGuests();
	return { students: studentsList, guests: guestsList };
}) satisfies PageServerLoad;

export const actions: Actions = {
	createStudentTicket: async ({ request, locals }) => {
		if (!locals.user || !hasPermission(locals.user, PERMISSIONS.CREATE_TICKETS)) {
			return { error: 'Permission refusée' };
		}
		const { studentId } = await request.json();
		return TicketService.createStudentTicket(studentId);
	},
	createGuestTicket: async ({ request, locals }) => {
		if (!locals.user || !hasPermission(locals.user, PERMISSIONS.CREATE_TICKETS)) {
			return { error: 'Permission refusée' };
		}
		const { guestId } = await request.json();
		return TicketService.createGuestTicket(guestId);
	},
};