import prisma from '$lib/prisma';

class TicketService {
	async createStudentTicket(studentId: number) {
		try {
			const newTicket = await prisma.ticket.create({
				data: {
					studentId: studentId,
				},
			});
			return newTicket;
		} catch (error) {
			console.error('Error creating student ticket:', error);
			throw new Error('Could not create student ticket');
		}
	}

	async createGuestTicket(guestId: number) {
		try {
			const newTicket = await prisma.ticket.create({
				data: {
					guestId: guestId,
				},
			});
			return newTicket;
		} catch (error) {
			console.error('Error creating guest ticket:', error);
			throw new Error('Could not create guest ticket');
		}
	}

	async createGuest(lastName: string, firstName: string, guarantorId: number | null) {
		try {
			if (guarantorId !== null && lastName !== null && firstName !== null) {
				const guarantor = await prisma.student.findUnique({
					where: { id: guarantorId },
				});
				if (!guarantor) {
					throw new Error('Guarantor must be a valid student');
				}
			}

			const newGuest = await prisma.guest.create({
				data: {
					last_name: lastName,
					first_name: firstName,
					guarantorId: guarantorId,
				},
			});

			await this.createGuestTicket(newGuest.id);

			return newGuest;
		} catch (error) {
			console.error('Error creating guest:', error);
			throw new Error('Could not create guest');
		}
	}
}

export default new TicketService();