import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { DataSource } from 'typeorm';

describe('seedDatabase', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('throws when DataSource not provided', async () => {
        const mod = await import('$lib/db/seed');
        // @ts-ignore
        await expect(mod.seedDatabase(null)).rejects.toThrow('DataSource not initialized for seeding');
    });

    it('runs expected queries when tables missing', async () => {
        const called: string[] = [];

        const mockManager = {
            query: vi.fn().mockImplementation(async (sql: string, params?: any[]) => {
                called.push(sql.trim());
                // return empty to simulate missing rows so insert branches run
                return [];
            })
        };

        const fakeDS: Partial<DataSource> = {
            manager: mockManager as any
        };

        const mod = await import('$lib/db/seed');
        await mod.seedDatabase(fakeDS as DataSource);

        // Expect some insert queries to have been invoked
        const hasInsert = called.some((s) => /insert into languages/i.test(s) || /insert into keywords/i.test(s) || /insert into roles/i.test(s)/i);
        expect(hasInsert).toBe(true);
        // Ensure manager.query was called multiple times
        expect((mockManager.query as any).mock.calls.length).toBeGreaterThan(0);
    });
});
