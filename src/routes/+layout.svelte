<script lang="ts">
	import { page } from '$app/state';

	let { children } = $props();
</script>

<svelte:head>
	<title>{page.data.title} - Odin</title>
</svelte:head>

{@render children?.()}
