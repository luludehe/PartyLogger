import type { RequestHandler } from '@sveltejs/kit';
import StudentService from '../../../services/StudentService';

export const GET: RequestHandler = async () => {
	try {
		const students = await StudentService.getAllStudents();
		return new Response(JSON.stringify(students), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Failed to fetch students' }), { status: 500 });
	}
};