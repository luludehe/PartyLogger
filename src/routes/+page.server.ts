import TicketService from '../services/TicketService';
import type { PageServerLoad, Actions } from './$types';
import StudentService from '../services/StudentService';
import GuestService from '../services/GuestService';

// export const prerender = false;

export const load = (async () => {
	const studentsList = await StudentService.getAllStudents();
	const guestsList = await GuestService.getAllGuests();
	return { students: studentsList, guests: guestsList };
}) satisfies PageServerLoad;

export const actions: Actions = {
	createStudentTicket: async ({ request }) => {
		const { studentId } = await request.json();
		return TicketService.createStudentTicket(studentId);
	},
	createGuestTicket: async ({ request }) => {
		const { guestId } = await request.json();
		return TicketService.createGuestTicket(guestId);
	},
};