<script lang="ts">
	import type { PageData } from './$types'
	import { onMount } from 'svelte'
	export let data: PageData

	let lastName = '';
	let firstName = '';
	let guarantorName: string | null = null;

	async function handleCreateGuest() {
		try {
			const guarantor = data.students.find(g => `${g.last_name} ${g.first_name}` === guarantorName);
			const guarantorId = guarantor ? guarantor.id : null;

			const response = await fetch('/create-guest', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ lastName, firstName, guarantorId }),
			});
			if (!response.ok) {
				throw new Error('Failed to create guest');
			}
			// Handle success (e.g., refresh the page or update the UI)
		} catch (error) {
			console.error(error);
		}
		// Refresh the page
		location.reload();
	}

	async function handleCreateStudentTicket(studentId: number) {
		try {
			const response = await fetch('/create-student-ticket', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ studentId }),
			});
			if (!response.ok) {
				throw new Error('Failed to create student ticket');
			}
			// Handle success (e.g., refresh the page or update the UI)
		} catch (error) {
			console.error(error);
		}
		//refresh the page
		location.reload();
	}

	async function handleCreateGuestTicket(guestId: number) {
		try {
			const response = await fetch('/create-guest-ticket', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ guestId }),
			});
			if (!response.ok) {
				throw new Error('Failed to create guest ticket');
			}
			// Handle success (e.g., refresh the page or update the UI)
		} catch (error) {
			console.error(error);
		}
		//refresh the page
		location.reload();
	}
</script>

<section class="max-w-screen overflow-y-auto bg-gray-100">
	<div class="navbar bg-base-100 fixed top-0 z-50">
		<div class="navbar-start">
			<a class="btn btn-ghost text-xl">Suivi 01/03/2025</a>
		</div>
		<div class="navbar-end">
			<button class="btn" on:click={() => document.getElementById('my_modal_5').showModal()}>Ajouter un exté</button>			<dialog id="my_modal_5" class="modal modal-bottom sm:modal-middle">
				<div class="modal-box">
					<h3 class="text-lg font-bold pb-2">Formulaire d'ajout</h3>
					<div class="label">
						<span class="label-text">NOM</span>
					</div>
					<input
						type="text"
						bind:value={lastName}
						placeholder="DUPONT"
						class="input input-bordered input-accent w-full max-w-xs" />
					<div class="label">
						<span class="label-text">Prénom</span>
					</div>
					<input
						type="text"
						bind:value={firstName}
						placeholder="Jean"
						class="input input-bordered input-accent w-full max-w-xs" />
<!--					<div class="label">-->
<!--						<span class="label-text">Commentaire</span>-->
<!--					</div>-->
<!--					<textarea class="textarea textarea-bordered textarea-accent h-24" placeholder="Étudiant venant de l'IUT de Mulhouse..."></textarea>-->
					<div class="label">
						<span class="label-text">Sélectionnez un garant</span>
					</div>
					<input
						list="guarantors"
						bind:value={guarantorName}
						placeholder="Sélectionner un garant"
						class="input input-bordered input-accent w-full max-w-xs" />
					<datalist id="guarantors">
						{#each data.students as guarantor}
							<option value={guarantor.last_name + " " +guarantor.first_name}>{guarantor.last_name} {guarantor.first_name}</option>
						{/each}
					</datalist>
					<div class="modal-action">
						<form method="dialog">
							<button class="btn" on:click={handleCreateGuest()}>Ajouter</button>
						</form>
					</div>
				</div>
			</dialog>
		</div>
	</div>

	<div class="h-screen pt-16 overflow-x-clip">
		<table class="table-md md:table w-screen">
			<thead>
			<tr>
				<th></th>
				<th>NOM</th>
				<th>Prénom</th>
				<th>Tarif</th>
				<th>Ticket</th>
			</tr>
			</thead>
			<tbody>
			<!-- row 1 -->
			{#each data.students as student, i}
				<tr class="{student.ticket ? 'ticket' : 'non-ticket'}">
					<th>{i+1}</th>
					<td>{student.last_name}</td>
					<td>{student.first_name}</td>
					<td>{student.isMember ? "Adhérent" : "Normal"}</td>
					<td on:click={() => handleCreateStudentTicket(Number(student.id))} >{student.ticket ? "✅" : "➕​"}</td>
				</tr>
			{/each}
			</tbody>
		</table>

		<h3 class="text-2xl text-center pt-9 pb-4 font-bold w-screen">Invités extérieurs</h3>

		<table class="table-md md:table w-screen">
			<thead>
			<tr>
				<th></th>
				<th>NOM</th>
				<th>Prénom</th>
				<th>Garant</th>
				<th>Ticket</th>
			</tr>
			</thead>
			<tbody>
			{#each data.guests as guest, i}
				<tr class="{guest.ticket ? 'ticket' : 'non-ticket'}">
					<th>{i+1}</th>
					<td>{guest.last_name}</td>
					<td>{guest.first_name}</td>
					<td>{guest.guarantor ? guest.guarantor.last_name : "N/A"}</td>
					<td on:click={() => handleCreateGuestTicket(Number(guest.id))} >{guest.ticket ? "✅" : "➕​"}</td>
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

	table tbody .ticket{
			--tw-bg-opacity: 1;
      background-color: rgb(134 239 172 / var(--tw-bg-opacity, 1)) !important;
	}

	table tbody .non-ticket{
			--tw-bg-opacity: 1;
			background-color: rgb(252 165 165 / var(--tw-bg-opacity, 1)) !important;
	}

	.navbar a {
			text-decoration: none;
	}

	h1 {
		width: 100%;
	}

</style>
