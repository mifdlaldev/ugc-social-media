<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';

	let { children } = $props();

	let isOwnerRoute = $derived(page.url.pathname.startsWith('/owner'));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class={isOwnerRoute ? 'blueprint-grid' : ''}>
	{@render children()}
</div>
