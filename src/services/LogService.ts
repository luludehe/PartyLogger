import prisma from '$lib/prisma';

class LogService {

	async getAllLogs() {
		try {
			const logs = await prisma.log.findMany({
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
							guarantor: {
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
					action: true,
					timestamp: true,
				},
				orderBy: [
					{
						timestamp: 'desc',
					},
				],
			});

			const logMessages = logs.map(log => {
				let message = '';
				let name: string = '';
				if (log.student) {
					name = `${log.student.first_name} ${log.student.last_name.toUpperCase()}`;
					// message = `${log.student.first_name} ${log.student.last_name.toUpperCase()} ${log.action === 'entry' ? 'est entré(e) à' : 'a quitté(e)'} la soirée`;
				} else if (log.guest) {
					name = `${log.guest.first_name} ${log.guest.last_name.toUpperCase()}`;
					// message = `${log.guest.first_name} ${log.guest.last_name.toUpperCase()} ${log.action === 'entry' ? 'est entré(e) à' : 'a quitté(e)'} la soirée`;
				}
				switch (log.action) {
					case 'entry':
						message = `${name} est entré(e) à ${log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
						break;
					case 'exit':
						message = `${name} a quitté(e) la soirée à ${log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
						break;
					case 'delete_ticket':
						message = `Le ticket de ${name} a été supprimé à ${log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
						break;
					default:
						message = `${name} a effectué une action inconnue`;
				}
				return {
					type: log.action,
					message: message,
					timestamp: log.timestamp,
				};
			});

			return logMessages;
		} catch (error) {
			console.error('Error fetching logs:', error);
			throw new Error('Could not fetch logs');
		}
	}
	
	async logEntry(ticketId: number) {
		try {
			const ticket = await prisma.ticket.update({
				where: { id: ticketId },
				data: { entryAt: new Date() },
			});
			if (ticket.studentId) {
				await prisma.log.create({
					data: {
						studentId: ticket.studentId,
						action: 'entry',
					},
				});
			} else if (ticket.guestId) {
				await prisma.log.create({
					data: {
						guestId: ticket.guestId,
						action: 'entry',
					},
				});
			}
			return ticket;
		} catch (error) {
			console.error('Error logging entry:', error);
			throw new Error('Could not log entry');
		}
	}

	async logExit(ticketId: number) {
		try {
			const ticket = await prisma.ticket.update({
				where: { id: ticketId },
				data: { exitAt: new Date() },
			});
			if (ticket.studentId) {
				await prisma.log.create({
					data: {
						studentId: ticket.studentId,
						action: 'exit',
					},
				});
			} else if (ticket.guestId) {
				await prisma.log.create({
					data: {
						guestId: ticket.guestId,
						action: 'exit',
					},
				});
			}
			return ticket;
		} catch (error) {
			console.error('Error logging exit:', error);
			throw new Error('Could not log exit');
		}
	}
}

export default new LogService();