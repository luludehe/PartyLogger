import prisma from '$lib/prisma';
import PartyService from './PartyService';

class StudentService {

	async getAllStudents() {
		try {
			const activeParty = await PartyService.getActiveParty();
			
			if (!activeParty) {
				// No active party - return students without tickets
				const students = await prisma.student.findMany({
					select: {
						id: true,
						last_name: true,
						first_name: true,
						studentId: true,
						speciality: true,
						isMember: true,
					},
					orderBy: [{ last_name: 'asc' }],
				});
				return students.map(student => ({ ...student, ticket: null }));
			}
			
			// Active party exists - load tickets for that party
			const students = await prisma.student.findMany({
				select: {
					id: true,
					last_name: true,
					first_name: true,
					studentId: true,
					speciality: true,
					isMember: true,
					tickets: {
						where: { partyId: activeParty.id }
					},
				},
				orderBy: [{ last_name: 'asc' }],
			});
			
			// Transform tickets array to single ticket for backward compatibility
			return students.map((student) => {
				const { tickets, ...studentData } = student;
				return {
					...studentData,
					ticket: tickets[0] || null
				};
			});
		} catch (error) {
			console.error('Error in getAllStudents:', error);
			return [];
		}
	}

	async getStudentById(studentId: number) {
		try {
			const activeParty = await PartyService.getActiveParty();
			
			if (!activeParty) {
				// No active party - return student without ticket
				const student = await prisma.student.findUnique({
					select: {
						id: true,
						last_name: true,
						first_name: true,
						studentId: true,
						speciality: true,
						isMember: true,
					},
					where: { studentId },
				});
				if (!student) return null;
				return { ...student, ticket: null };
			}
			
			// Active party exists - load tickets for that party
			const student = await prisma.student.findUnique({
				select: {
					id: true,
					last_name: true,
					first_name: true,
					studentId: true,
					speciality: true,
					isMember: true,
					tickets: {
						where: { partyId: activeParty.id }
					},
				},
				where: { studentId },
			});
			
			if (!student) return null;
			
			const { tickets, ...studentData } = student;
			return {
				...studentData,
				ticket: tickets[0] || null
			};
		} catch (error) {
			console.error('Error in getStudentById:', error);
			return null;
		}
	}
}
export default new StudentService();