<script lang="ts">
	import { enhance } from '$app/forms';
	import Container from '$lib/components/Container.svelte';
	import Card from '$lib/components/Card.svelte';
	import { UserPlus, Edit, Trash2, Key, CheckCircle, XCircle } from '@lucide/svelte';

	let { data, form } = $props();

	let showCreateModal = $state(false);
	let showEditModal = $state(false);
	let showPasswordModal = $state(false);
	let selectedUser = $state<(typeof data.users)[0] | null>(null);
	let loading = $state(false);

	function openCreateModal() {
		showCreateModal = true;
	}

	function openEditModal(user: (typeof data.users)[0]) {
		selectedUser = user;
		showEditModal = true;
	}

	function openPasswordModal(user: (typeof data.users)[0]) {
		selectedUser = user;
		showPasswordModal = true;
	}

	function closeModals() {
		showCreateModal = false;
		showEditModal = false;
		showPasswordModal = false;
		selectedUser = null;
	}
</script>

<svelte:head>
	<title>Administration - PartyLogger</title>
</svelte:head>

<Container>
	<div class="py-8">
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-3xl font-bold">Administration des utilisateurs</h1>
			<button
				onclick={openCreateModal}
				class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
			>
				<UserPlus size={20} />
				Nouvel utilisateur
			</button>
		</div>

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

		<Card>
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
								Utilisateur
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
								Email
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
								Rôle
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
								Statut
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
								Permissions
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
								Actions
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 bg-white">
						{#each data.users as user}
							<tr>
								<td class="whitespace-nowrap px-6 py-4">
									<div class="flex items-center">
										<div>
											<div class="font-medium text-gray-900">
												{user.firstName}
												{user.lastName}
											</div>
											<div class="text-sm text-gray-500">@{user.username}</div>
										</div>
									</div>
								</td>
								<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
									{user.email}
								</td>
								<td class="whitespace-nowrap px-6 py-4">
									<span
										class="inline-flex rounded-full px-2 py-1 text-xs font-semibold {user.role.name ===
										'admin'
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
								<td class="px-6 py-4 text-sm text-gray-500">
									<div class="max-w-xs">
										<details class="cursor-pointer">
											<summary class="text-blue-600 hover:text-blue-800">
												{user.role.permissions.length} permission(s)
											</summary>
											<ul class="mt-2 list-inside list-disc text-xs">
												{#each user.role.permissions as permission}
													<li>{permission.name}</li>
												{/each}
											</ul>
										</details>
									</div>
								</td>
								<td class="whitespace-nowrap px-6 py-4 text-sm font-medium">
									<div class="flex gap-2">
										<button
											onclick={() => openEditModal(user)}
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
														if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
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
		</Card>
	</div>
</Container>

<!-- Modal Création -->
{#if showCreateModal}
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
					<input type="email" id="email" name="email" required class="w-full rounded-lg border px-4 py-2" />
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

<!-- Modal Édition -->
{#if showEditModal && selectedUser}
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

<!-- Modal Réinitialisation mot de passe -->
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
