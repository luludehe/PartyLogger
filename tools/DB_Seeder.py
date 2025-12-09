#!/usr/bin/env python3
"""
Script de génération de données de test pour PartyLogger
Génère des étudiants, invités, soirées, tickets et logs en masse
"""

import mysql.connector
from datetime import datetime, timedelta
import random
from faker import Faker

# Configuration de la base de données
DB_CONFIG = {
    'host': '45.147.97.78',
    'port': 3306,
    'user': 'admin',
    'password': 'admin123',
    'database': 'students'
}

# Initialisation de Faker pour générer des données réalistes
fake = Faker('fr_FR')

# Listes pour les données
SPECIALITES = ['ASE1', 'ASE2', 'ASE3', 'IR1', 'IR2', 'IR3', 'T&F1', 'T&F2', 'T&F3', 'Méca1', 'Méca2', 'Méca3', 'GI1', 'GI2', 'GI3']
PARTY_NAMES = [
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
]
LOCATIONS = ['BDE ENSISA', 'Foyer', 'Salle polyvalente', 'Campus extérieur', 'Partenaire bar']

def get_connection():
    """Établit une connexion à la base de données"""
    return mysql.connector.connect(**DB_CONFIG)

def clear_all_data(conn):
    """Supprime toutes les données existantes (ATTENTION: opération destructive)"""
    cursor = conn.cursor()
    print("⚠️  Suppression de toutes les données existantes...")
    
    # Désactiver les contraintes de clés étrangères temporairement
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
    
    # Supprimer dans l'ordre inverse des dépendances
    tables = ['Log', 'Ticket', 'Guest', 'Student', 'PartyStats', 'Party']
    for table in tables:
        cursor.execute(f"DELETE FROM {table}")
        print(f"   ✓ {table} vidé")
    
    # Réactiver les contraintes
    cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
    conn.commit()
    print("✓ Toutes les données ont été supprimées\n")

def generate_students(conn, count=200):
    """Génère des étudiants"""
    cursor = conn.cursor()
    print(f"Génération de {count} étudiants...")
    
    students = []
    student_ids = set()
    
    for _ in range(count):
        # Générer un numéro étudiant unique
        while True:
            student_id = random.randint(20000000, 23999999)
            if student_id not in student_ids:
                student_ids.add(student_id)
                break
        
        first_name = fake.first_name()
        last_name = fake.last_name()
        speciality = random.choice(SPECIALITES)
        is_member = random.choice([True, False])
        
        cursor.execute(
            "INSERT INTO Student (studentId, first_name, last_name, speciality, isMember) VALUES (%s, %s, %s, %s, %s)",
            (student_id, first_name, last_name, speciality, is_member)
        )
        students.append(cursor.lastrowid)
    
    conn.commit()
    print(f"✓ {count} étudiants créés\n")
    return students

def generate_parties(conn, creator_id, count=15):
    """Génère des soirées"""
    cursor = conn.cursor()
    print(f"Génération de {count} soirées...")
    
    parties = []
    base_date = datetime.now() - timedelta(days=365)  # Commence il y a un an
    
    for i in range(count):
        name = random.choice(PARTY_NAMES)
        if i > 0:
            name = f"{name} {fake.month_name()}"
        
        description = f"Une soirée {fake.word()} organisée par le BDE"
        date = base_date + timedelta(days=random.randint(0, 365))
        location = random.choice(LOCATIONS)
        
        # Déterminer le statut
        is_closed = date < datetime.now() - timedelta(days=7)
        is_active = not is_closed and date < datetime.now() and random.random() < 0.1
        
        start_time = date.replace(hour=20, minute=0, second=0)
        end_time = start_time + timedelta(hours=random.randint(4, 8)) if is_closed else None
        
        cursor.execute(
            """INSERT INTO Party (name, description, date, location, creatorId, isActive, isClosed, startTime, endTime) 
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (name, description, date, location, creator_id, is_active, is_closed, start_time, end_time)
        )
        party_id = cursor.lastrowid
        
        # Créer les stats pour cette soirée
        cursor.execute(
            "INSERT INTO PartyStats (partyId) VALUES (%s)",
            (party_id,)
        )
        
        parties.append({
            'id': party_id,
            'date': date,
            'start_time': start_time,
            'is_closed': is_closed,
            'is_active': is_active
        })
    
    conn.commit()
    print(f"✓ {count} soirées créées\n")
    return parties

def generate_guests(conn, student_ids, count=50):
    """Génère des invités"""
    cursor = conn.cursor()
    print(f"Génération de {count} invités...")
    
    guests = []
    
    for _ in range(count):
        first_name = fake.first_name()
        last_name = fake.last_name()
        guarantor_id = random.choice(student_ids)
        
        cursor.execute(
            "INSERT INTO Guest (first_name, last_name, guarantorId) VALUES (%s, %s, %s)",
            (first_name, last_name, guarantor_id)
        )
        guests.append(cursor.lastrowid)
    
    conn.commit()
    print(f"✓ {count} invités créés\n")
    return guests

def generate_tickets_and_logs(conn, parties, student_ids, guest_ids):
    """Génère des tickets et logs pour les soirées"""
    cursor = conn.cursor()
    print("Génération des tickets et logs...")
    
    total_tickets = 0
    total_logs = 0
    
    for party in parties:
        party_id = party['id']
        party_date = party['date']
        is_closed = party['is_closed']
        
        # Nombre de participants pour cette soirée (30% à 80% des étudiants)
        num_students = random.randint(int(len(student_ids) * 0.3), int(len(student_ids) * 0.8))
        participating_students = random.sample(student_ids, num_students)
        
        # Nombre d'invités (5% à 15% des invités)
        num_guests = random.randint(int(len(guest_ids) * 0.05), int(len(guest_ids) * 0.15))
        participating_guests = random.sample(guest_ids, min(num_guests, len(guest_ids)))
        
        # Tickets étudiants
        for student_id in participating_students:
            entry_time = party_date + timedelta(
                hours=random.randint(0, 3),
                minutes=random.randint(0, 59)
            )
            
            # 70% des gens sont restés jusqu'à la fin
            if is_closed and random.random() < 0.7:
                exit_time = entry_time + timedelta(hours=random.randint(2, 6))
            else:
                exit_time = entry_time  # Encore présent ou non parti
            
            cursor.execute(
                """INSERT INTO Ticket (studentId, partyId, entryAt, exitAt, createdAt, updatedAt) 
                   VALUES (%s, %s, %s, %s, %s, %s)""",
                (student_id, party_id, entry_time, exit_time, entry_time, exit_time)
            )
            total_tickets += 1
            
            # Log d'entrée
            cursor.execute(
                """INSERT INTO Log (studentId, partyId, action, timestamp) 
                   VALUES (%s, %s, %s, %s)""",
                (student_id, party_id, 'ENTRY', entry_time)
            )
            total_logs += 1
            
            # Log de sortie si parti
            if exit_time != entry_time:
                cursor.execute(
                    """INSERT INTO Log (studentId, partyId, action, timestamp) 
                       VALUES (%s, %s, %s, %s)""",
                    (student_id, party_id, 'EXIT', exit_time)
                )
                total_logs += 1
        
        # Tickets invités
        for guest_id in participating_guests:
            entry_time = party_date + timedelta(
                hours=random.randint(0, 3),
                minutes=random.randint(0, 59)
            )
            
            if is_closed and random.random() < 0.7:
                exit_time = entry_time + timedelta(hours=random.randint(2, 6))
            else:
                exit_time = entry_time
            
            cursor.execute(
                """INSERT INTO Ticket (guestId, partyId, entryAt, exitAt, createdAt, updatedAt) 
                   VALUES (%s, %s, %s, %s, %s, %s)""",
                (guest_id, party_id, entry_time, exit_time, entry_time, exit_time)
            )
            total_tickets += 1
            
            # Log d'entrée
            cursor.execute(
                """INSERT INTO Log (guestId, partyId, action, timestamp) 
                   VALUES (%s, %s, %s, %s)""",
                (guest_id, party_id, 'ENTRY', entry_time)
            )
            total_logs += 1
            
            # Log de sortie si parti
            if exit_time != entry_time:
                cursor.execute(
                    """INSERT INTO Log (guestId, partyId, action, timestamp) 
                       VALUES (%s, %s, %s, %s)""",
                    (guest_id, party_id, 'EXIT', exit_time)
                )
                total_logs += 1
        
        # Mettre à jour les stats de la soirée
        cursor.execute(
            """UPDATE PartyStats 
               SET totalTickets = %s, totalStudents = %s, totalGuests = %s 
               WHERE partyId = %s""",
            (num_students + num_guests, num_students, num_guests, party_id)
        )
    
    conn.commit()
    print(f"✓ {total_tickets} tickets créés")
    print(f"✓ {total_logs} logs créés\n")

def main():
    """Point d'entrée principal"""
    print("=" * 60)
    print("   GÉNÉRATEUR DE DONNÉES DE TEST - PartyLogger")
    print("=" * 60)
    print()
    
    # Demander confirmation
    print("⚠️  ATTENTION: Ce script va supprimer TOUTES les données existantes")
    print("   et les remplacer par des données de test générées aléatoirement.")
    print()
    response = input("Voulez-vous continuer? (oui/non): ")
    
    if response.lower() not in ['oui', 'o', 'yes', 'y']:
        print("\n❌ Opération annulée")
        return
    
    print("\n" + "=" * 60)
    print()
    
    try:
        conn = get_connection()
        print("✓ Connexion à la base de données établie\n")
        
        # Supprimer les données existantes
        clear_all_data(conn)
        
        # Obtenir l'ID du premier utilisateur (admin) pour créer les soirées
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM User LIMIT 1")
        result = cursor.fetchone()
        if not result:
            print("❌ Aucun utilisateur trouvé. Créez d'abord un utilisateur admin.")
            return
        creator_id = result[0]
        
        # Générer les données
        print("Démarrage de la génération de données...\n")
        
        student_ids = generate_students(conn, count=200)
        guest_ids = generate_guests(conn, student_ids, count=50)
        parties = generate_parties(conn, creator_id, count=15)
        generate_tickets_and_logs(conn, parties, student_ids, guest_ids)
        
        print("=" * 60)
        print("✅ GÉNÉRATION TERMINÉE AVEC SUCCÈS!")
        print("=" * 60)
        print(f"\nRésumé:")
        print(f"  • {len(student_ids)} étudiants")
        print(f"  • {len(guest_ids)} invités")
        print(f"  • {len(parties)} soirées")
        print(f"  • Tickets et logs générés automatiquement")
        print()
        
        conn.close()
        
    except mysql.connector.Error as err:
        print(f"\n❌ Erreur MySQL: {err}")
    except Exception as e:
        print(f"\n❌ Erreur: {e}")

if __name__ == "__main__":
    main()
