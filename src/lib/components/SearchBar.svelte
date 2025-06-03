<script lang="ts">
	import { Eraser, UserPlus } from '@lucide/svelte';
	import { Modal, Segment } from '@skeletonlabs/skeleton-svelte';
	let { input_value = $bindable(), filter = $bindable(), ModalOpen = $bindable(), }: { input_value: String, filter: Function, ModalOpen: boolean, } = $props();

	// let newGuestModalOpen = $state(false);
	//
	// function newGuestModalClose() {
	// 	newGuestModalOpen = false;
	// }
	// function newGuestModalConfirm() {
	// 	newGuestModalOpen = false;
	// }
</script>

<div class="flex flex-row gap-1 sm:gap-3">
	<div class="flex flex-grow gap-1 sm:gap-3">
		<input class="input" type="text" placeholder="Rechercher" bind:value={input_value} oninput={() => filter()}/>
	</div>
	<nav class="btn-group preset-outlined-surface-200-800 flex-col p-1 sm:p-2 flex-row">
		<button type="button" class="btn hover:preset-tonal text-xs sm:text-base" onclick={() => { input_value = ''; filter(); }}><Eraser />Effacer</button>
		<button type="button" class="btn hover:preset-tonal text-xs sm:text-base" onclick={() => {ModalOpen = true}}><UserPlus />Ajouter</button>
	</nav>
</div>