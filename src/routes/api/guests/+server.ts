import type { RequestHandler } from '@sveltejs/kit';
import GuestService from '../../../services/GuestService';

export const GET: RequestHandler = async () => {
	try {
		const guests = await GuestService.getAllGuests();
		return new Response(JSON.stringify(guests), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Failed to fetch guests' }), { status: 500 });
	}
};