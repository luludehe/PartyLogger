# Configuration de l'authentification PartyLogger

## Installation et configuration

### 1. Configuration de la base de données

Créez un fichier `.env` à la racine du projet avec vos paramètres de connexion MySQL :

```env
DATABASE_URL="mysql://username:password@localhost:3306/partylogger"
NODE_ENV="development"
```

### 2. Génération de la base de données

Exécutez les migrations Prisma pour créer les tables :

```bash
npx prisma migrate dev --name add_authentication
```

### 3. Initialisation des données

Créez les rôles, permissions et un utilisateur admin par défaut :

```bash
npm run db:seed
```

Ceci créera :
- **3 rôles** : admin, moderator, user
- **16 permissions** : manage_users, view_users, manage_students, etc.
- **1 utilisateur admin** :
  - Username: `admin`
  - Password: `admin123`
  - Email: `admin@partylogger.local`

⚠️ **Important** : Changez le mot de passe admin dès la première connexion !

### 4. Lancer l'application

```bash
npm run dev
```

## Structure d'authentification

### Modèles de données

- **User** : Utilisateurs de l'application avec leurs informations
- **Session** : Sessions actives avec expiration automatique (30 jours)
- **Role** : Rôles assignables (admin, moderator, user)
- **Permission** : Permissions granulaires pour contrôler l'accès

### Permissions disponibles

#### Gestion des utilisateurs
- `manage_users` : Créer, modifier, supprimer des utilisateurs
- `view_users` : Voir la liste des utilisateurs

#### Gestion des étudiants
- `manage_students` : Gérer les étudiants
- `view_students` : Voir les étudiants

#### Gestion des invités
- `manage_guests` : Gérer les invités
- `view_guests` : Voir les invités

#### Gestion des tickets
- `manage_tickets` : Gérer tous les tickets
- `create_tickets` : Créer des tickets
- `delete_tickets` : Supprimer des tickets

#### Statistiques et logs
- `view_stats` : Voir les statistiques
- `view_advanced_stats` : Voir les statistiques avancées
- `view_logs` : Voir les logs
- `manage_logs` : Gérer les logs

#### Administration
- `admin_panel` : Accéder au panneau d'administration
- `manage_roles` : Gérer les rôles
- `manage_permissions` : Gérer les permissions

### Rôles par défaut

#### Admin
- Toutes les permissions
- Accès complet au système

#### Moderator
- Gestion des étudiants et invités
- Création et suppression de tickets
- Consultation des statistiques et logs
- Pas d'accès à la gestion des utilisateurs

#### User
- Consultation des étudiants et invités
- Création de tickets
- Consultation des statistiques basiques

## Utilisation

### Connexion

Accédez à `/login` et connectez-vous avec :
- Username ou Email
- Mot de passe

### Panneau d'administration

Les utilisateurs avec la permission `admin_panel` peuvent accéder à `/admin` pour :
- Créer de nouveaux utilisateurs
- Modifier les informations et rôles
- Réinitialiser les mots de passe
- Désactiver/supprimer des comptes
- Voir les permissions de chaque rôle

### Déconnexion

Utilisez le menu utilisateur en haut à droite ou envoyez une requête POST à `/logout`

## Sécurité

- Les mots de passe sont hashés avec bcrypt (10 rounds)
- Les sessions utilisent des tokens sécurisés générés avec @oslojs/crypto
- Les cookies de session sont httpOnly et secure en production
- Les sessions expirent automatiquement après 30 jours
- Renouvellement automatique des sessions (15 jours avant expiration)
- Toutes les routes sont protégées par authentification
- Contrôle d'accès granulaire basé sur les permissions

## Développement

### Ajouter une nouvelle permission

1. Ajoutez la permission dans `src/lib/server/permissions.ts`
2. Mettez à jour le script de seed `prisma/seed.ts`
3. Réexécutez `npm run db:seed`

### Protéger une route

```typescript
import { redirect } from '@sveltejs/kit';
import { hasPermission, PERMISSIONS } from '$lib/server/permissions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	if (!hasPermission(locals.user, PERMISSIONS.YOUR_PERMISSION)) {
		throw redirect(302, '/');
	}

	// Votre code ici
};
```

### Vérifier les permissions dans le frontend

```svelte
<script lang="ts">
	let { data } = $props();

	function hasPermission(permission: string): boolean {
		return data.user?.role.permissions.includes(permission) || false;
	}
</script>

{#if hasPermission('admin_panel')}
	<a href="/admin">Administration</a>
{/if}
```

## Commandes utiles

```bash
# Générer le client Prisma après modification du schéma
npx prisma generate

# Créer une nouvelle migration
npx prisma migrate dev --name nom_de_la_migration

# Réinitialiser la base de données (⚠️ supprime toutes les données)
npx prisma migrate reset

# Visualiser la base de données
npx prisma studio
```
