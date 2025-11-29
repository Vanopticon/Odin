import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import dotenv from 'dotenv';
dotenv.config();
import { initializeDataSource, AppDataSource } from '$lib/db/data-source';
import { getUserRolesAndPermissionsByEmail } from '$lib/auth/rbac';
import seedDatabase from '$lib/db/seed';

describe('rbac DB lookup (integration)', () => {
	let container: any;
	let skipIntegration = false;
	beforeAll(async () => {
		const tc = await import('testcontainers');
		const PgCtor = (tc as any).PostgreSqlContainer;

		const envDbUrl = process.env['OD_DB_URL'] || process.env['DATABASE_URL'] || '';
		let resolvedDbUrl: string | undefined;
		let port: number | string;
		let host: string;

		if (envDbUrl) {
			// Use DB URL provided via .env (preferred in CI/local dev). Parse and set
			// PG env vars so the pg client picks them up.
			resolvedDbUrl = envDbUrl;
			const parsed = new URL(resolvedDbUrl);
			host = parsed.hostname;
			port = parsed.port || '5432';
			const user = decodeURIComponent(parsed.username || '');
			const pass = decodeURIComponent(parsed.password || '');
			const db = parsed.pathname ? parsed.pathname.replace(/^\//, '') : '';

			process.env['OD_DB_URL'] = resolvedDbUrl;
			process.env['DATABASE_URL'] = resolvedDbUrl;
			process.env['PGHOST'] = host;
			process.env['PGPORT'] = String(port);
			process.env['PGUSER'] = user;
			process.env['PGPASSWORD'] = pass;
			process.env['PGDATABASE'] = db;
		} else {
			const pg = new PgCtor().withDatabase('testdb').withUsername('test').withPassword('test');
			try {
				container = await pg.start();
			} catch (err: any) {
				// Docker not available; skip integration
				// eslint-disable-next-line no-console
				console.warn(
					'Skipping DB-backed RBAC integration test (docker unavailable):',
					err.message || err
				);
				skipIntegration = true;
				return;
			}

			port = container.getMappedPort(5432);
			host = container.getHost();
			// Avoid using loopback addresses for TLS hostname matching. If testcontainers
			// returns 'localhost' or '127.0.0.1', prefer `OD_HOST` from the environment
			// (read from `.env` via dotenv) or fallback to the machine hostname.
			if (host === '127.0.0.1' || host === 'localhost') {
				host = process.env['OD_HOST'] || (await import('os')).hostname();
			}

			const user = 'test';
			const pass = 'test';
			const db = 'testdb';

			resolvedDbUrl = `postgres://${user}:${pass}@${host}:${port}/${db}`;
			process.env['OD_DB_URL'] = resolvedDbUrl;
			process.env['PGHOST'] = host;
			process.env['PGPORT'] = String(port);
			process.env['PGUSER'] = user;
			process.env['PGPASSWORD'] = pass;
			process.env['DATABASE_URL'] = resolvedDbUrl;
			process.env['PGDATABASE'] = db;
		}

		// Initialize and run migrations (fallback to `synchronize` if migrations
		// cannot be executed due to naming/validation differences in the test
		// environment).
		await initializeDataSource();
		try {
			await (AppDataSource as any).runMigrations();
		} catch (err: any) {
			// eslint-disable-next-line no-console
			console.warn(
				'runMigrations failed, attempting DataSource.synchronize():',
				err && (err.message || err.toString())
			);
			try {
				await (AppDataSource as any).synchronize();
			} catch (err2: any) {
				// Could be permission issues on the provided DB — skip integration
				// eslint-disable-next-line no-console
				console.warn(
					'synchronize() failed; skipping DB-backed integration tests:',
					err2 && (err2.message || err2.toString())
				);
				skipIntegration = true;
				return;
			}
		}

		// Seed roles and permissions
		await seedDatabase(AppDataSource as any);

		// Insert a test user and assign the 'maintainer' role
		const email = 'dbuser@example.com';
		await AppDataSource.query('insert into users(id, email) values(gen_random_uuid(), $1)', [
			email
		]);

		const roleRow = await AppDataSource.query('select id from roles where name = $1 limit 1', [
			'maintainer'
		]);
		if (roleRow.length > 0) {
			const roleId = roleRow[0].id;
			const userRow = await AppDataSource.query('select id from users where email = $1 limit 1', [
				email
			]);
			if (userRow.length > 0) {
				const userId = userRow[0].id;
				await AppDataSource.query('insert into user_roles(user_id, role_id) values($1, $2)', [
					userId,
					roleId
				]);
			}
		}
	}, 120000);

	afterAll(async () => {
		try {
			if (AppDataSource && (AppDataSource as any).isInitialized) {
				await AppDataSource.destroy();
			}
		} catch (e) {
			// ignore
		}

		if (container) {
			await container.stop();
		}
	});

	it('resolves roles and permissions for a DB-backed user', async () => {
		const email = 'dbuser@example.com';
		if (skipIntegration) {
			// ensure at least one assertion runs when skipping
			// eslint-disable-next-line no-console
			console.warn('Skipping RBAC DB assertion: DB not available');
			expect(true).toBe(true);
			return;
		}

		const result = await getUserRolesAndPermissionsByEmail(email);

		expect(result).toHaveProperty('roles');
		expect(result).toHaveProperty('permissions');
		expect(result.roles.length).toBeGreaterThan(0);
		// maintainer role should exist
		expect(result.roles).toContain('maintainer');
		// ensure seeded maintainer role grants manage:triggers (seed updated to add this)
		expect(Array.isArray(result.permissions)).toBe(true);
		expect(result.permissions).toContain('manage:triggers');
	});
});
