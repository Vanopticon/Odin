<script lang="ts">
	import { page } from '$app/state';
	import Panel from '$lib/controls/panel.svelte';
	import { currentUser } from '$lib/auth/stores';
	import { hasPermission } from '$lib/auth/permissions';

	page.data.title = 'Dashboard';
</script>

	<div class="grid grid-cols-1 md:grid-cols-2 m-0 grow">
	{#if $currentUser && hasPermission($currentUser, 'manage:users')}
		<div class="col-span-1 mb-2">
			<Panel title="Admin" color="warn">Admin-only controls go here</Panel>
		</div>
	{/if}
	<div class="row-span-2">
		<Panel title="Keywords"></Panel>
	</div>
	<div class="">
		<Panel title="Keyword Heatmap" color="info">
			<table>
				<thead><tr><th>Keyword</th><th>Last Seen</th></tr></thead>
				<tbody>
					<tr><td>example.com</td><td>2024-06-01</td></tr>
					<tr><td>testsite.org</td><td>2024-05-30</td></tr>
					<tr><td>mysite.net</td><td>2024-05-28</td></tr>
				</tbody>
			</table>
		</Panel>
	</div>
	<div class="">
		<Panel title="Brand Heatmap" color="warn">Keyword Heatmap here</Panel>
	</div>
</div>
