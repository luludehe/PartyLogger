// src/routes/create-guest/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import TicketService from '../../services/TicketService';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { lastName, firstName, guarantorId } = await request.json();
		const newGuest = await TicketService.createGuest(lastName, firstName, guarantorId);
		return new Response(JSON.stringify(newGuest), { status: 201 });
	} catch (error) {
		console.error('Error creating guest:', error);
		return new Response('Could not create guest', { status: 500 });
	}
};