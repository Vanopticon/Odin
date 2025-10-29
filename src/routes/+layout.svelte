<script lang="ts">
	import { page } from '$app/state';
	import '../app.css';
</script>

<!-- Authored in part by GitHub Copilot -->
<svelte:head>
	<title>{page.data.title} - Vanopticon: Odin</title>
</svelte:head>

<header class="flex rounded-bl-4xl bg-blue-900 text-amber-200 pb-2 mb-1">
	<div class="shrink">
		<img src="/images/Odin.svg" alt="Odin Logo" class="h-12 m-2 mb-0 ml-4" />
	</div>
	<div class="flex flex-col grow">
		<div class="flex rounded-bl-4xl bg-black text-white grow mt-0 w-full pl-4 items-center">
			<h1 class="m-auto">{page.data.title} - Vanopticon: Odin</h1>
		</div>
	</div>
</header>
<div>
	<slot />
</div>
