import prisma from '$lib/prisma';
import type { Party, PartyStats } from '@prisma/client';

class PartyService {
	/**
	 * Récupère toutes les soirées
	 */
	async getAllParties() {
		try {
			return await prisma.party.findMany({
				include: {
					creator: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							username: true
						}
					},
					stats: true
				},
				orderBy: {
					date: 'desc'
				}
			});
		} catch (error) {
			console.error('Error fetching all parties:', error);
			return [];
		}
	}

	/**
	 * Récupère la soirée active
	 */
	async getActiveParty() {
		try {
			return await prisma.party.findFirst({
				where: {
					isActive: true,
					isClosed: false
				},
				include: {
					creator: true,
					stats: true
				}
			});
		} catch (error) {
			console.error('Error fetching active party:', error);
			return null;
		}
	}

	/**
	 * Récupère une soirée par ID
	 */
	async getPartyById(id: number) {
		return prisma.party.findUnique({
			where: { id },
			include: {
				creator: true,
				stats: true
			}
		});
	}

	/**
	 * Crée une nouvelle soirée
	 */
	async createParty(data: {
		name: string;
		description?: string;
		date: Date;
		startTime?: Date;
		endTime?: Date;
		location?: string;
		createdBy: number;
	}) {
		const party = await prisma.party.create({
			data: {
				...data,
				stats: {
					create: {}
				}
			},
			include: {
				creator: true,
				stats: true
			}
		});

		return party;
	}

	/**
	 * Met à jour une soirée
	 */
	async updateParty(
		id: number,
		data: {
			name?: string;
			description?: string;
			date?: Date;
			startTime?: Date;
			endTime?: Date;
			location?: string;
		}
	) {
		return prisma.party.update({
			where: { id },
			data,
			include: {
				creator: true,
				stats: true
			}
		});
	}

	/**
	 * Active une soirée (désactive les autres)
	 */
	async activateParty(id: number) {
		// Désactiver toutes les autres soirées
		await prisma.party.updateMany({
			where: {
				isActive: true
			},
			data: {
				isActive: false
			}
		});

		// Activer la soirée choisie
		return prisma.party.update({
			where: { id },
			data: {
				isActive: true,
				isClosed: false
			}
		});
	}

	/**
	 * Ferme une soirée
	 */
	async closeParty(id: number) {
		return prisma.party.update({
			where: { id },
			data: {
				isActive: false,
				isClosed: true,
				endTime: new Date()
			}
		});
	}

	/**
	 * Supprime une soirée
	 */
	async deleteParty(id: number) {
		return prisma.party.delete({
			where: { id }
		});
	}

	/**
	 * Met à jour les statistiques d'une soirée
	 */
	async updatePartyStats(partyId: number) {
		// Pour l'instant, des stats basiques
		// À développer avec les vraies données de tickets/logs
		const stats = {
			totalStudents: 0,
			totalGuests: 0,
			totalTickets: 0,
			membersCount: 0,
			nonMembersCount: 0,
			peakAttendance: 0
		};

		return prisma.partyStats.upsert({
			where: { partyId },
			update: stats,
			create: {
				partyId,
				...stats
			}
		});
	}
}

export default new PartyService();
