<script lang="ts">
	import Container from '$lib/components/Container.svelte'
	import DeviceMenu from '$lib/components/SearchBar.svelte'
	import { Tabs } from '@skeletonlabs/skeleton-svelte';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { Segment } from '@skeletonlabs/skeleton-svelte';

	let search = $state('');
	let group = $state('students');
	const studentList = writable([]);
	const guestList = writable([]);
	const filteredStudents = writable([]);
	const filteredGuests = writable([]);

	async function fetchLists() {
		try {
			const [studentsRes, guestsRes] = await Promise.all([
				fetch('/api/students'),
				fetch('/api/guests')
			]);
			if (!studentsRes.ok || !guestsRes.ok) {
				throw new Error('Failed to fetch lists');
			}
			const students = await studentsRes.json();
			const guests = await guestsRes.json();
			studentList.set(students);
			guestList.set(guests);
			filter();
		} catch (error) {
			console.error('Error fetching lists:', error);
			errorMessage.set('Erreur lors de la récupération des listes. Veuillez réessayer plus tard.');
		}
	}

	onMount(() => {
		fetchLists();
	});

	function filter() {
		const searchLower = search.toLowerCase();
		studentList.update(students => {
			filteredStudents.set(students.filter(d =>
				d.last_name.toLowerCase().includes(searchLower) ||
				d.first_name.toLowerCase().includes(searchLower) ||
				d.studentId.toString().includes(searchLower) ||
				(d.isMember ? 'oui' : 'non').includes(searchLower)
			));
			return students;
		});
		guestList.update(guests => {
			filteredGuests.set(guests.filter(d =>
				d.last_name.toLowerCase().includes(searchLower) ||
				d.first_name.toLowerCase().includes(searchLower) ||
				d.id.toString().includes(searchLower) ||
				(d.guarantor != null ? d.guarantor.last_name.toLowerCase().includes(searchLower) : 'N/A'.includes(searchLower))
			));
			return guests;
		});
	}

	async function createTicket(type: 'student' | 'guest', id: number) {
		try {
			const response = await fetch('/api/tickets/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ type, id }),
			});

			if (!response.ok) {
				throw new Error('Failed to create ticket');
			}

			const result = await response.json();
			console.log('Ticket created successfully:', result);
			await fetchLists()
		} catch (error) {
			console.error('Error creating ticket:', error);
		}
	}

	async function deleteTicket(type: 'student' | 'guest', id: number) {
		try {
			const response = await fetch('/api/tickets/delete', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ type, id }),
			});

			if (!response.ok) {
				throw new Error('Failed to delete ticket');
			}

			const result = await response.json();
			console.log('Ticket deleted successfully:', result);
			await fetchLists()
		} catch (error) {
			console.error('Error deleting ticket:', error);
		}
	}

	async function updateExitTicket(type: 'student' | 'guest', id: number) {
		try {
			const response = await fetch('/api/tickets/leave', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ type, id }),
			});

			if (!response.ok) {
				throw new Error('Failed to update exit ticket');
			}

			const result = await response.json();
			console.log('Ticket updated successfully:', result);
			await fetchLists()
		} catch (error) {
			console.error('Error updating ticket:', error);
		}
	}

	function handleGetTicketClick(id :number) {
		if (group === 'students') {
			console.log("Request ticket for student with ID:", id);
			createTicket('student', id);
		} else {
			console.log("Request ticket for guest with ID:", id);
			createTicket('guest', id);
		}
	}
	function handleDeleteTicketClick(id :number) {
		if (group === 'students') {
			console.log("Delete ticket for student with ID:", id);
			deleteTicket('student', id);
		} else {
			console.log("Delete ticket for guest with ID:", id);
			deleteTicket('guest', id);
		}
	}
	function handleExitTicketClick(id :number) {
		if (group === 'students') {
			console.log("Mark student with ID:", id, "as exited");
			updateExitTicket('student', id);
		} else {
			console.log("Mark guest with ID:", id, "as exited");
			updateExitTicket('guest', id);
		}
	}

	let openState = $state(false);
	let choice: string = $state('');

	function modalClose() {
		openState = false;
		choice = '';
	}
	function modalConfirm(id:number) {
		if (choice === 'exit') {
			handleExitTicketClick(id);
		} else if (choice === 'delete') {
			handleDeleteTicketClick(id)
		}
		openState = false;
	}
</script>

<Container>
	<!-- Search bar -->
	<DeviceMenu bind:input_value={search} filter={filter}/>
	<!-- Modal for device creation -->
<!--	<CreationModal bind:show={showCreateForm} />-->

	{#if filteredStudents && filteredGuests}
	<Tabs value={group} onValueChange={(e) => (group = e.value)} listJustify="justify-center" classes="mt-5">
		{#snippet list()}
			<Tabs.Control value="students">Étudiants ({$studentList.length})</Tabs.Control>
			<Tabs.Control value="guests">Invités ({$guestList.length})</Tabs.Control>
		{/snippet}
		{#snippet content()}
			<Tabs.Panel value="students">
				{#if $filteredStudents.length > 0}
				<div class="table-wrap">
					<table class="table caption-bottom w-full text-xs sm:text-base">
						<thead class="font-bold">
						<tr class="bg-gray-200">
							<th>NOM</th>
							<th>Prénom</th>
							<th>N°</th>
							<th>Adhérent</th>
							<th class="!text-right">Action</th>
						</tr>
						</thead>
						<tbody class="[&>tr]:hover:preset-tonal-primary">
						{#each $filteredStudents as row}
							<tr>
								<td><a href="/student/{row.studentId}">{row.last_name.toUpperCase()}</a></td>
								<td><a href="/student/{row.studentId}">{row.first_name}</a></td>
<!--								<td><a href="/student/{row.studentId}">22204444</a></td>-->
								<td><a href="/student/{row.studentId}">{row.studentId}</a></td>
								<td>{row.isMember? "Oui" : "Non"}</td>
								<!--  Desktop view  -->
								<td class="text-right">
									{#if row.ticket != null}
										{#if row.ticket.entryAt == row.ticket.exitAt }
<!--										<button class="btn btn-sm btn-primary" onclick={() => handleDeleteTicketClick(row.id)}>Supprimer</button> | <button class="btn btn-sm btn-primary" disabled onclick={() => handleDeleteTicketClick(row.id)}>Parti(e)</button>-->
											<Modal
												open={openState}
												onOpenChange={(e) => (openState = e.open)}
												triggerBase="btn btn-sm btn-primary"
												contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
												backdropClasses="backdrop-blur-sm"
											>
												{#snippet trigger()}Modifier{/snippet}
												{#snippet content()}
													<header class="flex justify-between">
														<h2 class="h2">Actions sur {row.first_name} { row.last_name.toUpperCase()}</h2>
													</header>
													<article>
														<p class="opacity-60">
															Que voulez-vous faire ? Vous pouvez choisir de supprimer le ticket ou de marquer l'étudiant comme parti(e).
														</p>
														<div class="flex justify-center py-5">
															<Segment name="align" value={choice} onValueChange={(e) => (choice = e.value)}>
																<Segment.Item value="exit">
	<!--																<LogOut>Parti(e)</LogOut>-->
																	Déclarer parti(e)
																</Segment.Item>
																<Segment.Item value="delete">
	<!--																<Trash2>Supprimer</Trash2>-->
																	Supprimer le ticket
																</Segment.Item>
															</Segment>
														</div>
													</article>
													<footer class="flex justify-end gap-4">
														<button type="button" class="btn preset-tonal" onclick={modalClose}>Annuler</button>
														<button type="button" class="btn preset-filled" onclick={() => modalConfirm(row.id)}>Confirmer</button>
													</footer>
												{/snippet}
											</Modal>
										{:else}
											<button class="btn btn-sm btn-primary" disabled>Parti(e)</button>
										{/if}
									{:else}
										<button class="btn btn-sm btn-primary" onclick={() => handleGetTicketClick(row.id)}>Ajouter</button>
									{/if}
								</td>
							</tr>
						{/each}
						</tbody>
						<tfoot>
						<tr class="bg-gray-200">
							<td colspan="4">Total</td>
							<td class="text-right">{filteredStudents.length} Elements</td>
						</tr>
						</tfoot>
					</table>
				</div>
				{:else}
				<div class="flex justify-center"><h1 class="text-xl">Aucun étudiant</h1></div>
				{/if}
			</Tabs.Panel>
			<Tabs.Panel value="guests">
				{#if $filteredGuests.length > 0}
					<div class="table-wrap">
						<table class="table caption-bottom w-full text-xs sm:text-base">
							<thead>
							<tr class="bg-gray-200">
								<th>NOM</th>
								<th>Prénom</th>
								<th>N°</th>
								<th>Garant</th>
								<th class="!text-right">Action</th>
							</tr>
							</thead>
							<tbody class="[&>tr]:hover:preset-tonal-primary">
							{#each $filteredGuests as row}
								<tr>
									<td>{row.last_name.toUpperCase()}</td>
									<td>{row.first_name}</td>
									<td>{row.id}</td>
									{#if row.guarantor != null}
										<td><a href="/student/{row.guarantor.studentId}">{row.guarantor.last_name.toUpperCase()}</a></td>
									{:else}
										<td>N/A</td>
									{/if}
									<td class="text-right">
										{#if row.ticket != null}
											<button class="btn btn-sm btn-primary" onclick={() => handleDeleteTicketClick(row.id)}>Supprimer</button>
										{:else}
											<button class="btn btn-sm btn-primary" onclick={() => handleGetTicketClick(row.id)}>Ajouter</button>
										{/if}
									</td>
								</tr>
							{/each}
							</tbody>
							<tfoot>
							<tr class="bg-gray-200">
								<td colspan="4">Total</td>
								<td class="text-right">{$filteredGuests.length} Elements</td>
							</tr>
							</tfoot>
						</table>
					</div>
				{:else}
					<div class="flex justify-center"><h1 class="text-xl">Aucun invité</h1></div>
				{/if}
			</Tabs.Panel>
		{/snippet}
	</Tabs>
	{:else}
		<div class="flex justify-center items-center my-24">
			<div role="status">
				<svg aria-hidden="true" class="inline w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
					<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
				</svg>
				<span class="sr-only">Loading...</span>
			</div>
		</div>
	{/if}
</Container>

<style>
    .table-wrap {
				margin-top: -1rem ;
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

