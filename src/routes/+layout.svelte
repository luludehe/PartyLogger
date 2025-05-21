<script lang="ts">
	import '../app.css';
	import { Navigation } from '@skeletonlabs/skeleton-svelte';
	import { Users, NotepadText, ChartLine } from '@lucide/svelte';
	import { goto } from '$app/navigation';

	let showpanel = 'none';

	function toggle() {
		showpanel = showpanel === 'none' ? 'block' : 'none';
	}
	let value = $state('listes');
	let current = "font-bold text-blue-950"
</script>

<main class="w-screen">
	<nav id="navBar" class="flex flex-row mb-2 bg-white shadow-md w-full h-[3.43rem]">
<!--	Mobile view	-->
		<div class="h-10 w-16 m-2 !ml-3 hidden sm:mx-3 sm:block">
			<img
				id="logo"
				class="h-full block"
				alt="logo"
				src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Svelte_Logo.svg/199px-Svelte_Logo.svg.png"
			/>
		</div>
		<p class="ml-5 my-auto text-xl sm:hidden w-full">Super site web</p>
<!-- Desktop view -->
		<a class="btn border-none hidden sm:inline-flex {value === 'listes'? current : ''}" href="/" onclick={() => value = 'listes'}>
			<Users />
			<p class="hidden sm:block">Listes</p></a>
		<a class="btn border-none hidden sm:inline-flex {value === 'logs'? current : ''}" href="/logs" onclick={() => value = 'logs'}>
			<NotepadText />
			<p class="hidden sm:block">Journal</p></a>
		<a class="btn border-none hidden sm:inline-flex {value === 'stats'? current : ''}" href="/stats" onclick={() => value = 'stats'}>
			<ChartLine />
			<p class="hidden sm:block">Statistiques</p></a>

		<div class="!grid grid-flow-col gap-2 m-2 w-full justify-end !mr-4">
			<button href="/">
<!--				<Icon name="settings" />-->
			</button>
		</div>
	</nav>

	<slot />
<div class="card border-surface-100-900 sm:hidden grid w-screen grid-rows-[1fr_auto] border-[1px] fixed bottom-0 sm:absolute">
	<!-- Component -->
	<Navigation.Bar {value} onValueChange={(newValue) => (value = newValue)}>
		<Navigation.Tile id="logs" label="Journal" onclick={() => goto("/logs")}><NotepadText /></Navigation.Tile>
		<Navigation.Tile id="listes" label="Listes" onclick={() => goto("/")}><Users /></Navigation.Tile>
		<Navigation.Tile id="stats" label="Stats" onclick={() => goto("/")}><ChartLine /></Navigation.Tile>
	</Navigation.Bar>
</div>
</main>
<!--<Help bind:display={showhelp} />-->
<!--<RequestModal bind:display={newrequest} />-->

<style>
	main {
			height: 100dvh;
	}
</style>