<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';

	let { children } = $props();
</script>

<svelte:head>
	<title>{page.data.title || 'Odin'}</title>
</svelte:head>

<div class="flex flex-col h-full w-full">
	<header class="rounded-bl-4xl primary p-1 pr-0 pt-0 flex content-top">
		<div
			class="flex grow content-center items-center text-amber-100 pl-4 surface rounded-bl-4xl text-2xl font-bold"
		>
			<img src="images/Odin.svg?" alt="Odin Logo" class="h-8 m-2" />
			<h1>{page.data.title || 'Odin'}</h1>
		</div>
	</header>
	<div class="flex grow">
		{@render children()}
	</div>
</div>
