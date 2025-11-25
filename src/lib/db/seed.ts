import { DataSource } from 'typeorm';

// Basic seeding for initial tables present in migrations.
// Inserts default languages and a couple of sample keywords if they don't exist.
export async function seedDatabase(ds: DataSource) {
	if (!ds || !ds.manager) {
		throw new Error('DataSource not initialized for seeding');
	}

	// Insert default languages if missing
	const langs = [
		{ code: 'en', name: 'English' },
		{ code: 'es', name: 'Spanish' }
	];

	for (const l of langs) {
		const exists = await ds.manager.query('select 1 from languages where code = $1 limit 1', [
			l.code
		]);
		if (exists.length === 0) {
			await ds.manager.query('insert into languages(code, name) values($1, $2)', [l.code, l.name]);
		}
	}

	// Insert a couple of sample keywords if missing
	const sampleKeywords = [
		{ keyword: 'suspicious', language_code: 'en' },
		{ keyword: 'alerta', language_code: 'es' }
	];

	for (const k of sampleKeywords) {
		const exists = await ds.manager.query('select 1 from keywords where keyword = $1 limit 1', [
			k.keyword
		]);
		if (exists.length === 0) {
			await ds.manager.query(
				'insert into keywords(keyword, language_code, "addedAt", "updatedAt") values($1, $2, now(), now())',
				[k.keyword, k.language_code]
			);
		}
	}

	// Seed default roles and permissions (if tables exist)
	try {
		// roles
		const roles = [
			{ name: 'admin', description: 'Full access' },
			{ name: 'maintainer', description: 'Manage configuration and triggers' },
			{ name: 'viewer', description: 'Read-only access' }
		];

		for (const r of roles) {
			const exists = await ds.manager.query('select 1 from roles where name = $1 limit 1', [
				r.name
			]);
			if (exists.length === 0) {
				await ds.manager.query(
					'insert into roles(id, name, description) values(gen_random_uuid(), $1, $2)',
					[r.name, r.description]
				);
			}
		}

		// permissions: seed a minimal set
		const permissions = [
			{ name: 'view:app', description: 'Can view application' },
			{ name: 'manage:triggers', description: 'Can create/update triggers' },
			{ name: 'manage:users', description: 'Can manage users and roles' }
		];

		for (const p of permissions) {
			const exists = await ds.manager.query('select 1 from permissions where name = $1 limit 1', [
				p.name
			]);
			if (exists.length === 0) {
				await ds.manager.query('insert into permissions(name, description) values($1, $2)', [
					p.name,
					p.description
				]);
			}
		}

		// assign broad permissions to admin role if not present
		const adminRole = await ds.manager.query('select id from roles where name=$1 limit 1', [
			'admin'
		]);
		if (adminRole.length > 0) {
			const adminId = adminRole[0].id;
			for (const p of permissions) {
				const exists = await ds.manager.query(
					'select 1 from role_permissions where role_id = $1 and permission_name = $2 limit 1',
					[adminId, p.name]
				);
				if (exists.length === 0) {
					await ds.manager.query(
						'insert into role_permissions(role_id, permission_name) values($1, $2)',
						[adminId, p.name]
					);
				}
			}
		}
	} catch (err) {
		// tables may not exist in older DBs; safe to ignore during seeding
	}
}

export default seedDatabase;
