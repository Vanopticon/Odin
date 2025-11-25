import { initializeDataSource } from './data-source';
import { seedDatabase } from './seed';

function shouldSeed(): boolean {
	// CLI flag --seed or env var RUN_MIGRATIONS_SEED=1
	if (process.env['RUN_MIGRATIONS_SEED'] === '1') return true;
	return process.argv.includes('--seed');
}

async function run() {
	try {
		const ds = await initializeDataSource();
		console.log('Running migrations...');
		const res = await ds.runMigrations();
		console.log(
			'Migrations complete:',
			res.map((r) => r.name)
		);

		if (shouldSeed()) {
			console.log('Seeding database...');
			await seedDatabase(ds);
			console.log('Seeding complete.');
		}

		process.exit(0);
	} catch (err) {
		console.error('Migration run failed:', err);
		process.exit(1);
	}
}

run();
