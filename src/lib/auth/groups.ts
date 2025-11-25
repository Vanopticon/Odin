export const GROUP_PERMISSIONS: Record<string, string[]> = {
	// Top-level application groups
	odin_admins: ['*'],
	odin_users: ['view:triggers'],
	// Legacy/fine-grained groups (kept for flexibility)
	triggers_admin: ['manage:triggers'],
	triggers_editor: ['manage:triggers'],
	triggers_viewer: ['view:triggers']
};

export function groupsGrantPermission(groups: string[], permission: string) {
	if (!groups || groups.length === 0) return false;
	for (const g of groups) {
		const perms = GROUP_PERMISSIONS[g];
		if (!perms) continue;
		if (perms.includes('*')) return true;
		if (perms.includes(permission)) return true;
	}
	return false;
}

export function parseGroupsHeader(header: string | null) {
	if (!header) return [] as string[];
	return header
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
}
