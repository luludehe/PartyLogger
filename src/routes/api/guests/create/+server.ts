import type { RequestHandler } from '@sveltejs/kit';
import GuestService from '../../../../services/GuestService';
import StudentService from '../../../../services/StudentService';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		console.log('Received data for guest creation:', data);
		if (!data.lastName || !data.firstName) {
			return new Response(JSON.stringify({ error: 'Nom et prénom sont requis' }), { status: 400 });
		}
		// if (data.guarantorId !== undefined && data.guarantorId !== null) {
		// 	const guarantor = await StudentService.getStudentById(data.guarantorId);
		// 	if (!guarantor) {
		// 		const uniqueid = guarantor?.id;
		// 		return new Response(JSON.stringify({ error: 'Le garant doit être un étudiant valide' }), { status: 400 });
		// 	}
		// }
		const newGuest = await GuestService.createGuest(data.lastName, data.firstName, data.guarantorId);
		return new Response(JSON.stringify(newGuest), { status: 201 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Échec de la création du guest' }), { status: 500 });
	}
};