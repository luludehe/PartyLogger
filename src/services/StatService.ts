import prisma from '$lib/prisma';

class StatService {
	async getStudentsWithTickets() {
		try {
			return await prisma.student.findMany({
				where: {
					ticket: {
						isNot: null
					}
				},
				include: {
					ticket: true
				}
			});
		} catch (error) {
			console.error('Error fetching students count:', error);
			throw new Error('Could not fetch students count');
		}
	}

	async getStudentsCount() {
		try {
			return await prisma.student.count();
		} catch (error) {
			console.error('Error fetching students count:', error);
			throw new Error('Could not fetch students count');
		}
	}
	async getGuestsWithTickets() {
		try {
			return await prisma.guest.findMany({
				where: {
					ticket: {
						isNot: null
					}
				},
				include: {
					ticket: true
				}
			});
		} catch (error) {
			console.error('Error fetching guests count:', error);
			throw new Error('Could not fetch guests count');
		}
	}

	async getGuestsCount() {
		try {
			const guestsCount = await prisma.guest.count();
			return guestsCount;
		} catch (error) {
			console.error('Error fetching guests count:', error);
			throw new Error('Could not fetch guests count');
		}
	}

	async getTicketsByHour() {
		try {
			const tickets = await prisma.ticket.findMany({
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
			throw new Error('Erreur lors du groupement par heure');
		}
	}
}
export default new StatService();