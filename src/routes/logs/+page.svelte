<script lang="ts">
	import Container from '$lib/components/Container.svelte'
	import DeviceMenu from '$lib/components/SearchBar.svelte'
	import { Calendar } from '@lucide/svelte';

	let { data } = $props()

	let search = $state('')
	let filteredLogs = $state(data.logs);

	let messages = $state([""]);

	function filter() {
		// const searchLower = search.toLowerCase();
		// filteredStudents = data.tickets.filter((d) =>
		// 	d.last_name.toLowerCase().includes(searchLower) ||
		// 	d.first_name.toLowerCase().includes(searchLower) ||
		// 	d.studentId.toString().includes(searchLower) ||
		// 	(d.isMember ? 'oui' : 'non').includes(searchLower)
		// );
		// filteredGuests = data.tickets.filter((d) =>
		// 	d.last_name.toLowerCase().includes(searchLower) ||
		// 	d.first_name.toLowerCase().includes(searchLower) ||
		// 	d.id.toString().includes(searchLower) ||
		// 	(d.guarantor != null ? d.guarantor.last_name.toLowerCase().includes(searchLower) : 'N/A'.includes(searchLower))
		// );
	}

	function formatTimestamp(timestamp: Date): string {
		const pad = (num: number) => num.toString().padStart(2, '0');

		const day = pad(timestamp.getDate());
		const month = pad(timestamp.getMonth() + 1); // Months are zero-based
		const year = timestamp.getFullYear();
		const hours = pad(timestamp.getHours());
		const minutes = pad(timestamp.getMinutes());
		const seconds = pad(timestamp.getSeconds());

		return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
	}
</script>

<Container>
	{#if !data.activeParty}
		<div class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
			<Calendar class="w-16 h-16 text-gray-400" />
			<h2 class="text-2xl font-bold text-gray-700">Aucune soirée active</h2>
			<p class="text-gray-500 text-center max-w-md">
				Il n'y a actuellement aucune soirée active. Contactez un administrateur pour créer et activer une soirée.
			</p>
		</div>
	{:else}
	<!-- Search bar -->
	<DeviceMenu bind:input_value={search} filter={filter}/>
	<!-- Modal for device creation -->
	<!--	<CreationModal bind:show={showCreateForm} />-->
	{#if filteredLogs.length > 0}
		<div class="table-wrap mt-5">
			<table class="table caption-bottom w-full text-xs sm:text-base">
				<thead class="font-bold">
				<tr class="bg-gray-200">
					<th>Heure</th>
					<th>Message</th>
				</tr>
				</thead>
				<tbody class="[&>tr]:hover:preset-tonal-primary">
				{#each filteredLogs as row}
					<tr>
						<td><a href="/">{formatTimestamp(row.timestamp)}</a></td>
						<td><a href="/">{ row.message }</a></td>
					</tr>
				{/each}
				</tbody>
				<tfoot>
				<tr class="bg-gray-200">
					<td colspan="1">Total</td>
					<td class="text-right">{filteredLogs.length} Elements</td>
				</tr>
				</tfoot>
			</table>
		</div>
	{:else}
		<div class="flex justify-center mt-5"><h1 class="text-xl">Aucun message</h1></div>
	{/if}
	{/if}
</Container>

<style>
    .table-wrap {
        display: block;
        max-height: 650px; /* Ajustez la hauteur selon vos besoins */
        overflow-y: auto;
    }

    .table {
        width: 100%;
        border-collapse: collapse;
    }

    thead th {
        font-weight: bold;
    }

    tbody tr:nth-child(even) {
        background-color: #f0f0f0;
    }

    thead, tfoot {
        background: #f9f9f9; /* Couleur de fond pour différencier */
        position: sticky;
        top: 0;
        z-index: 1;
    }

    tfoot {
        bottom: 0;
        top: auto;
    }
</style>

