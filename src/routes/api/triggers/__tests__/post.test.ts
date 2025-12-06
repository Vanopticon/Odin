import { describe, it, expect, vi, beforeEach } from 'vitest';

function makeEvent(payload: any) {
	return {
		request: { json: async () => payload },
		url: new URL('https://fenris/api/triggers')
	} as any;
}

describe('POST /api/triggers', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('creates a trigger and returns 201', async () => {
		// mock auth and csrf to be no-ops
		vi.doMock('$lib/auth/server', () => ({ requirePermission: () => {}, requireAuth: () => {} }));
		vi.doMock('$lib/auth/csrf', () => ({ validateCsrf: () => {} }));
		// mock audit to capture calls
		const writeAuditMock = vi.fn();
		vi.doMock('$lib/logging/audit', () => ({ writeAudit: writeAuditMock }));

		// mock data-source and repository
		const repoMock = {
			create: (t: any) => ({ ...t }),
			save: async (t: any) => ({ ...t, id: 'id-1' })
		};
		vi.doMock('$lib/db/data-source', () => ({
			initializeDataSource: async () => {},
			AppDataSource: { getRepository: () => repoMock }
		}));

		const mod = await import('../+server');
		const payload = { name: 'T1', expression: 'true' };
		const res = await mod.POST(makeEvent(payload));
		expect(res).toBeInstanceOf(Response);
		expect(res.status).toBe(201);
		const body = JSON.parse(await res.text());
		expect(body.id).toBe('id-1');
		expect(body.name).toBe('T1');
		// audit was called
		expect(writeAuditMock).toHaveBeenCalled();
		const callArg = writeAuditMock.mock.calls[0][0];
		expect(callArg.action).toBe('trigger.create');
		expect(callArg.resource).toBe('trigger');
		expect(callArg.resource_id).toBe('id-1');
	});

	it('returns 400 on invalid input', async () => {
		vi.doMock('$lib/auth/server', () => ({ requirePermission: () => {}, requireAuth: () => {} }));
		vi.doMock('$lib/auth/csrf', () => ({ validateCsrf: () => {} }));
		// mock audit to ensure it's not called
		const writeAuditMock2 = vi.fn();
		vi.doMock('$lib/logging/audit', () => ({ writeAudit: writeAuditMock2 }));
		vi.doMock('$lib/db/data-source', () => ({
			initializeDataSource: async () => {},
			AppDataSource: { getRepository: () => ({ create: () => {}, save: async () => ({}) }) }
		}));

		const mod = await import('../+server');
		const payload = { name: '', expression: '' };
		const res = await mod.POST(makeEvent(payload));
		expect(res.status).toBe(400);
		const body = JSON.parse(await res.text());
		expect(body.error).toBe('Invalid input');
		// audit should not be called on invalid input
		expect(writeAuditMock2).not.toHaveBeenCalled();
	});
});
