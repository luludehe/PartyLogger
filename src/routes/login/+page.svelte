<script lang="ts">
	import { enhance } from '$app/forms';
	import Container from '$lib/components/Container.svelte';

	let { form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Connexion - PartyLogger</title>
</svelte:head>

<Container>
	<div class="flex min-h-[80vh] items-center justify-center">
		<div class="card w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
			<h1 class="mb-6 text-center text-3xl font-bold">Connexion</h1>

			{#if form?.error}
				<div class="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
					{form.error}
				</div>
			{/if}

			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
			>
				<div class="mb-4">
					<label for="usernameOrEmail" class="mb-2 block font-medium">
						Nom d'utilisateur ou email
					</label>
					<input
						type="text"
						id="usernameOrEmail"
						name="usernameOrEmail"
						required
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
						placeholder="votre.nom ou email@example.com"
					/>
				</div>

				<div class="mb-6">
					<label for="password" class="mb-2 block font-medium"> Mot de passe </label>
					<input
						type="password"
						id="password"
						name="password"
						required
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
						placeholder="••••••••"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
				>
					{loading ? 'Connexion...' : 'Se connecter'}
				</button>
			</form>

			<div class="mt-4 text-center text-sm text-gray-600">
				<p>Pas encore de compte ? Contactez un administrateur.</p>
			</div>
		</div>
	</div>
</Container>
