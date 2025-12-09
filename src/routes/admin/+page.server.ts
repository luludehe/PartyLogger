import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import prisma from '$lib/prisma';
import { hasPermission, PERMISSIONS } from '$lib/server/permissions';
import { createUser, hashPassword, invalidateUserSessions } from '$lib/server/auth';

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

	return {
		users,
		roles,
		permissions,
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

		// Vérifier si l'utilisateur existe déjà
		const existing = await prisma.user.findFirst({
			where: {
				OR: [{ username }, { email }]
			}
		});

		if (existing) {
			return fail(400, { error: 'Nom d\'utilisateur ou email déjà utilisé' });
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
			return fail(500, { error: 'Erreur lors de la création de l\'utilisateur' });
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
			return fail(500, { error: 'Erreur lors de la mise à jour de l\'utilisateur' });
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

			// Invalider toutes les sessions de l'utilisateur
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

		// Ne pas permettre de supprimer son propre compte
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
			return fail(500, { error: 'Erreur lors de la suppression de l\'utilisateur' });
		}
	}
};
