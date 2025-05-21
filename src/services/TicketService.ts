import prisma from '$lib/prisma';
import { error } from '@sveltejs/kit';

class TicketService {

	async getAllTickets() {
		try {
			const tickets = await prisma.ticket.findMany({
				select: {
					id: true,
					student: {
						select: {
							id: true,
							last_name: true,
							first_name: true,
							studentId: true,
							isMember: true,
						},
					},
					guest: {
						select: {
							id: true,
							last_name: true,
							first_name: true,
							guarantor : {
								select: {
									id: true,
									last_name: true,
									first_name: true,
									studentId: true,
									isMember: true,
								},
							}
						},
					},
					createdAt: true,
					entryAt: true,
					exitAt: true,
				},
				orderBy: [
					{
						entryAt: 'desc',
					},
				],
			});
			return tickets;
		} catch (error) {
			console.error('Error fetching tickets:', error);
			throw new Error('Could not fetch tickets');
		}
	}

	async createStudentTicket(studentId: number) {
		try {
			// Vérifiez si l'étudiant existe
			const student = await prisma.student.findUnique({
				where: { id: studentId },
			});

			if (!student) {
				throw new Error(`Student with ID ${studentId} does not exist`);
			}

			// Créez le ticket si l'étudiant existe
			const newTicket = await prisma.ticket.create({
				data: {
					studentId: studentId,
				},
			});

			// Créez un log pour l'entrée
			await prisma.log.create({
				data: {
					studentId: studentId,
					action: 'entry',
				},
			});

			return newTicket;
		} catch (error) {
			console.error('Error creating student ticket:', error);
			throw new Error('Could not create student ticket');
		}
	}

	async updateExitStudentTicket(studentId: number) {
		try {
			const ticket = await prisma.ticket.findUnique({
				where: { studentId: studentId },
			});

			if (!ticket) {
				throw new Error(`Ticket for student with ID ${studentId} does not exist`);
			}

			const updatedTicket = await prisma.ticket.update({
				where: { id: ticket.id },
				data: {
					exitAt: new Date(),
				},
			});

			await prisma.log.create({
				data: {
					studentId: studentId,
					action: 'exit',
				},
			});

			return updatedTicket;
		} catch (error) {
			console.error('Error updating exit time for student ticket:', error);
			throw new Error('Could not update exit time for student ticket');
		}
	}

	async deleteStudentTicket(studentId: number) {
		try {
			const ticket = await prisma.ticket.findUnique({
				where: { studentId: studentId },
			});

			if (!ticket) {
				throw new Error(`Ticket for student with ID ${studentId} does not exist`);
			}

			await prisma.ticket.delete({
				where: { id: ticket.id },
			});
			await prisma.log.create({
				data: {
					studentId: studentId,
					action: 'delete_ticket',
				},
			});

			return { message: 'Ticket deleted successfully' };
		} catch (error) {
			console.error('Error deleting student ticket:', error);
			throw new Error('Could not delete student ticket');
		}
	}

	async createGuestTicket(guestId: number) {
		try {
			// Vérifiez si l'étudiant existe
			const guest = await prisma.guest.findUnique({
				where: { id: guestId },
			});

			if (!guest) {
				throw new Error(`Student with ID ${guestId} does not exist`);
			}
			const newTicket = await prisma.ticket.create({
				data: {
					guestId: guestId,
				},
			});
			await prisma.log.create({
				data: {
					guestId: guestId,
					action: 'entry',
				},
			});
			return newTicket;
		} catch (error) {
			console.error('Error creating guest ticket:', error);
			throw new Error('Could not create guest ticket');
		}
	}

	async deleteGuestTicket(guestId: number) {
		try {
			const ticket = await prisma.ticket.findUnique({
				where: { guestId: guestId },
			});

			if (!ticket) {
				throw new Error(`Ticket for guest with ID ${guestId} does not exist`);
			}

			await prisma.ticket.delete({
				where: { id: ticket.id },
			});
			await prisma.log.create({
				data: {
					guestId: guestId,
					action: 'delete_ticket',
				},
			});

			return { message: 'Ticket deleted successfully' };
		} catch (error) {
			console.error('Error deleting guest ticket:', error);
			throw new Error('Could not delete guest ticket');
		}
	}

	async updateExitGuestTicket(guestId: number) {
		try {
			const ticket = await prisma.ticket.findUnique({
				where: { guestId: guestId },
			});

			if (!ticket) {
				throw new Error(`Ticket for guest with ID ${guestId} does not exist`);
			}

			const updatedTicket = await prisma.ticket.update({
				where: { id: ticket.id },
				data: {
					exitAt: new Date(),
				},
			});

			await prisma.log.create({
				data: {
					guestId: guestId,
					action: 'exit',
				},
			});

			return updatedTicket;
		} catch (error) {
			console.error('Error updating exit time for guest ticket:', error);
			throw new Error('Could not update exit time for guest ticket');
		}
	}
}

export default new TicketService();