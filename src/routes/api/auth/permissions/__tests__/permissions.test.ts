import { describe, it, expect, vi, beforeEach } from 'vitest';

function makeEvent(method = 'GET', body?: any, search?: string) {
    const req = body ? new Request('https://fenris/api/auth/permissions' + (search || ''), { method, body: JSON.stringify(body) }) : new Request('https://fenris/api/auth/permissions' + (search || ''), { method });
    return { request: req, url: new URL('https://fenris/api/auth/permissions' + (search || '')) } as any;
}

describe('API /api/auth/permissions', () => {
    beforeEach(() => vi.resetModules());

    it('GET returns empty list when no DB configured', async () => {
        vi.doMock('$lib/auth/server', () => ({ requireAuth: () => {}, requirePermission: () => {} }));
        vi.doMock('$lib/settings', () => ({ DB_URL: undefined }));
        const mod = await import('../+server');
        const res = await mod.GET(makeEvent());
        expect(res.status).toBe(200);
        const body = JSON.parse(await res.text());
        expect(Array.isArray(body)).toBe(true);
    });

    it('POST creates stub when no DB', async () => {
        vi.doMock('$lib/auth/server', () => ({ requireAuth: () => {}, requirePermission: () => {} }));
        vi.doMock('$lib/settings', () => ({ DB_URL: undefined }));
        const mod = await import('../+server');
        const res = await mod.POST(makeEvent('POST', { name: 'manage:things' }));
        expect(res.status).toBe(201);
        const body = JSON.parse(await res.text());
        expect(body.name).toBe('manage:things');
    });
});
