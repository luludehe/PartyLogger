<script lang="ts">
	import Container from '$lib/components/Container.svelte';
	import { BarChart3, Users, UserCheck, TrendingUp, Clock } from '@lucide/svelte';

	let { data } = $props();

	const hours = Array.from({ length: 24 }, (_, i) => i);
	const counts = hours.map((h) => data.ticketsByHour[h] || 0);
	const max = Math.max(...counts, 1);

	const studentPercentage = data.studentsCount > 0 
		? Math.round((data.studentsTickets / data.studentsCount) * 100) 
		: 0;
	const guestPercentage = data.guestsCount > 0 
		? Math.round((data.guestsTickets / data.guestsCount) * 100) 
		: 0;
</script>

<Container>
	<div class="mb-6">
		<h1 class="mb-2 text-3xl font-bold">Statistiques</h1>
		<p class="text-gray-600">Vue d'ensemble des participants et activités</p>
	</div>

	<!-- Cartes de statistiques -->
	<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		<!-- Total étudiants -->
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="mb-2 flex items-center justify-between">
				<h3 class="text-sm font-medium text-gray-500">Total Étudiants</h3>
				<Users class="text-blue-600" size={24} />
			</div>
			<div class="text-3xl font-bold">{data.studentsCount}</div>
		</div>

		<!-- Étudiants avec tickets -->
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="mb-2 flex items-center justify-between">
				<h3 class="text-sm font-medium text-gray-500">Étudiants présents</h3>
				<UserCheck class="text-green-600" size={24} />
			</div>
			<div class="text-3xl font-bold">{data.studentsTickets}</div>
			<div class="mt-2 text-sm text-gray-600">
				<span class="font-medium text-green-600">{studentPercentage}%</span> de participation
			</div>
		</div>

		<!-- Total invités -->
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="mb-2 flex items-center justify-between">
				<h3 class="text-sm font-medium text-gray-500">Total Invités</h3>
				<Users class="text-purple-600" size={24} />
			</div>
			<div class="text-3xl font-bold">{data.guestsCount}</div>
		</div>

		<!-- Invités avec tickets -->
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="mb-2 flex items-center justify-between">
				<h3 class="text-sm font-medium text-gray-500">Invités présents</h3>
				<TrendingUp class="text-orange-600" size={24} />
			</div>
			<div class="text-3xl font-bold">{data.guestsTickets}</div>
			<div class="mt-2 text-sm text-gray-600">
				<span class="font-medium text-orange-600">{guestPercentage}%</span> de participation
			</div>
		</div>
	</div>

	<!-- Graphique: Tickets par heure -->
	<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
		<div class="mb-6 flex items-center gap-2">
			<Clock class="text-blue-600" size={24} />
			<h2 class="text-xl font-bold">Entrées par heure</h2>
		</div>

		{#if max > 0}
			<div class="histogram">
				{#each counts as count, i}
					<div class="bar-container">
						<div
							class="bar"
							style="height: {(count / max) * 100}%;"
							title="{hours[i]}h: {count} entrée{count > 1 ? 's' : ''}"
						>
							{#if count > 0}
								<span class="bar-value">{count}</span>
							{/if}
						</div>
						<div class="bar-label">{hours[i]}h</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="flex h-64 items-center justify-center text-gray-400">
				<div class="text-center">
					<BarChart3 class="mx-auto mb-2" size={48} />
					<p>Aucune donnée disponible</p>
				</div>
			</div>
		{/if}
	</div>

	<!-- Barres de progression -->
	<div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
		<!-- Participation étudiants -->
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h3 class="mb-4 text-lg font-semibold">Participation étudiants</h3>
			<div class="mb-2 flex justify-between text-sm">
				<span>{data.studentsTickets} présents</span>
				<span class="font-medium">{studentPercentage}%</span>
			</div>
			<div class="h-4 overflow-hidden rounded-full bg-gray-200">
				<div
					class="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
					style="width: {studentPercentage}%"
				></div>
			</div>
			<p class="mt-2 text-sm text-gray-600">Sur {data.studentsCount} étudiants inscrits</p>
		</div>

		<!-- Participation invités -->
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h3 class="mb-4 text-lg font-semibold">Participation invités</h3>
			<div class="mb-2 flex justify-between text-sm">
				<span>{data.guestsTickets} présents</span>
				<span class="font-medium">{guestPercentage}%</span>
			</div>
			<div class="h-4 overflow-hidden rounded-full bg-gray-200">
				<div
					class="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
					style="width: {guestPercentage}%"
				></div>
			</div>
			<p class="mt-2 text-sm text-gray-600">Sur {data.guestsCount} invités enregistrés</p>
		</div>
	</div>
</Container>

<style>
	.histogram {
		display: flex;
		align-items: flex-end;
		height: 300px;
		gap: 8px;
		margin: 2rem 0;
		padding: 0 1rem;
	}

	.bar-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 0;
	}

	.bar {
		width: 100%;
		max-width: 40px;
		min-height: 4px;
		background: linear-gradient(to top, #3b82f6, #60a5fa);
		border-radius: 4px 4px 0 0;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		transition: all 0.3s ease;
		position: relative;
		cursor: pointer;
	}

	.bar:hover {
		background: linear-gradient(to top, #2563eb, #3b82f6);
		transform: scaleY(1.05);
	}

	.bar-value {
		position: absolute;
		top: -20px;
		font-size: 0.75rem;
		font-weight: 600;
		color: #1f2937;
	}

	.bar-label {
		font-size: 0.7rem;
		text-align: center;
		margin-top: 0.5rem;
		color: #6b7280;
		font-weight: 500;
	}
</style>