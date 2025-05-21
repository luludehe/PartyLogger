import type { RequestHandler } from '@sveltejs/kit';
import TicketService from '../../../../services/TicketService';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { type, id } = await request.json();
		console.log('Received data for creation:', { type, id });

		if (type === 'student' && id) {
			await TicketService.createStudentTicket(id);
		} else if (type === 'guest' && id) {
			await TicketService.createGuestTicket(id);
		} else {
			return new Response(JSON.stringify({ error: 'Invalid data' }), { status: 400 });
		}

		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (error) {
		console.error('Error:', error);
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
};