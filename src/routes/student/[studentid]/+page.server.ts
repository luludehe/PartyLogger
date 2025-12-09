import StudentService from '../../../services/StudentService';
import { redirect } from '@sveltejs/kit';
import { hasPermission, PERMISSIONS } from '$lib/server/permissions';
import type { PageServerLoad } from './$types';
import prisma from '$lib/prisma';

export const load: PageServerLoad = async ({ params, locals }) => {
	// Vérifier l'authentification
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Vérifier les permissions
	if (!hasPermission(locals.user, PERMISSIONS.VIEW_STUDENTS)) {
		throw redirect(302, '/');
	}

	try {
		const studentId = parseInt(params.studentid);
		
		// Récupérer l'étudiant par son studentId
		const student = await prisma.student.findUnique({
			where: { studentId },
			include: {
				tickets: {
					include: {
						party: {
							select: {
								id: true,
								name: true,
								date: true,
								location: true
							}
						}
					},
					orderBy: { createdAt: 'desc' }
				},
				Log: {
					include: {
						party: {
							select: {
								id: true,
								name: true,
								date: true
							}
						}
					},
					orderBy: { timestamp: 'desc' }
				},
				guests: {
					select: {
						id: true,
						first_name: true,
						last_name: true
					}
				}
			}
		});

		if (!student) {
			throw redirect(302, '/');
		}

		// Calculer les statistiques
		const totalParties = new Set(student.tickets.map(t => t.partyId)).size;
		const totalTickets = student.tickets.length;
		const completedVisits = student.tickets.filter(t => t.entryAt.getTime() !== t.exitAt.getTime()).length;
		const totalGuests = student.guests.length;

		return {
			student,
			stats: {
				totalParties,
				totalTickets,
				completedVisits,
				currentlyPresent: student.tickets.some(t => t.entryAt.getTime() === t.exitAt.getTime()),
				totalGuests
			}
		};
	} catch (error) {
		console.error('Error loading student:', error);
		throw redirect(302, '/');
	}
};
