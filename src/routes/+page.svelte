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

<section class="max-w-screen bg-gray-100">
	<div class="navbar bg-base-100 fixed top-0 z-50">
		<div class="navbar-start">
			<a class="btn btn-ghost text-xl">Suivi 01/03/2025</a>
		</div>
		<div class="navbar-end">
			<button class="btn" on:click={() => document.getElementById('my_modal_5').showModal()}>Ajouter un exté</button>    <dialog id="my_modal_5" class="modal modal-bottom sm:modal-middle">
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

	<div class="h-screen pt-16 w-full overflow-x-auto">
		<div class="container mx-auto px-2">
			<table class="table-md md:table w-full">
				<thead>
				<tr>
					<th class="w-16">#</th>
					<th class="w-2/6">NOM</th>
					<th class="w-2/6">Prénom</th>
					<th class="w-1/6">Tarif</th>
					<th class="w-1/12">Ticket</th>
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
						<td on:click={() => handleCreateStudentTicket(Number(student.id))} class="ticket-cell">{student.ticket ? "✅" : "➕"}</td>
					</tr>
				{/each}
				</tbody>
			</table>

			<h3 class="text-2xl text-center pt-9 pb-4 font-bold w-full">Invités extérieurs</h3>

			<table class="table-md md:table w-full">
				<thead>
				<tr>
					<th class="w-16">#</th>
					<th class="w-2/6">NOM</th>
					<th class="w-2/6">Prénom</th>
					<th class="w-1/6">Garant</th>
					<th class="w-1/12">Ticket</th>
				</tr>
				</thead>
				<tbody>
				{#each data.guests as guest, i}
					<tr class="{guest.ticket ? 'ticket' : 'non-ticket'}">
						<th>{i+1}</th>
						<td>{guest.last_name}</td>
						<td>{guest.first_name}</td>
						<td>{guest.guarantor ? guest.guarantor.last_name : "N/A"}</td>
						<td on:click={() => handleCreateGuestTicket(Number(guest.id))} class="ticket-cell">{guest.ticket ? "✅" : "➕"}</td>
					</tr>
				{/each}
				</tbody>
			</table>
		</div>
	</div>
</section>

<style>
    section {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
    }

    table, th, td {
        text-align: center;
    }

    table {
        table-layout: fixed; /* Important pour que les largeurs des colonnes soient respectées */
        width: 100%;
        border-collapse: collapse;
    }

    /* Définition des largeurs spécifiques */
    th:first-child {
        width: 50px; /* Colonne d'index élargie */
    }

    th:last-child, td:last-child {
        width: 60px; /* Colonne Ticket réduite */
    }

    .ticket-cell {
        min-width: 50px;
        cursor: pointer;
    }

    th, td {
        padding: 1rem 0.5rem; /* Padding vertical augmenté de 0.75rem à 1rem */
        white-space: normal; /* Permet le passage à la ligne */
        vertical-align: middle;
        min-height: 60px; /* Hauteur minimale augmentée de 50px à 60px */
        height: 60px; /* Hauteur fixe ajoutée */
        hyphens: none; /* Empêche la coupure des mots */
        word-break: normal; /* Pas de césure dans les mots */
    }

    tr {
        height: 60px; /* Hauteur fixe pour les lignes */
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

    h1, h3 {
        width: 100%;
    }

    /* Styles spécifiques pour mobile */
    @media (max-width: 640px) {
        .container {
            padding: 0;
            max-width: 100%;
        }

        table {
            width: 100%;
        }

        th, td {
            padding: 0.75rem 0.25rem; /* Padding vertical maintenu plus grand sur mobile */
            font-size: 0.9rem;
            min-height: 55px; /* Hauteur minimale légèrement réduite mais toujours confortable */
            height: 55px;
        }

        tr {
            height: 55px;
        }

        /* Distribution optimisée pour petit écran */
        th:first-child, td:first-child {
            width: 40px; /* Colonne de numérotation */
        }

        th:last-child, td:last-child {
            width: 50px; /* Colonne Ticket encore plus réduite sur mobile */
        }

        th:nth-child(4), td:nth-child(4) {
            width: 15%; /* Colonne Tarif/Garant réduite */
        }

        th:nth-child(2), td:nth-child(2),
        th:nth-child(3), td:nth-child(3) {
            width: 30%; /* Colonnes NOM et Prénom */
        }
    }
</style>