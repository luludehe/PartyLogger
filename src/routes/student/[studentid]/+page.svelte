<script lang="ts">
	import { ArrowLeft, User, Calendar, Ticket, Clock, Users, UserCheck } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let speciality = $state('');
	let year = '';
	if (data.student?.speciality) {
		const match = data.student.speciality.match(/^([A-Za-z&éèà]+)(\d)$/);
		if (match) {
			speciality = match[1];
			year = match[2];
		} else {
			speciality = data.student.speciality;
			year = '';
		}
	}

	const spe_colors = {
		"ASE": "bg-cyan-500 text-white",
		"IR": "bg-red-500 text-white",
		"T&F": "bg-yellow-500 text-white",
		"Méca": "bg-purple-500 text-white",
		"GI": "bg-blue-500 text-white",
	};

	function formatDateTime(date: Date | string) {
		return new Date(date).toLocaleString('fr-FR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('fr-FR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function getActionLabel(action: string) {
		switch (action) {
			case 'ENTRY': return 'Entrée';
			case 'EXIT': return 'Sortie';
			case 'TICKET_CREATED': return 'Ticket créé';
			case 'TICKET_DELETED': return 'Ticket supprimé';
			default: return action;
		}
	}
</script>

<div class="container mx-auto p-6 max-w-7xl">
	<!-- Header -->
	<div class="flex items-center gap-4 mb-6">
		<a href="/" class="btn preset-tonal-primary">
			<ArrowLeft size={20} />
			Retour
		</a>
		<h1 class="text-3xl font-bold flex-1">
			{data.student.first_name} {data.student.last_name.toUpperCase()}
		</h1>
		{#if data.stats.currentlyPresent}
			<span class="badge bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
				Actuellement présent(e)
			</span>
		{/if}
	</div>

	<!-- Carte d'informations principales -->
	<div class="card bg-surface-100-900 p-6 mb-6">
		<div class="flex items-start gap-6">
			<div class="bg-gradient-to-br from-primary-500 to-primary-700 h-32 w-32 rounded-full flex items-center justify-center text-white text-5xl font-bold">
				{data.student.first_name.charAt(0)}{data.student.last_name.charAt(0)}
			</div>
			<div class="flex-1">
				<h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
					<User size={24} />
					Informations personnelles
				</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<p class="text-sm opacity-60">Nom complet</p>
						<p class="text-lg font-semibold">{data.student.first_name} {data.student.last_name.toUpperCase()}</p>
					</div>
					<div>
						<p class="text-sm opacity-60">N° étudiant</p>
						<p class="text-lg font-semibold">{data.student.studentId}</p>
					</div>
					<div>
						<p class="text-sm opacity-60">Spécialité</p>
						<div class="flex gap-2 mt-1">
							{#if year}
								<span class="badge bg-gray-500 text-white px-2 py-1 rounded text-sm">{year}A</span>
							{/if}
							{#if speciality && spe_colors[speciality]}
								<span class="badge {spe_colors[speciality]} px-2 py-1 rounded text-sm">{speciality}</span>
							{:else if speciality}
								<span class="badge bg-gray-400 text-white px-2 py-1 rounded text-sm">{speciality}</span>
							{/if}
						</div>
					</div>
					<div>
						<p class="text-sm opacity-60">Statut</p>
						{#if data.student.isMember}
							<span class="badge bg-green-500 text-white px-2 py-1 rounded text-sm mt-1 inline-block">Adhérent</span>
						{:else}
							<span class="badge bg-red-500 text-white px-2 py-1 rounded text-sm mt-1 inline-block">Non adhérent</span>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Statistiques -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
		<div class="card bg-surface-100-900 p-6">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm opacity-60">Soirées participées</h3>
				<Calendar size={20} class="opacity-60" />
			</div>
			<p class="text-3xl font-bold">{data.stats.totalParties}</p>
		</div>
		
		<div class="card bg-surface-100-900 p-6">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm opacity-60">Total tickets</h3>
				<Ticket size={20} class="opacity-60" />
			</div>
			<p class="text-3xl font-bold">{data.stats.totalTickets}</p>
		</div>
		
		<div class="card bg-surface-100-900 p-6">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm opacity-60">Visites complètes</h3>
				<UserCheck size={20} class="opacity-60" />
			</div>
			<p class="text-3xl font-bold">{data.stats.completedVisits}</p>
			<p class="text-xs opacity-60 mt-1">Entrées et sorties</p>
		</div>
		
		<div class="card bg-surface-100-900 p-6">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm opacity-60">Invités parrainés</h3>
				<Users size={20} class="opacity-60" />
			</div>
			<p class="text-3xl font-bold">{data.stats.totalGuests}</p>
		</div>
	</div>

	<!-- Tabs: Tickets et Historique -->
	<div class="card bg-surface-100-900 p-6">
		<div class="tabs">
			<input type="radio" id="tab-tickets" name="tabs" checked />
			<label for="tab-tickets" class="tab-label">
				<Ticket size={18} />
				Tickets ({data.student.tickets.length})
			</label>
			
			<input type="radio" id="tab-logs" name="tabs" />
			<label for="tab-logs" class="tab-label">
				<Clock size={18} />
				Historique ({data.student.Log.length})
			</label>

			{#if data.student.guests.length > 0}
			<input type="radio" id="tab-guests" name="tabs" />
			<label for="tab-guests" class="tab-label">
				<Users size={18} />
				Invités parrainés ({data.student.guests.length})
			</label>
			{/if}

			<div class="tab-content">
				<!-- Tickets -->
				<div class="content-tickets">
					{#if data.student.tickets.length > 0}
						<div class="overflow-x-auto">
							<table class="table w-full">
								<thead>
									<tr class="bg-surface-200-800">
										<th>Soirée</th>
										<th>Date</th>
										<th>Lieu</th>
										<th>Entrée</th>
										<th>Sortie</th>
										<th>Statut</th>
									</tr>
								</thead>
								<tbody>
									{#each data.student.tickets as ticket}
										<tr class="hover:bg-surface-200-800">
											<td class="font-semibold">
												<a href="/admin/party/{ticket.party.id}" class="hover:text-blue-600 hover:underline">
													{ticket.party.name}
												</a>
											</td>
											<td>{formatDate(ticket.party.date)}</td>
											<td>{ticket.party.location || '-'}</td>
											<td>{formatDateTime(ticket.entryAt)}</td>
											<td>
												{#if ticket.entryAt.getTime() !== ticket.exitAt.getTime()}
													{formatDateTime(ticket.exitAt)}
												{:else}
													<span class="text-green-500 font-semibold">Présent(e)</span>
												{/if}
											</td>
											<td>
												{#if ticket.entryAt.getTime() === ticket.exitAt.getTime()}
													<span class="badge bg-green-500 text-white">Présent</span>
												{:else}
													<span class="badge bg-gray-500 text-white">Parti</span>
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
						<div class="text-center py-12 opacity-60">
							<Ticket size={48} class="mx-auto mb-4 opacity-40" />
							<p>Aucun ticket trouvé</p>
						</div>
					{/if}
				</div>

				<!-- Logs -->
				<div class="content-logs">
					{#if data.student.Log.length > 0}
						<div class="space-y-2">
							{#each data.student.Log as log}
								<div class="flex items-center gap-4 p-4 rounded-lg bg-surface-200-800 hover:bg-surface-300-700">
									<div class="flex-shrink-0">
										<Clock size={20} class="opacity-60" />
									</div>
									<div class="flex-1">
										<p class="font-semibold">
											{getActionLabel(log.action)}
											{#if log.party}
												- {log.party.name}
											{/if}
										</p>
										<p class="text-sm opacity-60">{formatDateTime(log.timestamp)}</p>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-12 opacity-60">
							<Clock size={48} class="mx-auto mb-4 opacity-40" />
							<p>Aucun historique trouvé</p>
						</div>
					{/if}
				</div>

				<!-- Invités parrainés -->
				{#if data.student.guests.length > 0}
				<div class="content-guests">
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each data.student.guests as guest}
							<div class="card bg-surface-200-800 p-4">
								<div class="flex items-center gap-3">
									<div class="bg-secondary-500 h-12 w-12 rounded-full flex items-center justify-center text-white font-bold">
										{guest.first_name.charAt(0)}{guest.last_name.charAt(0)}
									</div>
									<div>
										<p class="font-semibold">{guest.first_name} {guest.last_name.toUpperCase()}</p>
										<p class="text-sm opacity-60">Invité #{guest.id}</p>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.tabs {
		position: relative;
	}

	.tabs input[type="radio"] {
		display: none;
	}

	.tab-label {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		cursor: pointer;
		border-bottom: 2px solid transparent;
		transition: all 0.2s;
		font-weight: 500;
	}

	.tab-label:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.tabs input[type="radio"]:checked + .tab-label {
		border-bottom-color: rgb(var(--color-primary-500));
		color: rgb(var(--color-primary-500));
	}

	.tab-content {
		margin-top: 1.5rem;
	}

	.tab-content > div {
		display: none;
	}

	#tab-tickets:checked ~ .tab-content .content-tickets {
		display: block;
	}

	#tab-logs:checked ~ .tab-content .content-logs {
		display: block;
	}

	#tab-guests:checked ~ .tab-content .content-guests {
		display: block;
	}

	.table {
		border-collapse: collapse;
	}

	.table th {
		text-align: left;
		padding: 0.75rem;
		font-weight: 600;
	}

	.table td {
		padding: 0.75rem;
	}

	.badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		font-weight: 600;
	}
</style>