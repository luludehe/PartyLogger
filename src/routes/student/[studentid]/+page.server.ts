import StudentService from '../../../services/StudentService';

export async function load({ params }) {
	const student = await StudentService.getStudentById(parseInt(params.studentid));
	return { student: student };
}
