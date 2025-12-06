import { describe, it, expect, vi, beforeEach } from 'vitest';

function makeEvent(method = 'GET', body?: any, search?: string) {
	let req: Request;
	if (body)
		req = new Request('https://fenris/api/auth/roles' + (search || ''), {
			method,
			body: JSON.stringify(body)
		});
	else req = new Request('https://fenris/api/auth/roles' + (search || ''), { method });
	return { request: req, url: new URL('https://fenris/api/auth/roles' + (search || '')) } as any;
}

describe('API /api/auth/roles CRUD', () => {
	beforeEach(() => vi.resetModules());

	it('PUT returns stub when no DB', async () => {
		vi.doMock('$lib/auth/server', () => ({ requireAuth: () => {}, requirePermission: () => {} }));
		vi.doMock('$lib/settings', () => ({ DB_URL: undefined }));

		const mod = await import('../+server');
		const res = await mod.PUT(makeEvent('PUT', { id: 'abc', name: 'newname' }));
		expect(res.status).toBe(200);
		const body = JSON.parse(await res.text());
		expect(body.id).toBe('abc');
		expect(body.name).toBe('newname');
	});

	it('DELETE returns 204 when no DB', async () => {
		vi.doMock('$lib/auth/server', () => ({ requireAuth: () => {}, requirePermission: () => {} }));
		vi.doMock('$lib/settings', () => ({ DB_URL: undefined }));

		const mod = await import('../+server');
		const res = await mod.DELETE(makeEvent('DELETE', { id: 'abc' }));
		expect(res.status).toBe(204);
	});

	it('GET by id returns row when DB present', async () => {
		vi.doMock('$lib/auth/server', () => ({ requireAuth: () => {}, requirePermission: () => {} }));
		vi.doMock('$lib/settings', () => ({ DB_URL: 'postgres://x' }));
		vi.doMock('$lib/db/data-source', () => ({
			initializeDataSource: async () => {},
			AppDataSource: {
				query: async (_q: any, _p?: any) => [{ id: 'r1', name: 'role1', description: null }]
			}
		}));

		const mod = await import('../+server');
		const res = await mod.GET(makeEvent('GET', undefined, '?id=r1'));
		expect(res.status).toBe(200);
		const body = JSON.parse(await res.text());
		expect(body).toEqual({ id: 'r1', name: 'role1', description: null });
	});
});
