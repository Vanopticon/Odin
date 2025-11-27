import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

beforeEach(async () => {
	vi.resetModules();
	const testSettings = await import('$lib/test_settings');
	vi.doMock('$lib/settings', () => ({ ...testSettings }));
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('server RBAC via session permissions', () => {
	it('allows when session.permissions includes permission', async () => {
		const { encryptSession } = await import('$lib/auth/session');
		const server = await import('$lib/auth/server');

		const session = { groups: ['odin_users'], permissions: ['manage:triggers'] } as any;
		const token = encryptSession(session);

		const event: any = {
			url: new URL('https://app.example/api'),
			cookies: { get: (name: string) => (name === 'od_session' ? token : null) }
		};

		expect(() => server.requirePermission(event, 'manage:triggers')).not.toThrow();
	});

	it('denies when session.permissions does not include permission and groups lack permission', async () => {
		const { encryptSession } = await import('$lib/auth/session');
		const server = await import('$lib/auth/server');

		const session = { groups: ['odin_users'], permissions: ['read:reports'] } as any;
		const token = encryptSession(session);

		const event: any = {
			url: new URL('https://app.example/api'),
			cookies: { get: (name: string) => (name === 'od_session' ? token : null) }
		};

		expect(() => server.requirePermission(event, 'manage:triggers')).toThrow();
		try {
			server.requirePermission(event, 'manage:triggers');
		} catch (e: any) {
			expect(e).toHaveProperty('status');
			expect(e.status).toBe(403);
		}
	});
});
