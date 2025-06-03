<script lang="ts">
	import Container from '$lib/components/Container.svelte';

	let { data } = $props();

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

	let spe_color = {
		"ASE": "bg-cyan-300",
		"IR" : "bg-red-300",
		"T&F": "bg-yellow-300",
		"Méca": "bg-purple-300",
		"GI": "bg-blue-300",
	}
</script>

<Container>
<!--	<h1>Student {data.studentid}</h1>-->
	<div class="flex flex-col gap-5 justify-center items-center shadow-2xl rounded-2xl bg-gray-100">
		<div class="bg-pink-300 h-36 w-36 rounded-full my-5">
		</div>
		<div>{data.student?.last_name.toUpperCase()} {data.student?.first_name}</div>
		<div>
			{#if year}
				<button class="chip bg-gray-400">{year}A</button>
			{:else}
				<span>Année inconnue</span>
			{/if}
			{#if speciality === 'ASE'}
				<button class="chip {spe_color['ASE']}">ASE</button>
			{:else if speciality === 'IR'}
				<button class="chip {spe_color['IR']}">IR</button>
			{:else if speciality === 'T&F'}
				<button class="chip {spe_color['T&F']}">T&F</button>
			{:else if speciality === 'Méca'}
				<button class="chip {spe_color['Méca']}">Méca</button>
			{:else if speciality === 'GI'}
				<button class="chip {spe_color['GI']}">GI</button>
			{:else if speciality}
				<button class="chip bg-gray-300">{speciality}</button>
			{:else}
				<span>Spécialité inconnue</span>
			{/if}
			{#if data.student?.isMember}
				<button type="button" class="chip bg-green-300">Adhérent</button>
			{:else}
				<button type="button" class="chip bg-red-300">Non adhérent</button>
			{/if}
		</div>
		<div class="flex flex-row gap-5 w-full px-3 sm:px-10 md:px-24 lg:px-48">
			<div class="flex flex-col gap-4 pb-5 w-1/2 mx-auto">
				<p>NOM: <span class="font-bold">{data.student?.last_name}</span></p>
				<p>Prénom: <span class="font-bold">{data.student?.first_name}</span></p>
				<p>N° étudiant: <span class="font-bold">{data.student?.studentId}</span></p>
				<p>Date de naissance:<span class="font-bold"></span></p>
			</div>
			<div class="w-1/2">
			</div>
		</div>
	</div>
</Container>