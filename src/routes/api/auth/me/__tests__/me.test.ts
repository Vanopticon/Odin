import { describe, it, expect, vi, beforeEach } from 'vitest';

function makeEvent() {
	return {
		request: {},
		url: new URL('https://fenris/api/auth/me')
	} as any;
}

describe('GET /api/auth/me', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('returns 401 when unauthenticated', async () => {
		// mock getSessionFromEvent to return null
		vi.doMock('$lib/auth/server', () => ({
			getSessionFromEvent: () => null,
			enrichSessionWithDB: async () => {}
		}));

		const mod = await import('../+server');
		const res = await mod.GET(makeEvent());
		expect(res).toBeInstanceOf(Response);
		expect(res.status).toBe(401);
	});

	it('returns user roles/permissions when session present', async () => {
		const session = {
			user: { email: 'alice@example.com' },
			roles: ['maintainer'],
			permissions: ['manage:triggers'],
			groups: ['odin_users']
		};

		vi.doMock('$lib/auth/server', () => ({
			getSessionFromEvent: () => session,
			enrichSessionWithDB: async (s: any) => {
				// simulate enrichment (should not overwrite existing roles)
				s.roles = s.roles || [];
				s.permissions = s.permissions || [];
				return s;
			}
		}));

		const mod = await import('../+server');
		const res = await mod.GET(makeEvent());
		expect(res.status).toBe(200);
		expect(res.headers.get('content-type')).toContain('application/json');
		const body = JSON.parse(await res.text());
		expect(body).toHaveProperty('user');
		expect(body.roles).toEqual(['maintainer']);
		expect(body.permissions).toEqual(['manage:triggers']);
		expect(body.groups).toEqual(['odin_users']);
	});

	it('returns defaults when roles/permissions are missing', async () => {
		const session = {
			user: { email: 'bob@example.com' }
			// no roles/permissions/groups provided
		};

		vi.doMock('$lib/auth/server', () => ({
			getSessionFromEvent: () => session,
			enrichSessionWithDB: async (s: any) => s
		}));

		const mod = await import('../+server');
		const res = await mod.GET(makeEvent());
		expect(res.status).toBe(200);
		const body = JSON.parse(await res.text());
		expect(body.roles).toEqual([]);
		expect(body.permissions).toEqual([]);
		expect(body.groups).toEqual([]);
	});
});
