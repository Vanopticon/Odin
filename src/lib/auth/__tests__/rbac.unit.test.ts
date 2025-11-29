import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

beforeEach(async () => {
	vi.resetModules();
	const testSettings = await import('$lib/test_settings');
	vi.doMock('$lib/settings', () => ({ ...testSettings }));
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('getUserRolesAndPermissionsByEmail', () => {
	it('returns empty arrays when email is empty', async () => {
		const rbac = await import('$lib/auth/rbac');
		// @ts-ignore - test the behavior with empty email
		const result = await rbac.getUserRolesAndPermissionsByEmail('');
		expect(result).toHaveProperty('roles');
		expect(result).toHaveProperty('permissions');
		expect(result.roles).toEqual([]);
		expect(result.permissions).toEqual([]);
	});

	it('returns empty arrays when DB_URL is not configured', async () => {
		const rbac = await import('$lib/auth/rbac');
		const result = await rbac.getUserRolesAndPermissionsByEmail('someone@example.com');
		expect(result.roles).toEqual([]);
		expect(result.permissions).toEqual([]);
	});
});
