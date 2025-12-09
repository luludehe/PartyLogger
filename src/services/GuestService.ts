import prisma from '$lib/prisma';
import PartyService from './PartyService';

class GuestService {

	async getAllGuests() {
		try {
			const activeParty = await PartyService.getActiveParty();
			
			if (!activeParty) {
				// No active party - return guests without tickets
				const guests = await prisma.guest.findMany({
					select: {
						id: true,
						last_name: true,
						first_name: true,
						guarantor: {
							select: {
								last_name: true,
								first_name: true,
								studentId: true,
							},
						},
					},
					orderBy: [{ last_name: 'asc' }],
				});
				return guests.map(guest => ({ ...guest, ticket: null }));
			}
			
			// Active party exists - load tickets for that party
			const guests = await prisma.guest.findMany({
				select: {
					id: true,
					last_name: true,
					first_name: true,
					guarantor: {
						select: {
							last_name: true,
							first_name: true,
							studentId: true,
						},
					},
					tickets: {
						where: { partyId: activeParty.id }
					},
				},
				orderBy: [{ last_name: 'asc' }],
			});
			
			// Transform tickets array to single ticket for backward compatibility
			return guests.map((guest) => {
				const { tickets, ...guestData } = guest;
				return {
					...guestData,
					ticket: tickets[0] || null
				};
			});
		} catch (error) {
			console.error('Error in getAllGuests:', error);
			return [];
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

			return await prisma.guest.create({
				data: {
					last_name: lastName,
					first_name: firstName,
					guarantorId: guarantorId,
				},
			});

		} catch (error) {
			console.error('Error creating guest:', error);
			throw new Error('Could not create guest');
		}
	}
}

export default new GuestService()