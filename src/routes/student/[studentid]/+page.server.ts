import StudentService from '../../../services/StudentService';
import { redirect } from '@sveltejs/kit';
import { hasPermission, PERMISSIONS } from '$lib/server/permissions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	// Vérifier l'authentification
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Vérifier les permissions
	if (!hasPermission(locals.user, PERMISSIONS.VIEW_STUDENTS)) {
		throw redirect(302, '/');
	}

	const student = await StudentService.getStudentById(parseInt(params.studentid));
	return { student: student };
};
