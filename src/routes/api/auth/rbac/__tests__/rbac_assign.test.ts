import { describe, it, expect, vi, beforeEach } from 'vitest';

function makeEvent(body?: any) {
    const req = body ? new Request('https://fenris/api/auth/rbac', { method: 'POST', body: JSON.stringify(body) }) : new Request('https://fenris/api/auth/rbac', { method: 'POST' });
    return { request: req, url: new URL('https://fenris/api/auth/rbac') } as any;
}

describe('POST /api/auth/rbac assignments', () => {
    beforeEach(() => vi.resetModules());

    it('returns stub ok when no DB (assignRole)', async () => {
        vi.doMock('$lib/auth/server', () => ({ requireAuth: () => {}, requirePermission: () => {} }));
        vi.doMock('$lib/settings', () => ({ DB_URL: undefined }));
        const mod = await import('../+server');
        const res = await mod.POST(makeEvent({ action: 'assignRole', userEmail: 'u@e', roleId: 'r1' }));
        expect(res.status).toBe(200);
        const body = JSON.parse(await res.text());
        expect(body.ok).toBe(true);
        expect(body.action).toBe('assignRole');
    });

    it('returns stub ok when no DB (assignPermission)', async () => {
        vi.doMock('$lib/auth/server', () => ({ requireAuth: () => {}, requirePermission: () => {} }));
        vi.doMock('$lib/settings', () => ({ DB_URL: undefined }));
        const mod = await import('../+server');
        const res = await mod.POST(makeEvent({ action: 'assignPermission', roleId: 'r1', permissionId: 'p1' }));
        expect(res.status).toBe(200);
        const body = JSON.parse(await res.text());
        expect(body.ok).toBe(true);
        expect(body.action).toBe('assignPermission');
    });

    it('calls DB queries when DB present (assignRole)', async () => {
        vi.doMock('$lib/auth/server', () => ({ requireAuth: () => {}, requirePermission: () => {} }));
        vi.doMock('$lib/settings', () => ({ DB_URL: 'postgres://x' }));
        const queries: any[] = [];
        vi.doMock('$lib/db/data-source', () => ({ initializeDataSource: async () => {}, AppDataSource: { query: async (q: any, p?: any) => { queries.push({ q, p }); return []; } } }));
        const mod = await import('../+server');
        const res = await mod.POST(makeEvent({ action: 'assignRole', userEmail: 'u@e', roleId: 'r1' }));
        expect(res.status).toBe(200);
        expect(queries.length).toBeGreaterThan(0);
    });
});
