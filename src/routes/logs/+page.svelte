<script lang="ts">
	import type { PageData } from './$types'
	export let data: PageData

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

<section class="max-w-screen overflow-y-auto bg-gray-100">
	<div class="navbar bg-base-100 fixed top-0 z-50">
		<div class="navbar-start">
			<a class="btn btn-ghost text-xl">Suivi 01/03/2025</a>
		</div>
	</div>

	<div class="h-screen pt-16 overflow-x-clip">
		<table class="table-md md:table w-screen">
			<thead>
			<tr>
				<th>Heure</th>
				<th>Information</th>
			</tr>
			</thead>
			<tbody>
			<!-- row 1 -->
			{#each data.tickets as ticket}
				<tr>
					<td>{formatTimestamp(ticket.timestamp)}</td>
					{#if ticket.owner}
						<td>Arrivée de l'étudiant(e) {ticket.owner.isMember ? "cotisant(e)" : "" } {ticket.owner.first_name + " " + ticket.owner.last_name}</td>
						{:else}
						{#if ticket.guest}
							<td>Arrivée de l'invité(e) {ticket.guest.first_name + " " + ticket.guest.last_name}. Son/sa garant(e) est {ticket.guest.guarantor.first_name + " " + ticket.guest.guarantor.last_name}</td>
						{/if}
					{/if}
				</tr>
			{/each}
			</tbody>
		</table>
	</div>
</section>

<style>
    section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        /*flex: 0.6;*/
    }

    table, th, td {
        text-align: center;
    }

    table tbody tr:nth-child(odd) {
        --tw-bg-opacity: 1;
        background-color: rgb(210 210 210 / var(--tw-bg-opacity, 1)) !important;
    }

    .navbar a {
        text-decoration: none;
    }

    h1 {
        width: 100%;
    }

</style>