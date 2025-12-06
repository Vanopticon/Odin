import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { DB_URL } from '$lib/settings';
import Keyword from '../types/keyword';
import Sighting from '../types/sighting';
import Source from '../types/source';
import Reporter from '../types/reporter';
import Language from '../types/language';
import { CreateInitialTables0001 } from './migrations/0001-CreateInitialTables';
import { CreateAuthTables0002 } from './migrations/0002-CreateAuthTables';
import { CreateAuditEntries0003 } from './migrations/0003-CreateAuditEntries';

// We prefer `OD_DB_URL` at runtime but tests may set environment variables during
// execution. Create the DataSource lazily inside `initializeDataSource` so unit
// tests can modify `process.env` before initializing.
let _appDataSource: DataSource | null = null;

/** Accessor for the shared DataSource instance. Returns null if not initialized. */
export function getAppDataSource(): DataSource | null {
	return _appDataSource;
}

/**
 * Legacy export for backwards compatibility.
 * Creates a placeholder DataSource that may not have the correct URL.
 * NOTE: This DataSource is not initialized - use getAppDataSource() after initializeDataSource().
 * The entities here are for metadata reference only; the active DataSource (_appDataSource)
 * omits entities to avoid validation issues during test initialization.
 */
export const AppDataSource = new DataSource({
	type: 'postgres',
	// `url` will be set at initialization time to allow runtime env changes.
	url: undefined as unknown as string,
	synchronize: false,
	logging: false,
	entities: [Keyword, Sighting, Source, Reporter, Language],
	// Use migration classes directly to avoid .ts file loading issues at runtime
	migrations: [CreateInitialTables0001, CreateAuthTables0002, CreateAuditEntries0003]
});

<<<<<<< HEAD
export async function initializeDataSource(): Promise<DataSource> {
	// Resolve the database URL from environment at the time of initialization.
	// Read from process.env directly to support tests that set OD_DB_URL after module load.
	const databaseUrl = process.env['OD_DB_URL'] || process.env['DATABASE_URL'] || DB_URL || '';
=======
export async function initializeDataSource() {
	// Resolve the database URL using the exported value from `settings`.
	// Tests mock `$lib/settings` (via `vi.doMock`) to control `DB_URL`, so
	// prefer the `DB_URL` export here rather than reading `process.env`.
	// This keeps behavior deterministic for unit tests while `settings`
	// remains the source of truth for runtime configuration.
	const databaseUrl = DB_URL;
>>>>>>> origin/v1.0.0

	if (!databaseUrl) {
		throw new Error('OD_DB_URL not set in environment');
	}

	// If already initialized with a DataSource, return it
	if (_appDataSource && _appDataSource.isInitialized) {
		return _appDataSource;
	}

	// debug: show resolved DB URL when initializing (helps integration tests)
	// eslint-disable-next-line no-console
	console.log('initializeDataSource: using DB URL ->', databaseUrl);

	// Create a fresh DataSource with the correct URL and migration classes
	// Note: We omit entities to avoid entity constructor validation issues during test initialization.
	// The Language entity has a constructor that requires valid arguments, which TypeORM validates at startup.
	_appDataSource = new DataSource({
		type: 'postgres',
		url: databaseUrl,
		synchronize: false,
		logging: false,
		// Use migration classes directly to avoid .ts file loading issues at runtime
		migrations: [CreateInitialTables0001, CreateAuthTables0002, CreateAuditEntries0003]
	});

	// Update the legacy AppDataSource URL for reference only (it's not initialized)
	(AppDataSource as any).options = {
		...(AppDataSource as any).options,
		url: databaseUrl
	};

	await _appDataSource.initialize();
	return _appDataSource;
}

export default AppDataSource;
