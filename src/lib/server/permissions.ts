import type { User, Role, Permission } from '@prisma/client';

export type UserWithRole = User & {
	role: Role & {
		permissions: Permission[];
	};
};

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export function hasPermission(user: UserWithRole, permissionName: string): boolean {
	return user.role.permissions.some((p: Permission) => p.name === permissionName);
}

/**
 * Vérifie si un utilisateur a au moins une des permissions données
 */
export function hasAnyPermission(user: UserWithRole, permissionNames: string[]): boolean {
	return permissionNames.some((name) => hasPermission(user, name));
}

/**
 * Vérifie si un utilisateur a toutes les permissions données
 */
export function hasAllPermissions(user: UserWithRole, permissionNames: string[]): boolean {
	return permissionNames.every((name) => hasPermission(user, name));
}

/**
 * Vérifie si un utilisateur a un rôle spécifique
 */
export function hasRole(user: UserWithRole, roleName: string): boolean {
	return user.role.name === roleName;
}

/**
 * Liste des permissions disponibles dans l'application
 */
export const PERMISSIONS = {
	// Gestion des utilisateurs
	MANAGE_USERS: 'manage_users',
	VIEW_USERS: 'view_users',

	// Gestion des étudiants
	MANAGE_STUDENTS: 'manage_students',
	VIEW_STUDENTS: 'view_students',

	// Gestion des invités
	MANAGE_GUESTS: 'manage_guests',
	VIEW_GUESTS: 'view_guests',

	// Gestion des tickets
	MANAGE_TICKETS: 'manage_tickets',
	CREATE_TICKETS: 'create_tickets',
	DELETE_TICKETS: 'delete_tickets',

	// Statistiques
	VIEW_STATS: 'view_stats',
	VIEW_ADVANCED_STATS: 'view_advanced_stats',

	// Logs
	VIEW_LOGS: 'view_logs',
	MANAGE_LOGS: 'manage_logs',

	// Administration
	ADMIN_PANEL: 'admin_panel',
	MANAGE_ROLES: 'manage_roles',
	MANAGE_PERMISSIONS: 'manage_permissions'
} as const;

/**
 * Liste des rôles disponibles
 */
export const ROLES = {
	ADMIN: 'admin',
	MODERATOR: 'moderator',
	USER: 'user'
} as const;
