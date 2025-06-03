import prisma from '$lib/prisma';
import { error } from '@sveltejs/kit';

class TicketService {

	async getAllTickets() {
		// inchangé
	}

	async createStudentTicket(id: number) {
		try {
			const student = await prisma.student.findUnique({
				where: { id },
			});

			if (!student) {
				throw new Error(`Student with ID ${id} does not exist`);
			}

			const newTicket = await prisma.ticket.create({
				data: {
					studentId: student.id,
				},
			});

			await prisma.log.create({
				data: {
					studentId: student.id,
					action: 'entry',
				},
			});

			return newTicket;
		} catch (error) {
			console.error('Error creating student ticket:', error);
			throw new Error('Could not create student ticket');
		}
	}

	async updateExitStudentTicket(id: number) {
		try {
			const ticket = await prisma.ticket.findUnique({
				where: { studentId: id },
				include: { student: true }
			});

			if (!ticket || !ticket.student) {
				throw new Error(`Ticket for student with ticket ID ${id} does not exist`);
			}

			const updatedTicket = await prisma.ticket.update({
				where: { id: ticket.id },
				data: {
					exitAt: new Date(),
				},
			});

			await prisma.log.create({
				data: {
					studentId: ticket.student.id,
					action: 'exit',
				},
			});

			return updatedTicket;
		} catch (error) {
			console.error('Error updating exit time for student ticket:', error);
			throw new Error('Could not update exit time for student ticket');
		}
	}

	async deleteStudentTicket(id: number) {
		try {
			const ticket = await prisma.ticket.findUnique({
				where: { studentId: id },
				include: { student: true }
			});

			if (!ticket || !ticket.student) {
				throw new Error(`Ticket with ID ${id} does not exist`);
			}

			await prisma.ticket.delete({
				where: { id: ticket.id },
			});
			await prisma.log.create({
				data: {
					studentId: ticket.student.id,
					action: 'delete_ticket',
				},
			});

			return { message: 'Ticket deleted successfully' };
		} catch (error) {
			console.error('Error deleting student ticket:', error);
			throw new Error('Could not delete student ticket');
		}
	}

	async createGuestTicket(id: number) {
		try {
			const guest = await prisma.guest.findUnique({
				where: { id: id },
			});

			if (!guest) {
				throw new Error(`Guest with ID ${id} does not exist`);
			}
			const newTicket = await prisma.ticket.create({
				data: {
					guestId: id,
				},
			});
			await prisma.log.create({
				data: {
					guestId: id,
					action: 'entry',
				},
			});
			return newTicket;
		} catch (error) {
			console.error('Error creating guest ticket:', error);
			throw new Error('Could not create guest ticket');
		}
	}

	async deleteGuestTicket(id: number) {
		try {
			const ticket = await prisma.ticket.findUnique({
				where: { id },
				include: { guest: true }
			});

			if (!ticket || !ticket.guest) {
				throw new Error(`Ticket with ID ${id} does not exist`);
			}

			await prisma.ticket.delete({
				where: { id: ticket.id },
			});
			await prisma.log.create({
				data: {
					guestId: ticket.guest.id,
					action: 'delete_ticket',
				},
			});

			return { message: 'Ticket deleted successfully' };
		} catch (error) {
			console.error('Error deleting guest ticket:', error);
			throw new Error('Could not delete guest ticket');
		}
	}

	async updateExitGuestTicket(id: number) {
		try {
			const ticket = await prisma.ticket.findUnique({
				where: { id },
				include: { guest: true }
			});

			if (!ticket || !ticket.guest) {
				throw new Error(`Ticket with ID ${id} does not exist`);
			}

			const updatedTicket = await prisma.ticket.update({
				where: { id: ticket.id },
				data: {
					exitAt: new Date(),
				},
			});

			await prisma.log.create({
				data: {
					guestId: ticket.guest.id,
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