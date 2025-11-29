import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { DB_URL } from '$lib/settings';
import Keyword from '../types/keyword';
import Sighting from '../types/sighting';
import Source from '../types/source';
import Reporter from '../types/reporter';
import Language from '../types/language';

// We prefer `OD_DB_URL` at runtime but tests may set environment variables during
// execution. Read the database URL lazily inside `initializeDataSource` so unit
// tests can modify `process.env` before initializing.
export const AppDataSource = new DataSource({
	type: 'postgres',
	// `url` will be set at initialization time to allow runtime env changes.
	url: undefined as unknown as string,
	synchronize: false,
	logging: false,
	entities: [Keyword, Sighting, Source, Reporter, Language],
	// support migrations in both source and built outputs
	migrations: [
		process.cwd() + '/src/lib/db/migrations/*.{ts,js}',
		process.cwd() + '/dist/lib/db/migrations/*.{js}'
	]
});

export async function initializeDataSource() {
	// Resolve the database URL from environment at the time of initialization.
	const databaseUrl = DB_URL || '';

	if (!databaseUrl) {
		throw new Error('OD_DB_URL not set in environment');
	}

	if (AppDataSource.isInitialized) return AppDataSource;

	// debug: show resolved DB URL when initializing (helps integration tests)
	// eslint-disable-next-line no-console
	console.log('initializeDataSource: using DB URL ->', databaseUrl);

	// Update DataSource options with the resolved URL before initializing.
	// TypeORM keeps the options on the instance; mutate them here so other
	// modules using the exported `AppDataSource` see the correct config.
	// `as any` is used to avoid type errors when assigning into options.
	(AppDataSource as any).options = {
		...(AppDataSource as any).options,
		url: databaseUrl
	};

	await AppDataSource.initialize();
	return AppDataSource;
}

export default AppDataSource;
