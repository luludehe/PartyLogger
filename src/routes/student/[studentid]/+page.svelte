<script lang="ts">
	import Container from '$lib/components/Container.svelte';

	let { data } = $props();
	let spe_color = {
		"ASE": "bg-cyan-300",
		"IR" : "bg-red-300",
		"T&F": "bg-yellow-300",
		"Méca": "bg-purple-300",
	}
</script>

<Container>
<!--	<h1>Student {data.studentid}</h1>-->
	<div class="flex flex-col gap-5 justify-center items-center shadow-2xl rounded-2xl bg-gray-100">
		<div class="bg-pink-300 h-36 w-36 rounded-full my-5">
		</div>
		<div>{data.student?.last_name.toUpperCase()} {data.student?.first_name}</div>
		<div>
			<button type="button" class="chip {spe_color['ASE']}">ASE</button>
			<button type="button" class="chip bg-green-300">Adhérent</button>
		</div>
		<div class="flex flex-row gap-5 w-full px-3 sm:px-10 md:px-24 lg:px-48">
			<div class="flex flex-col gap-4 pb-5 w-1/2 mx-auto">
				<p>NOM: <span class="font-bold">{data.student?.last_name}</span></p>
				<p>Prénom: <span class="font-bold">{data.student?.first_name}</span></p>
				<p>N° étudiant: <span class="font-bold">{data.student?.studentId}</span></p>
				<p>Date de naissance:<span class="font-bold"></span></p>
			</div>
			<div class="w-1/2">
				test
			</div>
		</div>
	</div>
</Container>