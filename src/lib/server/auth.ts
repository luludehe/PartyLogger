import prisma from '$lib/prisma';
import bcrypt from 'bcrypt';
import { randomBytes as cryptoRandomBytes } from 'crypto';

const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 jours

/**
 * Génère un token de session sécurisé
 */
export function generateSessionToken(): string {
	const bytes = cryptoRandomBytes(20);
	return bytes.toString('base64url');
}

/**
 * Crée une nouvelle session pour un utilisateur
 */
export async function createSession(userId: number): Promise<{ id: string; expiresAt: Date }> {
	const sessionId = generateSessionToken();
	const expiresAt = new Date(Date.now() + SESSION_DURATION);

	await prisma.session.create({
		data: {
			id: sessionId,
			userId,
			expiresAt
		}
	});

	return { id: sessionId, expiresAt };
}

/**
 * Valide une session et retourne l'utilisateur avec son rôle et permissions
 */
export async function validateSession(sessionId: string) {
	const session = await prisma.session.findUnique({
		where: { id: sessionId },
		include: {
			user: {
				include: {
					role: {
						include: {
							permissions: true
						}
					}
				}
			}
		}
	});

	if (!session) {
		return { session: null, user: null };
	}

	// Vérifier si la session a expiré
	if (Date.now() >= session.expiresAt.getTime()) {
		await prisma.session.delete({ where: { id: sessionId } });
		return { session: null, user: null };
	}

	// Renouveler la session si elle expire dans moins de 15 jours
	if (Date.now() >= session.expiresAt.getTime() - SESSION_DURATION / 2) {
		const newExpiresAt = new Date(Date.now() + SESSION_DURATION);
		await prisma.session.update({
			where: { id: sessionId },
			data: { expiresAt: newExpiresAt }
		});
		session.expiresAt = newExpiresAt;
	}

	return { session, user: session.user };
}

/**
 * Invalide une session
 */
export async function invalidateSession(sessionId: string): Promise<void> {
	await prisma.session.delete({ where: { id: sessionId } });
}

/**
 * Invalide toutes les sessions d'un utilisateur
 */
export async function invalidateUserSessions(userId: number): Promise<void> {
	await prisma.session.deleteMany({ where: { userId } });
}

/**
 * Hash un mot de passe
 */
export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 10);
}

/**
 * Vérifie un mot de passe
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

/**
 * Authentifie un utilisateur avec username/email et mot de passe
 */
export async function authenticateUser(usernameOrEmail: string, password: string) {
	const user = await prisma.user.findFirst({
		where: {
			OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
			isActive: true
		},
		include: {
			role: {
				include: {
					permissions: true
				}
			}
		}
	});

	if (!user) {
		return null;
	}

	const validPassword = await verifyPassword(password, user.passwordHash);
	if (!validPassword) {
		return null;
	}

	return user;
}

/**
 * Crée un nouvel utilisateur
 */
export async function createUser(data: {
	username: string;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	roleId: number;
}) {
	const passwordHash = await hashPassword(data.password);

	return prisma.user.create({
		data: {
			username: data.username,
			email: data.email,
			passwordHash,
			firstName: data.firstName,
			lastName: data.lastName,
			roleId: data.roleId
		},
		include: {
			role: {
				include: {
					permissions: true
				}
			}
		}
	});
}
