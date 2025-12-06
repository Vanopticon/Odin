import { initializeDataSource } from '$lib/db/data-source';
import { DB_URL } from '$lib/settings';

/**
 * DB-backed RBAC adapter.
 * If `DB_URL` is not configured, functions return empty arrays so callers can
 * fall back to header/group-based authorization.
 */
export async function getUserRolesAndPermissionsByEmail(email: string) {
	if (!email) return { roles: [] as string[], permissions: [] as string[] };
	// Read from process.env at runtime to support tests that set OD_DB_URL after module load
	const databaseUrl = process.env['OD_DB_URL'] || process.env['DATABASE_URL'] || DB_URL || '';
	if (!databaseUrl) return { roles: [] as string[], permissions: [] as string[] };

	const ds = await initializeDataSource();
	// get roles for user by email
	const rolesRows: Array<{ name: string; id: string }> = await ds.manager.query(
		`SELECT r.id, r.name FROM roles r
         JOIN user_roles ur ON ur.role_id = r.id
         JOIN users u ON u.id = ur.user_id
         WHERE u.email = $1`,
		[email]
	);

	const roles = rolesRows.map((r) => r.name);

	if (roles.length === 0) return { roles, permissions: [] };

	// fetch permissions for role names
	const roleNames = roles;
	const permsRows: Array<{ permission_name: string }> = await ds.manager.query(
		`SELECT rp.permission_name FROM role_permissions rp
         JOIN roles r ON rp.role_id = r.id
         WHERE r.name = ANY($1)
        `,
		[roleNames]
	);

	const permissions = permsRows.map((p) => p.permission_name);
	return { roles, permissions };
}

export default { getUserRolesAndPermissionsByEmail };
