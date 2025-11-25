<script lang="ts">
	let { children = undefined, title, color = 'primary' } = $props();
</script>

<div
	class="panel border-black border-2 border-solid rounded-l-4xl {color} h-full w-full pl-1 pb-1 flex flex-col content-top"
>
	<h2 class="pl-4">{title}</h2>
	<div class="grow surface rounded-l-4xl p-2 pl-4">
		{@render children?.()}
	</div>
</div>
