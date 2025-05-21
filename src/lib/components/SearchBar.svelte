<script lang="ts">
	import { Eraser } from '@lucide/svelte';
	let { input_value = $bindable(), filter = $bindable() }: { input_value: String, filter: Function } = $props();
</script>

<div class="flex flex-row gap-1 sm:gap-3">
	<div class="flex flex-grow gap-1 sm:gap-3">
		<input class="input" type="text" placeholder="Rechercher" bind:value={input_value} oninput={() => filter()}/>
	</div>
	<nav class="btn-group preset-outlined-surface-200-800 flex-col p-1 sm:p-2 flex-row">
		<button type="button" class="btn hover:preset-tonal text-xs sm:text-base" onclick={() => { input_value = ''; filter(); }}><Eraser />Effacer</button>
<!--		<button type="button" class="btn hover:preset-tonal">Grille</button>-->
	</nav>
<!--	<button>-->
<!--		<p class="hidden sm:block">New</p>-->
<!--	</button>-->
</div>