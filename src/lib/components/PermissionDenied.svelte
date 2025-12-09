<script lang="ts">
	import { AlertCircle } from '@lucide/svelte';

	let { message = 'Vous n\'avez pas la permission d\'accéder à cette ressource.' } = $props();
</script>

<div class="flex items-center gap-3 rounded-lg bg-yellow-50 p-4 text-yellow-800 border border-yellow-200">
	<AlertCircle size={24} />
	<div>
		<p class="font-medium">Accès restreint</p>
		<p class="text-sm">{message}</p>
	</div>
</div>
