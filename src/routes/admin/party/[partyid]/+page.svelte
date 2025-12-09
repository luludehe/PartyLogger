<script lang="ts">
	import { ArrowLeft, Calendar, Users, UserCheck, Clock, TrendingUp } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('fr-FR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function formatTime(date: Date | string) {
		return new Date(date).toLocaleTimeString('fr-FR', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatDateTime(date: Date | string) {
		return new Date(date).toLocaleString('fr-FR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getStatusBadge(party: any) {
		if (party.isActive && !party.isClosed) {
			return { text: 'Active', class: 'bg-green-500 text-white' };
		} else if (party.isClosed) {
			return { text: 'Terminée', class: 'bg-gray-500 text-white' };
		} else {
			return { text: 'Planifiée', class: 'bg-blue-500 text-white' };
		}
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

	const status = getStatusBadge(data.party);
</script>

<div class="container mx-auto p-6 max-w-7xl">
	<!-- Header -->
	<div class="flex items-center gap-4 mb-6">
		<a href="/admin/dashboard" class="btn preset-tonal-primary">
			<ArrowLeft size={20} />
			Retour
		</a>
		<h1 class="text-3xl font-bold flex-1">{data.party.name}</h1>
		<span class="badge {status.class} px-3 py-1 rounded-full text-sm font-semibold">
			{status.text}
		</span>
	</div>

	<!-- Informations générales -->
	<div class="card bg-surface-100-900 p-6 mb-6">
		<h2 class="text-xl font-bold mb-4 flex items-center gap-2">
			<Calendar size={24} />
			Informations générales
		</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
				<p class="text-sm opacity-60">Date de la soirée</p>
				<p class="text-lg font-semibold">{formatDate(data.party.date)}</p>
			</div>
			<div>
				<p class="text-sm opacity-60">Créée par</p>
				<p class="text-lg font-semibold">
					{data.party.creator.firstName} {data.party.creator.lastName}
				</p>
			</div>
			{#if data.party.startTime}
			<div>
				<p class="text-sm opacity-60">Heure de début</p>
				<p class="text-lg font-semibold">{formatTime(data.party.startTime)}</p>
			</div>
			{/if}
			{#if data.party.endTime}
			<div>
				<p class="text-sm opacity-60">Heure de fin</p>
				<p class="text-lg font-semibold">{formatTime(data.party.endTime)}</p>
			</div>
			{/if}
		</div>
	</div>

	<!-- Statistiques -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
		<div class="card bg-surface-100-900 p-6">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm opacity-60">Total tickets</h3>
				<Users size={20} class="opacity-60" />
			</div>
			<p class="text-3xl font-bold">{data.stats.totalTickets}</p>
		</div>
		
		<div class="card bg-surface-100-900 p-6">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm opacity-60">Étudiants</h3>
				<UserCheck size={20} class="opacity-60" />
			</div>
			<p class="text-3xl font-bold">{data.stats.studentTickets}</p>
			<p class="text-xs opacity-60 mt-1">{data.stats.studentsStillPresent} encore présent(s)</p>
		</div>
		
		<div class="card bg-surface-100-900 p-6">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm opacity-60">Invités</h3>
				<Users size={20} class="opacity-60" />
			</div>
			<p class="text-3xl font-bold">{data.stats.guestTickets}</p>
			<p class="text-xs opacity-60 mt-1">{data.stats.guestsStillPresent} encore présent(s)</p>
		</div>
		
		<div class="card bg-surface-100-900 p-6">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm opacity-60">Heure de pointe</h3>
				<TrendingUp size={20} class="opacity-60" />
			</div>
			{#if Object.keys(data.stats.ticketsByHour).length > 0}
				{@const peakHour = Object.entries(data.stats.ticketsByHour).reduce((a, b) => a[1] > b[1] ? a : b)}
				<p class="text-3xl font-bold">{peakHour[0]}h</p>
				<p class="text-xs opacity-60 mt-1">{peakHour[1]} entrées</p>
			{:else}
				<p class="text-3xl font-bold">-</p>
			{/if}
		</div>
	</div>

	<!-- Tabs: Tickets et Logs -->
	<div class="card bg-surface-100-900 p-6">
		<div class="tabs">
			<input type="radio" id="tab-tickets" name="tabs" checked />
			<label for="tab-tickets" class="tab-label">
				<Users size={18} />
				Tickets ({data.tickets.length})
			</label>
			
			<input type="radio" id="tab-logs" name="tabs" />
			<label for="tab-logs" class="tab-label">
				<Clock size={18} />
				Historique ({data.logs.length})
			</label>

			<div class="tab-content">
				<!-- Tickets -->
				<div class="content-tickets">
					{#if data.tickets.length > 0}
						<div class="overflow-x-auto">
							<table class="table w-full">
								<thead>
									<tr class="bg-surface-200-800">
										<th>Type</th>
										<th>Nom</th>
										<th>Prénom</th>
										<th>N°</th>
										<th>Entrée</th>
										<th>Sortie</th>
										<th>Statut</th>
									</tr>
								</thead>
								<tbody>
									{#each data.tickets as ticket}
										<tr class="hover:bg-surface-200-800">
											<td>
												{#if ticket.student}
													<span class="badge preset-tonal-primary">Étudiant</span>
												{:else}
													<span class="badge preset-tonal-secondary">Invité</span>
												{/if}
											</td>
											<td class="font-semibold">
												{#if ticket.student}
													{ticket.student.last_name.toUpperCase()}
												{:else if ticket.guest}
													{ticket.guest.last_name.toUpperCase()}
												{/if}
											</td>
											<td>
												{#if ticket.student}
													{ticket.student.first_name}
												{:else if ticket.guest}
													{ticket.guest.first_name}
												{/if}
											</td>
											<td>
												{#if ticket.student}
													{ticket.student.studentId}
												{:else if ticket.guest && ticket.guest.guarantor}
													Garant: {ticket.guest.guarantor.studentId}
												{/if}
											</td>
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
							<Users size={48} class="mx-auto mb-4 opacity-40" />
							<p>Aucun ticket pour cette soirée</p>
						</div>
					{/if}
				</div>

				<!-- Logs -->
				<div class="content-logs">
					{#if data.logs.length > 0}
						<div class="space-y-2">
							{#each data.logs as log}
								<div class="flex items-center gap-4 p-4 rounded-lg bg-surface-200-800 hover:bg-surface-300-700">
									<div class="flex-shrink-0">
										<Clock size={20} class="opacity-60" />
									</div>
									<div class="flex-1">
										<p class="font-semibold">
											{getActionLabel(log.action)}
											{#if log.student}
												- {log.student.first_name} {log.student.last_name.toUpperCase()} (N°{log.student.studentId})
											{:else if log.guest}
												- {log.guest.first_name} {log.guest.last_name.toUpperCase()} (Invité)
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
							<p>Aucun historique pour cette soirée</p>
						</div>
					{/if}
				</div>
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
