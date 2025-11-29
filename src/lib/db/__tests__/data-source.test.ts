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
		// Use centralized test settings and override DB_URL for this case
		const testSettings = await import('$lib/test_settings');
		vi.doMock('$lib/settings', () => ({ ...testSettings, DB_URL: '' }));

		const mod = await import('$lib/db/data-source');
		await expect(mod.initializeDataSource()).rejects.toThrow('OD_DB_URL not set in environment');
	});

	it('creates a DataSource when OD_DB_URL is set', async () => {
		// Use centralized test settings and provide a DB_URL override
		const testSettings = await import('$lib/test_settings');
		vi.doMock('$lib/settings', () => ({
			...testSettings,
			DB_URL: 'postgres://user:pass@localhost:5432/db'
		}));

		// Mock the DataSource class properly to avoid actual DB connection
		const mockInitialize = vi.fn().mockResolvedValue(undefined);
		const mockDs = {
			isInitialized: true,
			initialize: mockInitialize,
			options: {}
		};

		vi.doMock('typeorm', async (importOriginal) => {
			const actual = (await importOriginal()) as Record<string, unknown>;
			return {
				...actual,
				DataSource: class MockDataSource {
					isInitialized = false;
					options: Record<string, unknown> = {};
					async initialize() {
						this.isInitialized = true;
						// Sync with mockDs for verification
						mockDs.isInitialized = true;
						mockInitialize();
						return this;
					}
				}
			};
		});

		const mod = await import('$lib/db/data-source');
		const ds = await mod.initializeDataSource();

		expect(ds).toBeDefined();
		expect(mockInitialize).toHaveBeenCalled();
	});

	it('returns the same DataSource when called multiple times', async () => {
		// Use centralized test settings and provide a DB_URL override
		const testSettings = await import('$lib/test_settings');
		vi.doMock('$lib/settings', () => ({
			...testSettings,
			DB_URL: 'postgres://user:pass@localhost:5432/db'
		}));

		let instanceCount = 0;
		vi.doMock('typeorm', async (importOriginal) => {
			const actual = (await importOriginal()) as Record<string, unknown>;
			return {
				...actual,
				DataSource: class MockDataSource {
					instanceId: number;
					isInitialized = false;
					options: Record<string, unknown> = {};
					constructor() {
						this.instanceId = ++instanceCount;
					}
					async initialize() {
						this.isInitialized = true;
						return this;
					}
				}
			};
		});

		const mod = await import('$lib/db/data-source');

		// First call should create a new instance
		const ds1 = await mod.initializeDataSource();
		expect((ds1 as { instanceId: number }).instanceId).toBe(2); // 1 for AppDataSource, 2 for _appDataSource

		// Second call should return the same instance
		const ds2 = await mod.initializeDataSource();
		expect(ds2).toBe(ds1);
	});
});
