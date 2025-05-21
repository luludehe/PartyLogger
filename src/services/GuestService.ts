import prisma from '$lib/prisma';

class GuestService {

	async getAllGuests() {
		return prisma.guest.findMany({
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
				ticket: true,
			},
			orderBy: [
				{
					last_name: 'asc',
				},
			],
		});
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