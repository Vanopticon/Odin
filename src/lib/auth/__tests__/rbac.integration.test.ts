import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { initializeDataSource, AppDataSource } from '$lib/db/data-source';
import { getUserRolesAndPermissionsByEmail } from '$lib/auth/rbac';
import seedDatabase from '$lib/db/seed';

describe('rbac DB lookup (integration)', () => {
  let container: any;
  let skipIntegration = false;

  beforeAll(async () => {
    const tc = await import('testcontainers');
    const PgCtor = (tc as any).PostgreSqlContainer;

    const pg = new PgCtor().withDatabase('testdb').withUsername('test').withPassword('test');
    try {
      container = await pg.start();
    } catch (err: any) {
      // Docker not available; skip integration
      // eslint-disable-next-line no-console
      console.warn('Skipping DB-backed RBAC integration test (docker unavailable):', err.message || err);
      skipIntegration = true;
      return;
    }

    const port = container.getMappedPort(5432);
    const host = container.getHost();
    const user = 'test';
    const pass = 'test';
    const db = 'testdb';

    // Set env for data-source resolver
    process.env.OD_DB_URL = `postgres://${user}:${pass}@${host}:${port}/${db}`;

    // Initialize and run migrations
    await initializeDataSource();
    await (AppDataSource as any).runMigrations();

    // Seed roles and permissions
    await seedDatabase(AppDataSource as any);

    // Insert a test user and assign the 'maintainer' role
    const email = 'dbuser@example.com';
    await AppDataSource.query('insert into users(id, email) values(gen_random_uuid(), $1)', [email]);

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
