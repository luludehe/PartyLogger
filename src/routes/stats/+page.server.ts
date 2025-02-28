import prisma from '$lib/prisma';
import type { PageServerLoad } from './$types';
import TicketService from '../../services/TicketService';

export const load = (async () => {

	const members = await prisma.student.count({
		where: {
			isMember: true,
			ticket: {
				isNot: null
			}
		}
	})
	const notMembers = await prisma.student.count({
		where: {
			isMember: false,
			ticket: {
				isNot: null
			}
		}
	})
	const guests = await prisma.student.count({
		where: {
			ticket: {
				isNot: null
			}
		}
	})

	const total = members + notMembers + guests;

	return { members: members, notMembers: notMembers, guests: guests, total: total };

}) satisfies PageServerLoad;