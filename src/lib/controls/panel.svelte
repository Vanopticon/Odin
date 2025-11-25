<script lang="ts">
	import { currentUser } from '$lib/auth/stores';
	import { hasPermission, hasAnyPermission } from '$lib/auth/permissions';
	import type { User } from '$lib/types/user';

	// Props: `permission` may be a single permission string or an array of permissions.
	// If provided, the panel will be hidden when the current user lacks the required permission(s).
	// Use $props() to preserve the project's children rendering pattern.
	let {
		children = undefined,
		title,
		color = 'primary',
		permission = null,
		hideIfUnauthorized = true
	} = $props();

	// derive a visibility store from the currentUser store
	import { derived } from 'svelte/store';

	const visible = derived(currentUser, (user) => {
		if (!permission) return true;
		if (Array.isArray(permission))
			return hasAnyPermission(user as User | null, permission as string[]);
		return hasPermission(user as User | null, permission as string);
	});
</script>

// preserve the legacy 'children' prop rendering used across the project let {(children =
	undefined)} = $props();

{#if $visible}
	<div
		class="panel border-black border-2 border-solid rounded-l-4xl {color} h-full w-full pl-1 pb-1 flex flex-col content-top"
	>
		<h2 class="pl-4">{title}</h2>
		<div class="grow surface rounded-l-4xl p-2 pl-4">
			{@render children?.()}
		</div>
	</div>
{/if}

{#if !$visible && !hideIfUnauthorized}
	<div
		class="panel border-black border-2 border-solid rounded-l-4xl {color} h-full w-full pl-1 pb-1 flex flex-col content-top opacity-60"
	>
		<h2 class="pl-4">{title}</h2>
		<div class="grow surface rounded-l-4xl p-2 pl-4">
			<em>Unauthorized</em>
		</div>
	</div>
{/if}
