import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Initialisation des données...');

	// Créer les permissions
	const permissions = [
		{ name: 'manage_users', description: 'Gérer les utilisateurs' },
		{ name: 'view_users', description: 'Voir les utilisateurs' },
		{ name: 'manage_students', description: 'Gérer les étudiants' },
		{ name: 'view_students', description: 'Voir les étudiants' },
		{ name: 'manage_guests', description: 'Gérer les invités' },
		{ name: 'view_guests', description: 'Voir les invités' },
		{ name: 'manage_tickets', description: 'Gérer tous les tickets' },
		{ name: 'create_tickets', description: 'Créer des tickets' },
		{ name: 'delete_tickets', description: 'Supprimer des tickets' },
		{ name: 'view_stats', description: 'Voir les statistiques' },
		{ name: 'view_advanced_stats', description: 'Voir les statistiques avancées' },
		{ name: 'view_logs', description: 'Voir les logs' },
		{ name: 'manage_logs', description: 'Gérer les logs' },
		{ name: 'admin_panel', description: 'Accéder au panneau d\'administration' },
		{ name: 'manage_roles', description: 'Gérer les rôles' },
		{ name: 'manage_permissions', description: 'Gérer les permissions' }
	];

	console.log('📝 Création des permissions...');
	const createdPermissions = await Promise.all(
		permissions.map((permission) =>
			prisma.permission.upsert({
				where: { name: permission.name },
				update: {},
				create: permission
			})
		)
	);

	// Créer les rôles avec leurs permissions
	console.log('👥 Création des rôles...');

	// Rôle Admin (toutes les permissions)
	const adminRole = await prisma.role.upsert({
		where: { name: 'admin' },
		update: {},
		create: {
			name: 'admin',
			description: 'Administrateur avec tous les droits',
			permissions: {
				connect: createdPermissions.map((p) => ({ id: p.id }))
			}
		}
	});

	// Rôle Moderator (permissions limitées)
	const moderatorPermissions = createdPermissions.filter((p) =>
		[
			'view_users',
			'manage_students',
			'view_students',
			'manage_guests',
			'view_guests',
			'create_tickets',
			'delete_tickets',
			'view_stats',
			'view_logs'
		].includes(p.name)
	);

	const moderatorRole = await prisma.role.upsert({
		where: { name: 'moderator' },
		update: {},
		create: {
			name: 'moderator',
			description: 'Modérateur avec permissions limitées',
			permissions: {
				connect: moderatorPermissions.map((p) => ({ id: p.id }))
			}
		}
	});

	// Rôle User (permissions basiques)
	const userPermissions = createdPermissions.filter((p) =>
		['view_students', 'view_guests', 'create_tickets', 'view_stats'].includes(p.name)
	);

	const userRole = await prisma.role.upsert({
		where: { name: 'user' },
		update: {},
		create: {
			name: 'user',
			description: 'Utilisateur avec permissions basiques',
			permissions: {
				connect: userPermissions.map((p) => ({ id: p.id }))
			}
		}
	});

	// Créer un utilisateur admin par défaut
	console.log('🔐 Création de l\'utilisateur admin par défaut...');
	const adminPassword = 'admin123'; // À changer après la première connexion
	const passwordHash = await bcrypt.hash(adminPassword, 10);

	await prisma.user.upsert({
		where: { username: 'admin' },
		update: {},
		create: {
			username: 'admin',
			email: 'admin@partylogger.local',
			passwordHash,
			firstName: 'Admin',
			lastName: 'System',
			roleId: adminRole.id,
			isActive: true
		}
	});

	console.log('✅ Initialisation terminée !');
	console.log('\n📌 Utilisateur admin créé :');
	console.log('   Username: admin');
	console.log('   Password: admin123');
	console.log('   ⚠️  Pensez à changer le mot de passe après la première connexion !');
}

main()
	.catch((e) => {
		console.error('❌ Erreur lors de l\'initialisation :', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
