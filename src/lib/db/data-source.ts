import 'reflect-metadata';
import { DataSource } from 'typeorm';
import Keyword from '../types/keyword';
import Sighting from '../types/sighting';
import Source from '../types/source';
import Reporter from '../types/reporter';
import Language from '../types/language';

// Prefer OD_DB_URL (project-specific env) but fall back to standard names.
const databaseUrl =
	process.env['OD_DB_URL'] || process.env['DATABASE_URL'] || process.env['DATABASE_URI'] || '';

export const AppDataSource = new DataSource({
	type: 'postgres',
	url: databaseUrl,
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
	if (!databaseUrl) {
		throw new Error('OD_DB_URL not set in environment');
	}
	if (AppDataSource.isInitialized) return AppDataSource;
	await AppDataSource.initialize();
	return AppDataSource;
}

export default AppDataSource;
