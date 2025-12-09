import { redirect } from '@sveltejs/kit';
import { hasPermission, PERMISSIONS } from '$lib/server/permissions';
import type { PageServerLoad } from './$types';
import PartyService from '../../../../services/PartyService';
import prisma from '$lib/prisma';

export const load: PageServerLoad = async ({ params, locals }) => {
	// Vérifier l'authentification
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Vérifier les permissions
	if (!hasPermission(locals.user, PERMISSIONS.ADMIN_PANEL)) {
		throw redirect(302, '/');
	}

	try {
		const partyId = parseInt(params.partyid);
		
		// Récupérer les informations de la soirée
		const party = await PartyService.getPartyById(partyId);
		
		if (!party) {
			throw redirect(302, '/admin/dashboard');
		}

		// Récupérer les tickets de cette soirée avec les informations des étudiants/invités
		const tickets = await prisma.ticket.findMany({
			where: { partyId },
			include: {
				student: {
					select: {
						id: true,
						studentId: true,
						first_name: true,
						last_name: true,
						speciality: true,
						isMember: true
					}
				},
				guest: {
					select: {
						id: true,
						first_name: true,
						last_name: true,
						guarantor: {
							select: {
								studentId: true,
								first_name: true,
								last_name: true
							}
						}
					}
				}
			},
			orderBy: { createdAt: 'asc' }
		});

		// Récupérer les logs de cette soirée
		const logs = await prisma.log.findMany({
			where: { partyId },
			include: {
				student: {
					select: {
						studentId: true,
						first_name: true,
						last_name: true
					}
				},
				guest: {
					select: {
						id: true,
						first_name: true,
						last_name: true
					}
				}
			},
			orderBy: { timestamp: 'desc' }
		});

		// Calculer les statistiques
		const studentTickets = tickets.filter(t => t.studentId !== null);
		const guestTickets = tickets.filter(t => t.guestId !== null);
		const studentsStillPresent = studentTickets.filter(t => t.entryAt.getTime() === t.exitAt.getTime()).length;
		const guestsStillPresent = guestTickets.filter(t => t.entryAt.getTime() === t.exitAt.getTime()).length;

		// Grouper les tickets par heure d'entrée
		const ticketsByHour: Record<number, number> = {};
		tickets.forEach(ticket => {
			const hour = ticket.createdAt.getHours();
			ticketsByHour[hour] = (ticketsByHour[hour] || 0) + 1;
		});

		return {
			party,
			tickets,
			logs,
			stats: {
				totalTickets: tickets.length,
				studentTickets: studentTickets.length,
				guestTickets: guestTickets.length,
				studentsStillPresent,
				guestsStillPresent,
				ticketsByHour
			}
		};
	} catch (error) {
		console.error('Error loading party details:', error);
		throw redirect(302, '/admin/dashboard');
	}
};
