import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// prevent importing the real reflect-metadata during tests
vi.mock('reflect-metadata', () => ({}));

describe('initializeDataSource', () => {
	const ORIGINAL_ENV = { ...process.env };

	beforeEach(() => {
		vi.resetModules();
		process.env = { ...ORIGINAL_ENV };
	});

	afterEach(() => {
		process.env = { ...ORIGINAL_ENV };
	});

	it('throws when OD_DB_URL is not set', async () => {
		delete process.env['OD_DB_URL'];
		delete process.env['DATABASE_URL'];
		delete process.env['DATABASE_URI'];

		const mod = await import('$lib/db/data-source');
		await expect(mod.initializeDataSource()).rejects.toThrow('OD_DB_URL not set in environment');
	});

	it('initializes and returns AppDataSource when OD_DB_URL is set', async () => {
		process.env['OD_DB_URL'] = 'postgres://user:pass@localhost:5432/db';

		const mod = await import('$lib/db/data-source');

		// mock initialize to avoid actual DB connection
		const initMock = vi.fn().mockResolvedValue(mod.AppDataSource);
		mod.AppDataSource.initialize = initMock;
		// ensure it's not considered initialized
		// @ts-expect-error test wiring
		mod.AppDataSource.isInitialized = false;

		const ds = await mod.initializeDataSource();
		expect(ds).toBe(mod.AppDataSource);
		expect(initMock).toHaveBeenCalled();
	});

	it('returns AppDataSource immediately when already initialized', async () => {
		process.env['OD_DB_URL'] = 'postgres://user:pass@localhost:5432/db';
		const mod = await import('$lib/db/data-source');

		// mark initialized and ensure initialize isn't called
		const initMock = vi.fn().mockResolvedValue(mod.AppDataSource);
		mod.AppDataSource.initialize = initMock;
		// @ts-expect-error test wiring
		mod.AppDataSource.isInitialized = true;

		const ds = await mod.initializeDataSource();
		expect(ds).toBe(mod.AppDataSource);
		expect(initMock).not.toHaveBeenCalled();
	});
});
