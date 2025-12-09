import prisma from '$lib/prisma';
import PartyService from './PartyService';

class StatService {
	async getStudentsWithTickets() {
		try {
			const activeParty = await PartyService.getActiveParty();
			if (!activeParty) {
				return 0;
			}

			return await prisma.student.count({
				where: {
					tickets: {
						some: {
							partyId: activeParty.id
						}
					}
				}
			});
		} catch (error) {
			console.error('Error fetching students count:', error);
			return 0;
		}
	}

	async getStudentsCount() {
		try {
			return await prisma.student.count();
		} catch (error) {
			console.error('Error fetching students count:', error);
			return 0;
		}
	}
	async getGuestsWithTickets() {
		try {
			const activeParty = await PartyService.getActiveParty();
			if (!activeParty) {
				return 0;
			}

			return await prisma.guest.count({
				where: {
					tickets: {
						some: {
							partyId: activeParty.id
						}
					}
				}
			});
		} catch (error) {
			console.error('Error fetching guests count:', error);
			return 0;
		}
	}

	async getGuestsCount() {
		try {
			const guestsCount = await prisma.guest.count();
			return guestsCount;
		} catch (error) {
			console.error('Error fetching guests count:', error);
			return 0;
		}
	}

	async getTicketsByHour() {
		try {
			const activeParty = await PartyService.getActiveParty();
			if (!activeParty) {
				return {};
			}

			const tickets = await prisma.ticket.findMany({
				where: {
					partyId: activeParty.id
				},
				select: { createdAt: true }
			});

			const hours: Record<number, number> = {};
			tickets.forEach(({ createdAt }) => {
				const hour = new Date(createdAt).getHours();
				hours[hour] = (hours[hour] || 0) + 1;
			});

			return hours;
		} catch (error) {
			console.error('Erreur lors du groupement par heure:', error);
			return {};
		}
	}
}
export default new StatService();