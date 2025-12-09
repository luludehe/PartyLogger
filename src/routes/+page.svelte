<script lang="ts">
	import Container from '$lib/components/Container.svelte'
	import DeviceMenu from '$lib/components/SearchBar.svelte'
	import { Tabs } from '@skeletonlabs/skeleton-svelte';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { Segment } from '@skeletonlabs/skeleton-svelte';
	import { User, CaseUpper, CaseSensitive, Check, CircleX, Calendar } from '@lucide/svelte';

	let toastMessage = $state('');
	let toastType = $state<'success' | 'error'>('success');
	let showToast = $state(false);

	function showToastMessage(message: string, type: 'success' | 'error' = 'success') {
		toastMessage = message;
		toastType = type;
		showToast = true;
		setTimeout(() => {
			showToast = false;
		}, 3000);
	}

	let { data = { students: [], guests: [], activeParty: null } }: { data?: { students: any[]; guests: any[]; activeParty: any } } = $props();

	let search: string = $state('');
	let group = $state('students');
	const studentList = writable<Array<{ id: number, studentId: number; last_name: string; first_name: string; isMember: boolean; ticket?: any }>>([]);
	const guestList = writable<Array<{ id: number; last_name: string; first_name: string; guarantor?: { studentId: number; last_name: string; first_name: string }; ticket?: any }>>([]);
	const filteredStudents = writable<Array<{ id: number, studentId: number; last_name: string; first_name: string; isMember: boolean; ticket?: any }>>([]);
	const filteredGuests = writable<Array<{ id: number; last_name: string; first_name: string; guarantor?: { studentId: number; last_name: string; first_name: string }; ticket?: any }>>([]);
	const errorMessage = writable<string>('');
	async function fetchLists() {
		// Don't fetch if no active party
		if (!data?.activeParty) {
			studentList.set([]);
			guestList.set([]);
			filteredStudents.set([]);
			filteredGuests.set([]);
			return;
		}
		
		try {
			const [studentsRes, guestsRes] = await Promise.all([
				fetch('/api/students'),
				fetch('/api/guests/get')
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
				const errorData = await response.json();
				console.error('Server error:', response.status, errorData);
				throw new Error(`Failed to create ticket: ${errorData.error || response.statusText}`);
			}

			const result = await response.json();
			console.log('Ticket created successfully:', result);
			await fetchLists();
			showToastMessage('Ticket créé avec succès', 'success');
		} catch (error) {
			console.error('Error creating ticket:', error);
			// showToastMessage(error.message || 'Erreur lors de la création du ticket', 'error');
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

	let actionsModalOpen = $state(false);
	let selectedPersonId = $state<number | null>(null);
	let selectedPersonType = $state<'student' | 'guest'>('student');
	let selectedPersonName = $state('');
	let choice: string = $state('');

	function openActionsModal(id: number, firstName: string, lastName: string, type: 'student' | 'guest') {
		selectedPersonId = id;
		selectedPersonType = type;
		selectedPersonName = `${firstName} ${lastName.toUpperCase()}`;
		actionsModalOpen = true;
	}

	function actionsModalClose() {
		actionsModalOpen = false;
		selectedPersonId = null;
		selectedPersonName = '';
		choice = '';
	}
	function actionsModalConfirm() {
		if (selectedPersonId === null) return;
		
		if (choice === 'exit') {
			updateExitTicket(selectedPersonType, selectedPersonId);
		} else if (choice === 'delete') {
			deleteTicket(selectedPersonType, selectedPersonId);
		}
		actionsModalOpen = false;
		selectedPersonId = null;
		selectedPersonName = '';
		choice = '';
	}

	let newGuestModalOpen = $state(false);

	function newGuestModalClose() {
		newGuestModalOpen = false;
		guestLastName = '';
		guestFirstName = '';
		guarantorName = '';
		guarantorId = null;
		showValidationGuarantor = false;
		return 1;
	}

	let guarantorName = $state('');
	let guarantorId: number | null = $state(null);

	function handleGuarantorInput(e: Event) {
		showValidationGuarantor = true;
		const value = (e.target as HTMLInputElement).value;
		guarantorName = value;
		const student = $studentList.find(
			s => (s.last_name.toUpperCase() + ' ' + s.first_name) === value
		);
		guarantorId = student ? student.id : null;
	}

	function isGuarantorValid() {
		return $studentList.some(
			s => (s.last_name.toUpperCase() + ' ' + s.first_name) === guarantorName
		);
	}
	let showValidationGuarantor = $state(false);
	let guestLastName = $state('');
	let guestFirstName = $state('');
	async function newGuestModalSend() {
		if (!guestLastName || !guestFirstName || !guarantorId || !isGuarantorValid()) {
			errorMessage.set('Veuillez remplir tous les champs et sélectionner un garant valide.');
			return;
		}

		try {
			const response = await fetch('/api/guests/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					lastName: guestLastName,
					firstName: guestFirstName,
					guarantorId
				})
			});
			if (!response.ok) throw new Error('Erreur lors de la création');
			await fetchLists();
			newGuestModalOpen = false;
			guestLastName = '';
			guestFirstName = '';
			guarantorName = '';
			guarantorId = null;
			showValidationGuarantor = false;
		} catch (e) {
			errorMessage.set('Erreur lors de la création de l\'invité');
		}
	}
</script>

<Container>
	{#if !data?.activeParty}
		<div class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
			<Calendar class="w-16 h-16 text-gray-400" />
			<h2 class="text-2xl font-bold text-gray-700">Aucune soirée active</h2>
			<p class="text-gray-500 text-center max-w-md">
				Il n'y a actuellement aucune soirée active. Contactez un administrateur pour créer et activer une soirée.
			</p>
		</div>
	{:else}
	<!-- Search bar -->
	<DeviceMenu bind:input_value={search} filter={filter} bind:ModalOpen={newGuestModalOpen}/>
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
											<button class="btn btn-sm btn-primary" onclick={() => openActionsModal(row.id, row.first_name, row.last_name, 'student')}>Modifier</button>
										{:else}
											<button class="btn btn-sm btn-primary" disabled>Parti(e)</button>
										{/if}
									{:else}
										<button class="btn btn-sm btn-primary" onclick={() => createTicket('student', row.id)}>Ajouter</button>
									{/if}
								</td>
							</tr>
						{/each}
						</tbody>
						<tfoot>
						<tr class="bg-gray-200">
							<td colspan="4">Total</td>
							<td class="text-right">{$filteredStudents.length} Elements</td>
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
											{#if row.ticket.entryAt == row.ticket.exitAt }
												<button class="btn btn-sm btn-primary" onclick={() => openActionsModal(row.id, row.first_name, row.last_name, 'guest')}>Modifier</button>
											{:else}
												<button class="btn btn-sm btn-primary" disabled>Parti(e)</button>
											{/if}
										{:else}
											<button class="btn btn-sm btn-primary" onclick={() => createTicket('guest', row.id)}>Ajouter</button>
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
	{/if}
</Container>

<Modal
	open={actionsModalOpen}
	onOpenChange={(e) => (actionsModalOpen = e.open)}
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
	backdropClasses="backdrop-blur-sm"
>
	{#snippet content()}
		<header class="flex justify-between">
			<h2 class="h2">Actions sur {selectedPersonName}</h2>
		</header>
		<article>
			<p class="opacity-60">
				Que voulez-vous faire ? Vous pouvez choisir de supprimer le ticket ou de marquer la personne comme partie.
			</p>
			<div class="flex justify-center py-5">
				<Segment name="align" value={choice} onValueChange={(e) => (choice = e.value)}>
					<Segment.Item value="exit">
						Déclarer parti(e)
					</Segment.Item>
					<Segment.Item value="delete">
						Supprimer le ticket
					</Segment.Item>
				</Segment>
			</div>
		</article>
		<footer class="flex justify-end gap-4">
			<button type="button" class="btn preset-tonal" onclick={actionsModalClose}>Annuler</button>
			<button type="button" class="btn preset-filled" onclick={actionsModalConfirm}>Confirmer</button>
		</footer>
	{/snippet}
</Modal>

<Modal
	open={newGuestModalOpen}
	onOpenChange={(e) => (newGuestModalOpen = e.open)}
	triggerBase="btn btn-sm btn-primary"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
	backdropClasses="backdrop-blur-sm"
>
	{#snippet content()}
		<header class="flex justify-between">
			<h2 class="h2">Ajout d'un externe</h2>
		</header>
		<article>
			<p class="opacity-60">
				Vous pouvez ajouter un externe en remplissant les champs suivants. Assurez-vous de fournir les informations correctes. Tous les champs sont obligatoires.
			</p>
			<h4 class="pt-4">Informations sur l'externe</h4>
			<div class="flex gap-4 justify-center py-5">
				<div class="input-group grid-cols-[auto_1fr_auto]">
					<div class="ig-cell preset-tonal">
						<CaseSensitive size={16} />
					</div>
					<input class="ig-input" type="text" placeholder="Jean" required bind:value={guestFirstName}/>
				</div>
				<div class="input-group grid-cols-[auto_1fr_auto]">
					<div class="ig-cell preset-tonal">
						<CaseUpper size={16} />
					</div>
					<input class="ig-input" type="text" placeholder="DUPONT" required bind:value={guestLastName}/>
				</div>
			</div>
			<h4 class="pt-4">Informations sur le garant</h4>
			<div class="flex gap-4 justify-center py-5">
				<div class="input-group grid-cols-[auto_1fr_auto]">
					<div class="ig-cell preset-tonal">
						<User size={16} />
					</div>
					<input
						class="ig-input"
						type="text"
						placeholder="NOM Prénom"
						list="students"
						bind:value={guarantorName}
						oninput={handleGuarantorInput}
						required
					/>
					{#if (guarantorName !== '' || showValidationGuarantor) && isGuarantorValid()}
						<div class="ig-cell bg-green-500">
							<Check size={16} />
						</div>
					{/if}
					{#if (guarantorName !== '' || showValidationGuarantor) && !isGuarantorValid()}
						<div class="ig-cell bg-red-500">
							<CircleX size={16} />
						</div>
					{/if}
					<datalist id="students">
						{#each $studentList as student}
							<option value={student.last_name.toUpperCase() + ' ' + student.first_name} data-id={student.studentId}></option>
						{/each}
					</datalist>
					{#if guarantorId !== null}
						<input type="hidden" value={guarantorId} />
					{/if}
				</div>
			</div>
		</article>
		<footer class="flex justify-end gap-4">
			<button type="button" class="btn preset-tonal" onclick={() => newGuestModalClose()}>Annuler</button>
			<button type="button" class="btn preset-filled" onclick={() => newGuestModalSend()}>Confirmer</button>
		</footer>
	{/snippet}
</Modal>

<style>
    .table-wrap {
				margin-top: -1rem ;
        display: block;
        max-height: 600px; /* Ajustez la hauteur selon vos besoins */
        overflow-y: auto;
    }
    @media (width <= 40rem /* 640px */) {
        .table-wrap {
            max-height: calc(100vh - 154px - 6rem);
				}
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

    .toast-notification {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 9999;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    }

    .toast-success {
        background-color: #10b981;
        color: white;
    }

    .toast-error {
        background-color: #ef4444;
        color: white;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
</style>

{#if showToast}
	<div class="toast-notification toast-{toastType}">
		{toastMessage}
	</div>
{/if}
