// src/routes/create-guest-ticket/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import TicketService from '../../services/TicketService';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { guestId } = await request.json();
		const newTicket = await TicketService.createGuestTicket(guestId);
		return new Response(JSON.stringify(newTicket), { status: 201 });
	} catch (error) {
		console.error('Error creating guest ticket:', error);
		return new Response('Could not create guest ticket', { status: 500 });
	}
};