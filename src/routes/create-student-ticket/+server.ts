// src/routes/create-student-ticket/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import TicketService from '../../services/TicketService';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { studentId } = await request.json();
		const newTicket = await TicketService.createStudentTicket(studentId);
		return new Response(JSON.stringify(newTicket), { status: 201 });
	} catch (error) {
		console.error('Error creating student ticket:', error);
		return new Response('Could not create student ticket', { status: 500 });
	}
};