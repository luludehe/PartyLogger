import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import prisma from '$lib/prisma';
import { hasPermission, PERMISSIONS } from '$lib/server/permissions';
import { createUser, hashPassword, invalidateUserSessions } from '$lib/server/auth';
import PartyService from '../../../services/PartyService';

export const load: PageServerLoad = async ({ locals }) => {
	// Vérifier l'authentification
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Vérifier les permissions
	if (!hasPermission(locals.user, PERMISSIONS.ADMIN_PANEL)) {
		throw redirect(302, '/');
	}

	// Charger les utilisateurs avec leurs rôles
	const users = await prisma.user.findMany({
		include: {
			role: {
				include: {
					permissions: true
				}
			}
		},
		orderBy: { createdAt: 'desc' }
	});

	// Charger les rôles disponibles
	const roles = await prisma.role.findMany({
		include: {
			permissions: true
		},
		orderBy: { name: 'asc' }
	});

	// Charger toutes les permissions
	const permissions = await prisma.permission.findMany({
		orderBy: { name: 'asc' }
	});

	// Charger toutes les soirées
	const parties = await PartyService.getAllParties();

	// Charger la soirée active
	const activeParty = await PartyService.getActiveParty();

	return {
		users,
		roles,
		permissions,
		parties,
		activeParty,
		currentUser: locals.user
	};
};

export const actions: Actions = {
	createUser: async ({ request, locals }) => {
		if (!locals.user || !hasPermission(locals.user, PERMISSIONS.MANAGE_USERS)) {
			return fail(403, { error: 'Permission refusée' });
		}

		const data = await request.formData();
		const username = data.get('username')?.toString();
		const email = data.get('email')?.toString();
		const password = data.get('password')?.toString();
		const firstName = data.get('firstName')?.toString();
		const lastName = data.get('lastName')?.toString();
		const roleId = parseInt(data.get('roleId')?.toString() || '0');

		if (!username || !email || !password || !firstName || !lastName || !roleId) {
			return fail(400, { error: 'Tous les champs sont requis' });
		}

		const existing = await prisma.user.findFirst({
			where: {
				OR: [{ username }, { email }]
			}
		});

		if (existing) {
			return fail(400, { error: "Nom d'utilisateur ou email déjà utilisé" });
		}

		try {
			await createUser({
				username,
				email,
				password,
				firstName,
				lastName,
				roleId
			});

			return { success: true, message: 'Utilisateur créé avec succès' };
		} catch (error) {
			console.error('Error creating user:', error);
			return fail(500, { error: "Erreur lors de la création de l'utilisateur" });
		}
	},

	updateUser: async ({ request, locals }) => {
		if (!locals.user || !hasPermission(locals.user, PERMISSIONS.MANAGE_USERS)) {
			return fail(403, { error: 'Permission refusée' });
		}

		const data = await request.formData();
		const userId = parseInt(data.get('userId')?.toString() || '0');
		const firstName = data.get('firstName')?.toString();
		const lastName = data.get('lastName')?.toString();
		const roleId = parseInt(data.get('roleId')?.toString() || '0');
		const isActive = data.get('isActive') === 'true';

		if (!userId || !firstName || !lastName || !roleId) {
			return fail(400, { error: 'Tous les champs sont requis' });
		}

		try {
			await prisma.user.update({
				where: { id: userId },
				data: {
					firstName,
					lastName,
					roleId,
					isActive
				}
			});

			return { success: true, message: 'Utilisateur mis à jour avec succès' };
		} catch (error) {
			console.error('Error updating user:', error);
			return fail(500, { error: "Erreur lors de la mise à jour de l'utilisateur" });
		}
	},

	resetPassword: async ({ request, locals }) => {
		if (!locals.user || !hasPermission(locals.user, PERMISSIONS.MANAGE_USERS)) {
			return fail(403, { error: 'Permission refusée' });
		}

		const data = await request.formData();
		const userId = parseInt(data.get('userId')?.toString() || '0');
		const newPassword = data.get('newPassword')?.toString();

		if (!userId || !newPassword) {
			return fail(400, { error: 'ID utilisateur et nouveau mot de passe requis' });
		}

		try {
			const passwordHash = await hashPassword(newPassword);
			await prisma.user.update({
				where: { id: userId },
				data: { passwordHash }
			});

			await invalidateUserSessions(userId);

			return { success: true, message: 'Mot de passe réinitialisé avec succès' };
		} catch (error) {
			console.error('Error resetting password:', error);
			return fail(500, { error: 'Erreur lors de la réinitialisation du mot de passe' });
		}
	},

	deleteUser: async ({ request, locals }) => {
		if (!locals.user || !hasPermission(locals.user, PERMISSIONS.MANAGE_USERS)) {
			return fail(403, { error: 'Permission refusée' });
		}

		const data = await request.formData();
		const userId = parseInt(data.get('userId')?.toString() || '0');

		if (!userId) {
			return fail(400, { error: 'ID utilisateur requis' });
		}

		if (userId === locals.user.id) {
			return fail(400, { error: 'Vous ne pouvez pas supprimer votre propre compte' });
		}

		try {
			await prisma.user.delete({
				where: { id: userId }
			});

			return { success: true, message: 'Utilisateur supprimé avec succès' };
		} catch (error) {
			console.error('Error deleting user:', error);
			return fail(500, { error: "Erreur lors de la suppression de l'utilisateur" });
		}
	},

	createParty: async ({ request, locals }) => {
		if (!locals.user || !hasPermission(locals.user, PERMISSIONS.ADMIN_PANEL)) {
			return fail(403, { error: 'Permission refusée' });
		}

		const data = await request.formData();
		const name = data.get('name')?.toString();
		const description = data.get('description')?.toString();
		const date = data.get('date')?.toString();
		const location = data.get('location')?.toString();

		if (!name || !date) {
			return fail(400, { error: 'Nom et date requis' });
		}

		try {
			await PartyService.createParty({
				name,
				description,
				date: new Date(date),
				location,
				createdBy: locals.user.id
			});

			return { success: true, message: 'Soirée créée avec succès' };
		} catch (error) {
			console.error('Error creating party:', error);
			return fail(500, { error: 'Erreur lors de la création de la soirée' });
		}
	},

	activateParty: async ({ request, locals }) => {
		if (!locals.user || !hasPermission(locals.user, PERMISSIONS.ADMIN_PANEL)) {
			return fail(403, { error: 'Permission refusée' });
		}

		const data = await request.formData();
		const partyId = parseInt(data.get('partyId')?.toString() || '0');

		if (!partyId) {
			return fail(400, { error: 'ID soirée requis' });
		}

		try {
			await PartyService.activateParty(partyId);
			return { success: true, message: 'Soirée activée avec succès' };
		} catch (error) {
			console.error('Error activating party:', error);
			return fail(500, { error: "Erreur lors de l'activation de la soirée" });
		}
	},

	closeParty: async ({ request, locals }) => {
		if (!locals.user || !hasPermission(locals.user, PERMISSIONS.ADMIN_PANEL)) {
			return fail(403, { error: 'Permission refusée' });
		}

		const data = await request.formData();
		const partyId = parseInt(data.get('partyId')?.toString() || '0');

		if (!partyId) {
			return fail(400, { error: 'ID soirée requis' });
		}

		try {
			await PartyService.closeParty(partyId);
			return { success: true, message: 'Soirée fermée avec succès' };
		} catch (error) {
			console.error('Error closing party:', error);
			return fail(500, { error: 'Erreur lors de la fermeture de la soirée' });
		}
	},

	deleteParty: async ({ request, locals }) => {
		if (!locals.user || !hasPermission(locals.user, PERMISSIONS.ADMIN_PANEL)) {
			return fail(403, { error: 'Permission refusée' });
		}

		const data = await request.formData();
		const partyId = parseInt(data.get('partyId')?.toString() || '0');

		if (!partyId) {
			return fail(400, { error: 'ID soirée requis' });
		}

		try {
			await PartyService.deleteParty(partyId);
			return { success: true, message: 'Soirée supprimée avec succès' };
		} catch (error) {
			console.error('Error deleting party:', error);
			return fail(500, { error: 'Erreur lors de la suppression de la soirée' });
		}
	}
};
