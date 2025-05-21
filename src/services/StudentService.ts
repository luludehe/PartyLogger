import prisma from '$lib/prisma';

class StudentService {

	async getAllStudents() {
		return prisma.student.findMany({
			select: {
				id: true,
				last_name: true,
				first_name: true,
				studentId: true,
				isMember: true,
				ticket: true,
			},
			orderBy: [
				{
					last_name: 'asc',
				},
			],
		});
	}

	async getStudentById(studentId: number) {
		return prisma.student.findUnique({
			select: {
				id: true,
				last_name: true,
				first_name: true,
				studentId: true,
				isMember: true,
				ticket: true,
			},
			where: {
				studentId: studentId,
			},
		});
	}
}
export default new StudentService();