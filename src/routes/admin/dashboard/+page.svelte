<script lang="ts">
	import { enhance } from '$app/forms';
	import Container from '$lib/components/Container.svelte';
	import {
		UserPlus,
		Edit,
		Trash2,
		Key,
		CheckCircle,
		XCircle,
		Calendar,
		Play,
		Square,
		TrendingUp
	} from '@lucide/svelte';
	import { FlexiBoard } from 'svelte-flexiboards';

	let { data, form } = $props();

	let activeTab = $state('users');
	let showCreateUserModal = $state(false);
	let showEditUserModal = $state(false);
	let showPasswordModal = $state(false);
	let showCreatePartyModal = $state(false);
	let selectedUser = $state<(typeof data.users)[0] | null>(null);
	let loading = $state(false);

	function openCreateUserModal() {
		showCreateUserModal = true;
	}

	function openEditUserModal(user: (typeof data.users)[0]) {
		selectedUser = user;
		showEditUserModal = true;
	}

	function openPasswordModal(user: (typeof data.users)[0]) {
		selectedUser = user;
		showPasswordModal = true;
	}

	function openCreatePartyModal() {
		showCreatePartyModal = true;
	}

	function closeModals() {
		showCreateUserModal = false;
		showEditUserModal = false;
		showPasswordModal = false;
		showCreatePartyModal = false;
		selectedUser = null;
	}

	function formatDate(date: string | Date) {
		return new Date(date).toLocaleDateString('fr-FR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	function formatDateTime(date: string | Date) {
		return new Date(date).toLocaleString('fr-FR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Tableau de bord - PartyLogger</title>
</svelte:head>

<Container>
	<div class="py-8">
		<h1 class="mb-6 text-3xl font-bold">Tableau de bord administrateur</h1>

		{#if form?.success}
			<div class="mb-4 rounded-lg bg-green-100 p-4 text-green-700">
				{form.message}
			</div>
		{/if}

		{#if form?.error}
			<div class="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
				{form.error}
			</div>
		{/if}

		<!-- Onglets -->
		<div class="mb-6 border-b border-gray-200">
			<nav class="-mb-px flex space-x-8">
				<button
					onclick={() => (activeTab = 'parties')}
					class="border-b-2 px-1 py-4 text-sm font-medium {activeTab === 'parties'
						? 'border-blue-600 text-blue-600'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
				>
					<Calendar class="inline" size={16} />
					Soirées
				</button>
				<button
					onclick={() => (activeTab = 'users')}
					class="border-b-2 px-1 py-4 text-sm font-medium {activeTab === 'users'
						? 'border-blue-600 text-blue-600'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
				>
					Utilisateurs
				</button>
				<button
					onclick={() => (activeTab = 'stats')}
					class="border-b-2 px-1 py-4 text-sm font-medium {activeTab === 'stats'
						? 'border-blue-600 text-blue-600'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
				>
					<TrendingUp class="inline" size={16} />
					Statistiques
				</button>
			</nav>
		</div>

		<!-- Contenu des onglets -->
		{#if activeTab === 'parties'}
			<!-- Gestion des soirées -->
			<div class="mb-6">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-2xl font-bold">Gestion des soirées</h2>
					<button
						onclick={openCreatePartyModal}
						class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
					>
						<Calendar size={20} />
						Nouvelle soirée
					</button>
				</div>

				{#if data.activeParty}
					<div class="mb-4 rounded-lg bg-green-50 p-4 border border-green-200">
						<div class="flex items-center justify-between">
							<div>
								<h3 class="font-semibold text-green-900">Soirée active</h3>
								<p class="text-green-700">{data.activeParty.name}</p>
								<p class="text-sm text-green-600">{formatDate(data.activeParty.date)}</p>
							</div>
							<form method="POST" action="?/closeParty" use:enhance>
								<input type="hidden" name="partyId" value={data.activeParty.id} />
								<button
									type="submit"
									class="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
								>
									<Square size={16} />
									Fermer la soirée
								</button>
							</form>
						</div>
					</div>
				{/if}

				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each data.parties as party}
						<div
							class="rounded-lg border p-4 {party.isActive
								? 'border-green-300 bg-green-50'
								: party.isClosed
									? 'border-gray-300 bg-gray-50'
									: 'border-blue-300 bg-blue-50'}"
						>
							<div class="mb-2 flex items-start justify-between">
								<div>
									<a href="/admin/party/{party.id}" class="font-semibold hover:text-blue-600 hover:underline">
										{party.name}
									</a>
									{#if party.description}
										<p class="text-sm text-gray-600">{party.description}</p>
									{/if}
								</div>
								<span
									class="rounded-full px-2 py-1 text-xs font-semibold {party.isActive
										? 'bg-green-200 text-green-800'
										: party.isClosed
											? 'bg-gray-200 text-gray-800'
											: 'bg-blue-200 text-blue-800'}"
								>
									{party.isActive ? 'Active' : party.isClosed ? 'Fermée' : 'Planifiée'}
								</span>
							</div>
							<div class="mb-3 text-sm text-gray-600">
								<p>📅 {formatDate(party.date)}</p>
								{#if party.location}
									<p>📍 {party.location}</p>
								{/if}
								<p class="text-xs mt-1">Par {party.creator.firstName} {party.creator.lastName}</p>
							</div>
							{#if party.stats}
								<div class="mb-3 grid grid-cols-3 gap-2 text-center text-xs">
									<div class="rounded bg-white p-2">
										<div class="font-semibold">{party.stats.totalTickets}</div>
										<div class="text-gray-600">Tickets</div>
									</div>
									<div class="rounded bg-white p-2">
										<div class="font-semibold">{party.stats.totalStudents}</div>
										<div class="text-gray-600">Étudiants</div>
									</div>
									<div class="rounded bg-white p-2">
										<div class="font-semibold">{party.stats.totalGuests}</div>
										<div class="text-gray-600">Invités</div>
									</div>
								</div>
							{/if}
							<div class="flex gap-2">
								{#if !party.isActive && !party.isClosed}
									<form method="POST" action="?/activateParty" use:enhance class="flex-1">
										<input type="hidden" name="partyId" value={party.id} />
										<button
											type="submit"
											class="w-full flex items-center justify-center gap-1 rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
										>
											<Play size={14} />
											Activer
										</button>
									</form>
								{/if}
								<form method="POST" action="?/deleteParty" use:enhance>
									<input type="hidden" name="partyId" value={party.id} />
									<button
										type="submit"
										class="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
										onclick={(e) => {
											if (!confirm('Êtes-vous sûr de vouloir supprimer cette soirée ?')) {
												e.preventDefault();
											}
										}}
									>
										<Trash2 size={14} />
									</button>
								</form>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{:else if activeTab === 'users'}
			<!-- Gestion des utilisateurs (tableau existant) -->
			<div class="mb-6">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-2xl font-bold">Gestion des utilisateurs</h2>
					<button
						onclick={openCreateUserModal}
						class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
					>
						<UserPlus size={20} />
						Nouvel utilisateur
					</button>
				</div>

				<div class="overflow-x-auto rounded-lg border">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>
									Utilisateur
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>
									Email
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>
									Rôle
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>
									Statut
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>
									Actions
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							{#each data.users as user}
								<tr>
									<td class="whitespace-nowrap px-6 py-4">
										<div class="font-medium text-gray-900">
											{user.firstName}
											{user.lastName}
										</div>
										<div class="text-sm text-gray-500">@{user.username}</div>
									</td>
									<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
										{user.email}
									</td>
									<td class="whitespace-nowrap px-6 py-4">
										<span
											class="inline-flex rounded-full px-2 py-1 text-xs font-semibold {user.role
												.name === 'admin'
												? 'bg-purple-100 text-purple-800'
												: user.role.name === 'moderator'
													? 'bg-blue-100 text-blue-800'
													: 'bg-gray-100 text-gray-800'}"
										>
											{user.role.name}
										</span>
									</td>
									<td class="whitespace-nowrap px-6 py-4">
										{#if user.isActive}
											<span class="flex items-center gap-1 text-green-600">
												<CheckCircle size={16} />
												Actif
											</span>
										{:else}
											<span class="flex items-center gap-1 text-red-600">
												<XCircle size={16} />
												Inactif
											</span>
										{/if}
									</td>
									<td class="whitespace-nowrap px-6 py-4 text-sm font-medium">
										<div class="flex gap-2">
											<button
												onclick={() => openEditUserModal(user)}
												class="text-blue-600 hover:text-blue-900"
												title="Modifier"
											>
												<Edit size={18} />
											</button>
											<button
												onclick={() => openPasswordModal(user)}
												class="text-yellow-600 hover:text-yellow-900"
												title="Réinitialiser mot de passe"
											>
												<Key size={18} />
											</button>
											{#if user.id !== data.currentUser.id}
												<form method="POST" action="?/deleteUser" use:enhance>
													<input type="hidden" name="userId" value={user.id} />
													<button
														type="submit"
														class="text-red-600 hover:text-red-900"
														title="Supprimer"
														onclick={(e) => {
															if (
																!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')
															) {
																e.preventDefault();
															}
														}}
													>
														<Trash2 size={18} />
													</button>
												</form>
											{/if}
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{:else if activeTab === 'stats'}
			<!-- Statistiques avec Flexiboards -->
			<div class="mb-6">
				<h2 class="mb-4 text-2xl font-bold">Statistiques globales</h2>

				{#if data.parties && data.users}
					<FlexiBoard
						boards={[
						{
							id: 'overview',
							title: 'Vue d\'ensemble',
							widgets: [
								{
									id: 'total-parties',
									title: 'Total soirées',
									type: 'stat',
									value: data.parties.length,
									trend: '+12%'
								},
								{
									id: 'active-party',
									title: 'Soirée active',
									type: 'stat',
									value: data.activeParty ? 'Oui' : 'Non',
									description: data.activeParty?.name || 'Aucune'
								},
								{
									id: 'total-users',
									title: 'Total utilisateurs',
									type: 'stat',
									value: data.users.length
								},
								{
									id: 'active-users',
									title: 'Utilisateurs actifs',
									type: 'stat',
									value: data.users.filter((u) => u.isActive).length
								}
							]
						},
						{
							id: 'parties-stats',
							title: 'Statistiques des soirées',
							widgets: [
								{
									id: 'closed-parties',
									title: 'Soirées fermées',
									type: 'stat',
									value: data.parties.filter((p) => p.isClosed).length
								},
								{
									id: 'planned-parties',
									title: 'Soirées planifiées',
									type: 'stat',
									value: data.parties.filter((p) => !p.isClosed && !p.isActive).length
								}
							]
						}
					]}
				/>
			{:else}
				<div class="rounded-lg border border-gray-200 bg-white p-8 text-center">
					<p class="text-gray-500">Chargement des statistiques...</p>
				</div>
			{/if}
			</div>
		{/if}
	</div>
</Container>

<!-- Modaux (User) -->
{#if showCreateUserModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<div class="w-full max-w-md rounded-lg bg-white p-6">
			<h2 class="mb-4 text-2xl font-bold">Nouvel utilisateur</h2>
			<form
				method="POST"
				action="?/createUser"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
						closeModals();
					};
				}}
			>
				<div class="mb-4">
					<label for="username" class="mb-2 block font-medium">Nom d'utilisateur</label>
					<input
						type="text"
						id="username"
						name="username"
						required
						class="w-full rounded-lg border px-4 py-2"
					/>
				</div>
				<div class="mb-4">
					<label for="email" class="mb-2 block font-medium">Email</label>
					<input
						type="email"
						id="email"
						name="email"
						required
						class="w-full rounded-lg border px-4 py-2"
					/>
				</div>
				<div class="mb-4">
					<label for="firstName" class="mb-2 block font-medium">Prénom</label>
					<input
						type="text"
						id="firstName"
						name="firstName"
						required
						class="w-full rounded-lg border px-4 py-2"
					/>
				</div>
				<div class="mb-4">
					<label for="lastName" class="mb-2 block font-medium">Nom</label>
					<input
						type="text"
						id="lastName"
						name="lastName"
						required
						class="w-full rounded-lg border px-4 py-2"
					/>
				</div>
				<div class="mb-4">
					<label for="password" class="mb-2 block font-medium">Mot de passe</label>
					<input
						type="password"
						id="password"
						name="password"
						required
						class="w-full rounded-lg border px-4 py-2"
					/>
				</div>
				<div class="mb-4">
					<label for="roleId" class="mb-2 block font-medium">Rôle</label>
					<select id="roleId" name="roleId" required class="w-full rounded-lg border px-4 py-2">
						{#each data.roles as role}
							<option value={role.id}>{role.name}</option>
						{/each}
					</select>
				</div>
				<div class="flex justify-end gap-2">
					<button
						type="button"
						onclick={closeModals}
						class="rounded-lg bg-gray-300 px-4 py-2 hover:bg-gray-400"
					>
						Annuler
					</button>
					<button
						type="submit"
						disabled={loading}
						class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
					>
						{loading ? 'Création...' : 'Créer'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Modal Création Soirée -->
{#if showCreatePartyModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<div class="w-full max-w-md rounded-lg bg-white p-6">
			<h2 class="mb-4 text-2xl font-bold">Nouvelle soirée</h2>
			<form
				method="POST"
				action="?/createParty"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
						closeModals();
					};
				}}
			>
				<div class="mb-4">
					<label for="name" class="mb-2 block font-medium">Nom de la soirée</label>
					<input
						type="text"
						id="name"
						name="name"
						required
						class="w-full rounded-lg border px-4 py-2"
						placeholder="Soirée de bienvenue"
					/>
				</div>
				<div class="mb-4">
					<label for="description" class="mb-2 block font-medium">Description</label>
					<textarea
						id="description"
						name="description"
						class="w-full rounded-lg border px-4 py-2"
						rows="3"
						placeholder="Description de la soirée..."
					></textarea>
				</div>
				<div class="mb-4">
					<label for="date" class="mb-2 block font-medium">Date</label>
					<input
						type="date"
						id="date"
						name="date"
						required
						class="w-full rounded-lg border px-4 py-2"
					/>
				</div>
				<div class="mb-4">
					<label for="location" class="mb-2 block font-medium">Lieu</label>
					<input
						type="text"
						id="location"
						name="location"
						class="w-full rounded-lg border px-4 py-2"
						placeholder="BDE ENSISA"
					/>
				</div>
				<div class="flex justify-end gap-2">
					<button
						type="button"
						onclick={closeModals}
						class="rounded-lg bg-gray-300 px-4 py-2 hover:bg-gray-400"
					>
						Annuler
					</button>
					<button
						type="submit"
						disabled={loading}
						class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
					>
						{loading ? 'Création...' : 'Créer'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Autres modaux (Edit User, Password Reset) - conserver les modaux existants de l'ancien code -->
{#if showEditUserModal && selectedUser}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<div class="w-full max-w-md rounded-lg bg-white p-6">
			<h2 class="mb-4 text-2xl font-bold">Modifier l'utilisateur</h2>
			<form
				method="POST"
				action="?/updateUser"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
						closeModals();
					};
				}}
			>
				<input type="hidden" name="userId" value={selectedUser.id} />
				<div class="mb-4">
					<label for="editFirstName" class="mb-2 block font-medium">Prénom</label>
					<input
						type="text"
						id="editFirstName"
						name="firstName"
						value={selectedUser.firstName}
						required
						class="w-full rounded-lg border px-4 py-2"
					/>
				</div>
				<div class="mb-4">
					<label for="editLastName" class="mb-2 block font-medium">Nom</label>
					<input
						type="text"
						id="editLastName"
						name="lastName"
						value={selectedUser.lastName}
						required
						class="w-full rounded-lg border px-4 py-2"
					/>
				</div>
				<div class="mb-4">
					<label for="editRoleId" class="mb-2 block font-medium">Rôle</label>
					<select
						id="editRoleId"
						name="roleId"
						value={selectedUser.roleId}
						required
						class="w-full rounded-lg border px-4 py-2"
					>
						{#each data.roles as role}
							<option value={role.id}>{role.name}</option>
						{/each}
					</select>
				</div>
				<div class="mb-4">
					<label class="flex items-center gap-2">
						<input type="checkbox" name="isActive" value="true" checked={selectedUser.isActive} />
						<span>Compte actif</span>
					</label>
				</div>
				<div class="flex justify-end gap-2">
					<button
						type="button"
						onclick={closeModals}
						class="rounded-lg bg-gray-300 px-4 py-2 hover:bg-gray-400"
					>
						Annuler
					</button>
					<button
						type="submit"
						disabled={loading}
						class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
					>
						{loading ? 'Mise à jour...' : 'Mettre à jour'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if showPasswordModal && selectedUser}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<div class="w-full max-w-md rounded-lg bg-white p-6">
			<h2 class="mb-4 text-2xl font-bold">Réinitialiser le mot de passe</h2>
			<p class="mb-4 text-gray-600">
				Utilisateur: <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>
			</p>
			<form
				method="POST"
				action="?/resetPassword"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
						closeModals();
					};
				}}
			>
				<input type="hidden" name="userId" value={selectedUser.id} />
				<div class="mb-4">
					<label for="newPassword" class="mb-2 block font-medium">Nouveau mot de passe</label>
					<input
						type="password"
						id="newPassword"
						name="newPassword"
						required
						class="w-full rounded-lg border px-4 py-2"
					/>
				</div>
				<div class="flex justify-end gap-2">
					<button
						type="button"
						onclick={closeModals}
						class="rounded-lg bg-gray-300 px-4 py-2 hover:bg-gray-400"
					>
						Annuler
					</button>
					<button
						type="submit"
						disabled={loading}
						class="rounded-lg bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700 disabled:opacity-50"
					>
						{loading ? 'Réinitialisation...' : 'Réinitialiser'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
