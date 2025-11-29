import { describe, it, expect, vi, beforeEach } from 'vitest';

function makeEvent(body?: any) {
	const req = new Request('https://fenris/api/auth/roles', {
		method: body ? 'POST' : 'GET',
		body: body ? JSON.stringify(body) : undefined
	});
	return {
		request: req,
		url: new URL('https://fenris/api/auth/roles')
	} as any;
}

describe('API /api/auth/roles', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('GET returns empty list when no DB configured', async () => {
		// mock auth to allow access
		vi.doMock('$lib/auth/server', () => ({ requireAuth: () => {}, requirePermission: () => {} }));
		// ensure settings indicate no DB
		vi.doMock('$lib/settings', () => ({ DB_URL: undefined }));

		const mod = await import('../+server');
		const res = await mod.GET(makeEvent());
		expect(res.status).toBe(200);
		const body = JSON.parse(await res.text());
		expect(Array.isArray(body)).toBe(true);
		expect(body.length).toBe(0);
	});

	it('GET returns roles from AppDataSource when DB present', async () => {
		vi.doMock('$lib/auth/server', () => ({ requireAuth: () => {}, requirePermission: () => {} }));
		vi.doMock('$lib/settings', () => ({ DB_URL: 'postgres://x' }));

		// mock data-source to return rows
		vi.doMock('$lib/db/data-source', () => {
			return {
				initializeDataSource: async () => {},
				AppDataSource: {
					query: async () => [{ id: '1', name: 'maintainer', description: 'Maintainers' }]
				}
			};
		});

		const mod = await import('../+server');
		const res = await mod.GET(makeEvent());
		expect(res.status).toBe(200);
		const body = JSON.parse(await res.text());
		expect(body).toEqual([{ id: '1', name: 'maintainer', description: 'Maintainers' }]);
	});

	it('POST creates stub when no DB', async () => {
		vi.doMock('$lib/auth/server', () => ({ requireAuth: () => {}, requirePermission: () => {} }));
		vi.doMock('$lib/settings', () => ({ DB_URL: undefined }));

		const mod = await import('../+server');
		const ev = makeEvent({ name: 'test-role' });
		const res = await mod.POST(ev);
		expect(res.status).toBe(201);
		const body = JSON.parse(await res.text());
		expect(body).toHaveProperty('id');
		expect(body.name).toBe('test-role');
	});
});
