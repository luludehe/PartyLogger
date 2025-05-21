<script lang="ts">
	import Container from '$lib/components/Container.svelte'
	import { ProgressRing } from '@skeletonlabs/skeleton-svelte';

	let { data } = $props()

	const hours = Array.from({ length: 24 }, (_, i) => i);
	const counts = hours.map(h => data.ticketsByHour[h] || 0);
	const max = Math.max.apply(Math, counts);

	const chartData = {
		labels: hours.map(h => `${h}h`),
		datasets: [
			{
				label: "Étudiants par heure",
				data: counts,
				backgroundColor: "#3b82f6"
			}
		]
	};
	//add css to body
	// document.body.classList.add('bg-white');
</script>

<Container>
	<script>document.body.classList.add('bg-white');</script>
<!--	<div class="grid grid-cols-2 gap-10 items-center justify-center gap-9">-->
<!--		<div class="w-full block">-->
<!--			<h2>Nombre de tickets par heure</h2>-->
<!--			<div class="histogram">-->
<!--				{#each counts as count, i}-->
<!--					<div class="bar" style="height: {count / max * 100}%;">-->
<!--						<span title="{count}"></span>-->
<!--					</div>-->
<!--				{/each}-->
<!--			</div>-->
<!--			<div style="display: flex; gap: 4px;">-->
<!--				{#each hours as h}-->
<!--					<div class="bar-label">{h}h</div>-->
<!--				{/each}-->
<!--			</div>-->
<!--		</div>-->
<!--		<div>-->
<!--			<h1>Étudiants</h1>-->
<!--			<ProgressRing value={data.studentsTickets.length / data.studentsCount * 100 } max={100} showLabel />-->
<!--		</div>-->
<!--		<div>-->
<!--			<h1>Invités</h1>-->
<!--			<ProgressRing value={data.guestsTickets.length / data.guestsCount * 100 } max={100} showLabel />-->
<!--		</div>-->
<!--	</div>-->
	<div class="flex items-center justify-center min-h-[400px]">
		<img src="/grue_maintenance.jpg" alt="Grue de maintenance" class="w-96" />
	</div>
	<div class="flex items-center justify-center">
		<h1 class="text-2xl font-bold">Page en cours de construction...</h1>
	</div>
</Container>

<style>
		.histogram {
			display: flex;
			align-items: flex-end;
			height: 200px;
			gap: 4px;
			margin: 2rem 0;
		}
		.bar {
			width: 20px;
			background: #3b82f6;
			display: flex;
			align-items: flex-end;
			justify-content: center;
			transition: height 0.2s;
		}
		.bar-label {
			font-size: 0.7em;
			text-align: center;
			margin-top: 0.2em;
		}
</style>