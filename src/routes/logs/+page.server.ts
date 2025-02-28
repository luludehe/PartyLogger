import prisma from '$lib/prisma';
import type { PageServerLoad } from './$types';
import TicketService from '../../services/TicketService';

export const load = (async () => {

	const ticketList = await prisma.ticket.findMany({
		select: {
			timestamp: true,
			owner: {
				select :{
					last_name: true,
					first_name: true,
					isMember: true,
				}
			},
			guest: {
				select: {
					last_name: true,
					first_name: true,
					guarantor: {
						select: {
							last_name: true,
							first_name: true,
						}
					}
				}
			}
		},
		orderBy: [
			{
				timestamp: 'desc',
			},
		],
	})

	return { tickets: ticketList };

}) satisfies PageServerLoad;