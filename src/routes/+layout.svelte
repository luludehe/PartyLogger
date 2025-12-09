<script lang="ts">
	import '../app.css';
	import { Navigation } from '@skeletonlabs/skeleton-svelte';
	import { Users, NotepadText, ChartLine, Shield, LogOut } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';

	let { data } = $props();

	let showpanel = 'none';
	let showUserMenu = $state(false);

	function toggle() {
		showpanel = showpanel === 'none' ? 'block' : 'none';
	}
	let value = $state('listes');
	let current = "font-bold text-blue-950"

	function hasPermission(permission: string): boolean {
		return data.user?.role.permissions.includes(permission) || false;
	}
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
		<p class="ml-5 my-auto text-xl sm:hidden w-full">BDE Ensisa</p>
<!-- Desktop view -->
		{#if data.user}
			<a class="btn border-none hidden sm:inline-flex {value === 'listes'? current : ''}" href="/" onclick={() => value = 'listes'}>
				<Users />
				<p class="hidden sm:block">Listes</p></a>
			<a class="btn border-none hidden sm:inline-flex {value === 'logs'? current : ''}" href="/logs" onclick={() => value = 'logs'}>
				<NotepadText />
				<p class="hidden sm:block">Journal</p></a>
			<a class="btn border-none hidden sm:inline-flex {value === 'stats'? current : ''}" href="/stats" onclick={() => value = 'stats'}>
				<ChartLine />
				<p class="hidden sm:block">Statistiques</p></a>
			
			{#if hasPermission('admin_panel')}
				<a class="btn border-none hidden sm:inline-flex {value === 'admin'? current : ''}" href="/admin" onclick={() => value = 'admin'}>
					<Shield />
					<p class="hidden sm:block">Admin</p></a>
			{/if}
		{/if}

		<div class="!grid grid-flow-col gap-2 m-2 w-full justify-end !mr-4">
			{#if data.user}
				<div class="relative">
					<button 
						onclick={() => showUserMenu = !showUserMenu}
						class="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100"
					>
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
							{data.user.firstName[0]}{data.user.lastName[0]}
						</div>
						<span class="hidden sm:block text-sm font-medium">{data.user.firstName}</span>
					</button>
					
					{#if showUserMenu}
						<div class="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border z-50">
							<div class="p-3 border-b">
								<p class="font-medium">{data.user.firstName} {data.user.lastName}</p>
								<p class="text-xs text-gray-500">{data.user.role.name}</p>
							</div>
							<form method="POST" action="/logout" use:enhance>
								<button type="submit" class="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 text-red-600">
									<LogOut size={16} />
									Déconnexion
								</button>
							</form>
						</div>
					{/if}
				</div>
			{:else}
				<a href="/login" class="btn bg-blue-600 text-white">
					Connexion
				</a>
			{/if}
		</div>
	</nav>

	<slot />
{#if data.user}
	<div class="card border-surface-100-900 sm:hidden grid w-screen grid-rows-[1fr_auto] border-[1px] fixed bottom-0 sm:absolute z-20">
		<!-- Component -->
		<Navigation.Bar {value} onValueChange={(newValue) => (value = newValue)}>
			<Navigation.Tile id="logs" label="Journal" onclick={() => goto("/logs")}><NotepadText /></Navigation.Tile>
			<Navigation.Tile id="listes" label="Listes" onclick={() => goto("/")}><Users /></Navigation.Tile>
			<Navigation.Tile id="stats" label="Stats" onclick={() => goto("/stats")}><ChartLine /></Navigation.Tile>
			{#if hasPermission('admin_panel')}
				<Navigation.Tile id="admin" label="Admin" onclick={() => goto("/admin")}><Shield /></Navigation.Tile>
			{/if}
		</Navigation.Bar>
	</div>
{/if}
</main>
<!--<Help bind:display={showhelp} />-->
<!--<RequestModal bind:display={newrequest} />-->

<style>
	main {
			height: 100dvh;
	}
</style>