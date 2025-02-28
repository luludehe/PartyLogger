import prisma from '$lib/prisma';
import type { PageServerLoad, Actions } from './$types';
import TicketService from '../services/TicketService';

// export const prerender = false;

export const load = (async () => {
	const studentsList = await prisma.student.findMany({
		select: {
			id: true,
			last_name: true,
			first_name: true,
			studentId: true,
			isMember: true,
			ticket: true,
		},
		orderBy: [
			{
				last_name: 'asc',
			},
		],
	});

	const guestsList = await prisma.guest.findMany({
		select: {
			id: true,
			last_name: true,
			first_name: true,
			guarantor: {
				select: {
					last_name: true,
					first_name: true,
				},
			},
			ticket: true,
		},
		orderBy: [
			{
				last_name: 'asc',
			},
		],
	});

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