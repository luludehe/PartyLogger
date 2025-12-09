import type { RequestHandler } from '@sveltejs/kit';
import StudentService from '../../../services/StudentService';
import { hasPermission, PERMISSIONS } from '$lib/server/permissions';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	// Vérifier l'authentification et les permissions
	if (!locals.user || !hasPermission(locals.user, PERMISSIONS.VIEW_STUDENTS)) {
		return json({ error: 'Permission refusée' }, { status: 403 });
	}
	try {
		const students = await StudentService.getAllStudents();
		return new Response(JSON.stringify(students), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Failed to fetch students' }), { status: 500 });
	}
};