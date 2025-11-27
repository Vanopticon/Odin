import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

beforeEach(async () => {
	vi.resetModules();
	const testSettings = await import('$lib/test_settings');
	vi.doMock('$lib/settings', () => ({ ...testSettings }));
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('server auth helpers', () => {
	it('requireAuth throws redirect when no session cookie', async () => {
		const server = await import('$lib/auth/server');
		const event: any = {
			url: new URL('https://app.example/secure'),
			cookies: { get: (_: string) => null }
		};

		expect(() => server.requireAuth(event)).toThrow();
		try {
			server.requireAuth(event);
		} catch (e: any) {
			// should be a Response with Location header to /auth/login
			expect(e).toHaveProperty('status');
			expect(e.status).toBe(302);
		}
	});

	it('requirePermission allows admin group via session', async () => {
		const { encryptSession } = await import('$lib/auth/session');
		const server = await import('$lib/auth/server');

		const session = { groups: ['odin_admins'] };
		const token = encryptSession(session);

		const event: any = {
			url: new URL('https://app.example/api'),
			cookies: { get: (name: string) => (name === 'od_session' ? token : null) }
		};

		// should not throw
		expect(() => server.requirePermission(event, 'manage:triggers')).not.toThrow();
	});

	it('requirePermission denies insufficient groups', async () => {
		const { encryptSession } = await import('$lib/auth/session');
		const server = await import('$lib/auth/server');

		const session = { groups: ['odin_users'] };
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
