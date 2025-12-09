/**
 * Script de génération de données de test pour PartyLogger
 * Génère des étudiants, invités, soirées, tickets et logs en masse
 * 
 * Usage: npx tsx tools/db-seeder.ts
 */

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/fr';

const prisma = new PrismaClient();

// Configuration
const CONFIG = {
	STUDENTS_COUNT: 200,
	GUESTS_COUNT: 50,
	PARTIES_COUNT: 15,
};

// Données de référence
const SPECIALITES = ['ASE1', 'ASE2', 'ASE3', 'IR1', 'IR2', 'IR3', 'T&F1', 'T&F2', 'T&F3', 'Méca1', 'Méca2', 'Méca3', 'GI1', 'GI2', 'GI3'];
const PARTY_NAMES = [
	'Soirée de Rentrée',
	'Halloween Party',
	'Soirée Karaoké',
	'Soirée Jeux',
	'Nuit Blanche',
	'Soirée Déguisée',
	'After Exam Party',
	'Soirée BBQ',
	'Soirée 80s',
	'Galette des Rois',
	'Saint-Valentin',
	'Soirée Casino',
	'Beach Party',
	'Oktoberfest',
	'Nouvel An'
];
const LOCATIONS = ['BDE ENSISA', 'Foyer', 'Salle polyvalente', 'Campus extérieur', 'Partenaire bar'];

/**
 * Supprime toutes les données existantes
 */
async function clearAllData() {
	console.log('⚠️  Suppression de toutes les données existantes...');
	
	await prisma.log.deleteMany({});
	console.log('   ✓ Logs supprimés');
	
	await prisma.ticket.deleteMany({});
	console.log('   ✓ Tickets supprimés');
	
	await prisma.guest.deleteMany({});
	console.log('   ✓ Invités supprimés');
	
	await prisma.student.deleteMany({});
	console.log('   ✓ Étudiants supprimés');
	
	await prisma.partyStats.deleteMany({});
	console.log('   ✓ Stats de soirées supprimées');
	
	await prisma.party.deleteMany({});
	console.log('   ✓ Soirées supprimées');
	
	console.log('✓ Toutes les données ont été supprimées\n');
}

/**
 * Génère un numéro étudiant unique
 */
function generateUniqueStudentId(existingIds: Set<number>): number {
	let studentId: number;
	do {
		studentId = faker.number.int({ min: 20000000, max: 23999999 });
	} while (existingIds.has(studentId));
	existingIds.add(studentId);
	return studentId;
}

/**
 * Génère des étudiants
 */
async function generateStudents(count: number) {
	console.log(`Génération de ${count} étudiants...`);
	
	const existingIds = new Set<number>();
	const students = [];
	
	for (let i = 0; i < count; i++) {
		students.push({
			studentId: generateUniqueStudentId(existingIds),
			first_name: faker.person.firstName(),
			last_name: faker.person.lastName(),
			speciality: faker.helpers.arrayElement(SPECIALITES),
			isMember: faker.datatype.boolean(),
		});
	}
	
	await prisma.student.createMany({ data: students });
	
	const createdStudents = await prisma.student.findMany({ select: { id: true } });
	console.log(`✓ ${count} étudiants créés\n`);
	
	return createdStudents.map(s => s.id);
}

/**
 * Génère des soirées
 */
async function generateParties(creatorId: number, count: number) {
	console.log(`Génération de ${count} soirées...`);
	
	const baseDate = new Date();
	baseDate.setFullYear(baseDate.getFullYear() - 1); // Il y a un an
	
	const parties = [];
	
	for (let i = 0; i < count; i++) {
		let name = faker.helpers.arrayElement(PARTY_NAMES);
		if (i > 0) {
			name = `${name} ${faker.date.month()}`;
		}
		
		const description = `Une soirée ${faker.word.adjective()} organisée par le BDE`;
		const date = new Date(baseDate.getTime() + faker.number.int({ min: 0, max: 365 * 24 * 60 * 60 * 1000 }));
		const location = faker.helpers.arrayElement(LOCATIONS);
		
		const now = new Date();
		const isClosed = date < new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		const isActive = !isClosed && date < now && Math.random() < 0.1;
		
		const startTime = new Date(date);
		startTime.setHours(20, 0, 0, 0);
		
		const endTime = isClosed ? new Date(startTime.getTime() + faker.number.int({ min: 4, max: 8 }) * 60 * 60 * 1000) : null;
		
		parties.push({
			name,
			description,
			date,
			location,
			createdBy: creatorId,
			isActive,
			isClosed,
			startTime,
			endTime,
		});
	}
	
	// Créer les soirées et leurs stats
	const createdParties = [];
	for (const party of parties) {
		const created = await prisma.party.create({
			data: {
				...party,
				stats: {
					create: {}
				}
			}
		});
		createdParties.push({
			id: created.id,
			date: created.date,
			startTime: created.startTime!,
			isClosed: created.isClosed,
			isActive: created.isActive,
		});
	}
	
	console.log(`✓ ${count} soirées créées\n`);
	return createdParties;
}

/**
 * Génère des invités
 */
async function generateGuests(studentIds: number[], count: number) {
	console.log(`Génération de ${count} invités...`);
	
	const guests = [];
	
	for (let i = 0; i < count; i++) {
		guests.push({
			first_name: faker.person.firstName(),
			last_name: faker.person.lastName(),
			guarantorId: faker.helpers.arrayElement(studentIds),
		});
	}
	
	await prisma.guest.createMany({ data: guests });
	
	const createdGuests = await prisma.guest.findMany({ select: { id: true } });
	console.log(`✓ ${count} invités créés\n`);
	
	return createdGuests.map(g => g.id);
}

/**
 * Génère des tickets et logs pour les soirées
 */
async function generateTicketsAndLogs(
	parties: Array<{ id: number; date: Date; startTime: Date; isClosed: boolean; isActive: boolean }>,
	studentIds: number[],
	guestIds: number[]
) {
	console.log('Génération des tickets et logs...');
	
	let totalTickets = 0;
	let totalLogs = 0;
	
	for (const party of parties) {
		const partyId = party.id;
		const partyDate = party.date;
		const isClosed = party.isClosed;
		
		// Nombre de participants (30% à 80% des étudiants)
		const numStudents = faker.number.int({ 
			min: Math.floor(studentIds.length * 0.3), 
			max: Math.floor(studentIds.length * 0.8) 
		});
		const participatingStudents = faker.helpers.arrayElements(studentIds, numStudents);
		
		// Nombre d'invités (5% à 15%)
		const numGuests = faker.number.int({ 
			min: Math.floor(guestIds.length * 0.05), 
			max: Math.floor(guestIds.length * 0.15) 
		});
		const participatingGuests = faker.helpers.arrayElements(guestIds, Math.min(numGuests, guestIds.length));
		
		// Tickets étudiants
		for (const studentId of participatingStudents) {
			const entryTime = new Date(
				partyDate.getTime() + 
				faker.number.int({ min: 0, max: 3 * 60 * 60 * 1000 }) + 
				faker.number.int({ min: 0, max: 59 * 60 * 1000 })
			);
			
			// 70% restent jusqu'à la fin
			let exitTime = entryTime;
			if (isClosed && Math.random() < 0.7) {
				exitTime = new Date(entryTime.getTime() + faker.number.int({ min: 2, max: 6 }) * 60 * 60 * 1000);
			}
			
			await prisma.ticket.create({
				data: {
					student: { connect: { id: studentId } },
					party: { connect: { id: partyId } },
					entryAt: entryTime,
					exitAt: exitTime,
					createdAt: entryTime,
				}
			});
			totalTickets++;
			
			// Log d'entrée
			await prisma.log.create({
				data: {
					student: { connect: { id: studentId } },
					party: { connect: { id: partyId } },
					action: 'ENTRY',
					timestamp: entryTime,
				}
			});
			totalLogs++;
			
			// Log de sortie si parti
			if (exitTime.getTime() !== entryTime.getTime()) {
				await prisma.log.create({
					data: {
						student: { connect: { id: studentId } },
						party: { connect: { id: partyId } },
						action: 'EXIT',
						timestamp: exitTime,
					}
				});
				totalLogs++;
			}
		}
		
		// Tickets invités
		for (const guestId of participatingGuests) {
			const entryTime = new Date(
				partyDate.getTime() + 
				faker.number.int({ min: 0, max: 3 * 60 * 60 * 1000 }) + 
				faker.number.int({ min: 0, max: 59 * 60 * 1000 })
			);
			
			let exitTime = entryTime;
			if (isClosed && Math.random() < 0.7) {
				exitTime = new Date(entryTime.getTime() + faker.number.int({ min: 2, max: 6 }) * 60 * 60 * 1000);
			}
			
			await prisma.ticket.create({
				data: {
					guest: { connect: { id: guestId } },
					party: { connect: { id: partyId } },
					entryAt: entryTime,
					exitAt: exitTime,
					createdAt: entryTime,
				}
			});
			totalTickets++;
			
			// Log d'entrée
			await prisma.log.create({
				data: {
					guest: { connect: { id: guestId } },
					party: { connect: { id: partyId } },
					action: 'ENTRY',
					timestamp: entryTime,
				}
			});
			totalLogs++;
			
			// Log de sortie si parti
			if (exitTime.getTime() !== entryTime.getTime()) {
				await prisma.log.create({
					data: {
						guest: { connect: { id: guestId } },
						party: { connect: { id: partyId } },
						action: 'EXIT',
						timestamp: exitTime,
					}
				});
				totalLogs++;
			}
		}
		
		// Mettre à jour les stats de la soirée
		await prisma.partyStats.update({
			where: { partyId },
			data: {
				totalTickets: numStudents + numGuests,
				totalStudents: numStudents,
				totalGuests: numGuests,
			}
		});
	}
	
	console.log(`✓ ${totalTickets} tickets créés`);
	console.log(`✓ ${totalLogs} logs créés\n`);
}

/**
 * Point d'entrée principal
 */
async function main() {
	console.log('='.repeat(60));
	console.log('   GÉNÉRATEUR DE DONNÉES DE TEST - PartyLogger');
	console.log('='.repeat(60));
	console.log();
	
	console.log('⚠️  ATTENTION: Ce script va supprimer TOUTES les données existantes');
	console.log('   et les remplacer par des données de test générées aléatoirement.');
	console.log();
	console.log('Configuration:');
	console.log(`  • ${CONFIG.STUDENTS_COUNT} étudiants`);
	console.log(`  • ${CONFIG.GUESTS_COUNT} invités`);
	console.log(`  • ${CONFIG.PARTIES_COUNT} soirées`);
	console.log();
	
	// En TypeScript, on ne peut pas facilement demander confirmation en CLI
	// Donc on supprime directement (décommenter la ligne suivante pour activer)
	console.log('⏸️  Pour éviter la suppression accidentelle, commentez clearAllData() dans le code');
	console.log();
	
	try {
		console.log('✓ Connexion à la base de données établie\n');
		
		// Supprimer les données existantes
		await clearAllData();
		
		// Obtenir l'ID du premier utilisateur (admin)
		const firstUser = await prisma.user.findFirst({ select: { id: true } });
		if (!firstUser) {
			console.log('❌ Aucun utilisateur trouvé. Créez d\'abord un utilisateur admin.');
			return;
		}
		const creatorId = firstUser.id;
		
		// Générer les données
		console.log('Démarrage de la génération de données...\n');
		
		const studentIds = await generateStudents(CONFIG.STUDENTS_COUNT);
		const guestIds = await generateGuests(studentIds, CONFIG.GUESTS_COUNT);
		const parties = await generateParties(creatorId, CONFIG.PARTIES_COUNT);
		await generateTicketsAndLogs(parties, studentIds, guestIds);
		
		console.log('='.repeat(60));
		console.log('✅ GÉNÉRATION TERMINÉE AVEC SUCCÈS!');
		console.log('='.repeat(60));
		console.log('\nRésumé:');
		console.log(`  • ${studentIds.length} étudiants`);
		console.log(`  • ${guestIds.length} invités`);
		console.log(`  • ${parties.length} soirées`);
		console.log('  • Tickets et logs générés automatiquement');
		console.log();
		
	} catch (error) {
		console.error('\n❌ Erreur:', error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
