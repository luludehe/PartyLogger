<script lang="ts">
	export let url = '#';
	export let title = 'Card';
	export let subtitle1 = 'A card component';
	export let subtitle2 = 'with header, article, and footer';
	export let text = 'This is a card component with header, article, and footer. It is a reusable component that can be used to display information in a structured way.';
	export let footer_left = 'By Alex';
	export let footer_right = 'On {new Date().toLocaleDateString()}';
</script>

<a
	href={url}
	class="card preset-filled-surface-100-900 border-[1px] border-surface-200-800 card-hover divide-surface-200-800 block max-w-md divide-y overflow-hidden"
>
<!--	<header>-->
<!--		<img src="https://images.unsplash.com/photo-1463171515643-952cee54d42a?q=80&w=450&h=190&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" class="aspect-[21/9] w-full grayscale hue-rotate-90" alt="banner" />-->
<!--	</header>-->
	<article class="space-y-4 p-4">
		<div>
			{#if subtitle1}
			<h2 class="h6">{subtitle1}</h2>
			{/if}
			{#if subtitle2}
			<h3 class="h3">{subtitle2}</h3>
			{/if}
		</div>
		<p class="opacity-60">{text}</p>
	</article>
	<footer class="flex items-center justify-between gap-4 p-4">
		<small class="opacity-60">{footer_left}</small>
		<small class="opacity-60">{footer_right}</small>
	</footer>
</a>