import { describe, it, expect, vi, beforeEach } from 'vitest';

function makeEvent(payload: any, url = 'https://fenris/api/triggers') {
	return {
		request: { json: async () => payload },
		url: new URL(url)
	} as any;
}

describe('PUT /api/triggers and DELETE /api/triggers', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('updates a trigger and emits audit', async () => {
		vi.doMock('$lib/auth/server', () => ({ requirePermission: () => {}, requireAuth: () => {} }));
		vi.doMock('$lib/auth/csrf', () => ({ validateCsrf: () => {} }));
		const writeAuditMock = vi.fn();
		vi.doMock('$lib/logging/audit', () => ({ writeAudit: writeAuditMock }));

		const existing = { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Old', expression: 'x', enabled: true };
		const repoMock = {
			findOneBy: async (arg: any) => {
				const id = arg && typeof arg === 'object' ? arg.id : arg;
				return id === '550e8400-e29b-41d4-a716-446655440000' ? existing : null;
			},
			save: async (t: any) => ({ ...t })
		};
		vi.doMock('$lib/db/data-source', () => ({
			initializeDataSource: async () => {},
			AppDataSource: { getRepository: () => repoMock }
		}));

		const mod = await import('../+server');
		const payload = { id: '550e8400-e29b-41d4-a716-446655440000', name: 'NewName' };
		const res = await mod.PUT(makeEvent(payload));
		expect(res.status).toBe(200);
		const body = JSON.parse(await res.text());
		expect(body.name).toBe('NewName');
		expect(writeAuditMock).toHaveBeenCalled();
		const arg = writeAuditMock.mock.calls[0][0];
		expect(arg.action).toBe('trigger.update');
		expect(arg.resource).toBe('trigger');
		expect(arg.resource_id).toBe('550e8400-e29b-41d4-a716-446655440000');
	});

	it('deletes a trigger and emits audit', async () => {
		vi.doMock('$lib/auth/server', () => ({ requirePermission: () => {}, requireAuth: () => {} }));
		vi.doMock('$lib/auth/csrf', () => ({ validateCsrf: () => {} }));
		const writeAuditMock = vi.fn();
		vi.doMock('$lib/logging/audit', () => ({ writeAudit: writeAuditMock }));

		const repoMock = {
			findOneBy: async ({ id }: any) => (id === '550e8400-e29b-41d4-a716-446655440001' ? { id: '550e8400-e29b-41d4-a716-446655440001' } : null),
			remove: async (_: any) => {}
		};
		vi.doMock('$lib/db/data-source', () => ({
			initializeDataSource: async () => {},
			AppDataSource: { getRepository: () => repoMock }
		}));

		const mod = await import('../+server');
		const res = await mod.DELETE(makeEvent(null, 'https://fenris/api/triggers?id=550e8400-e29b-41d4-a716-446655440001'));
		expect(res.status).toBe(204);
		expect(writeAuditMock).toHaveBeenCalled();
		const arg = writeAuditMock.mock.calls[0][0];
		expect(arg.action).toBe('trigger.delete');
		expect(arg.resource_id).toBe('550e8400-e29b-41d4-a716-446655440001');
	});
});
