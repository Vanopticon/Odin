import { initializeDataSource } from './data-source';

async function run() {
	try {
		const ds = await initializeDataSource();
		console.log('Running migrations...');
		const res = await ds.runMigrations();
		console.log(
			'Migrations complete:',
			res.map((r) => r.name)
		);
		process.exit(0);
	} catch (err) {
		console.error('Migration run failed:', err);
		process.exit(1);
	}
}

run();
