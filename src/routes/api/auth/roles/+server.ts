import type { RequestEvent } from '@sveltejs/kit';
import { initializeDataSource, AppDataSource } from '$lib/db/data-source';
import { DB_URL } from '$lib/settings';
import { requirePermission, requireAuth } from '$lib/auth/server';

export async function GET(event: RequestEvent) {
	try {
		// ensure authenticated + authorized
		requireAuth(event as any);
		requirePermission(event as any, 'manage:users');

		// allow optional id via query param
		const id = event.url.searchParams.get('id');

		if (!DB_URL) {
			// no DB configured: return empty list or stub for single id
			if (id) {
				return new Response(JSON.stringify(null), {
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				});
			}
			return new Response(JSON.stringify([]), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		await initializeDataSource();
		if (id) {
			const rows = await AppDataSource.query(
				'select id, name, description from roles where id = $1',
				[id] as any
			);
			return new Response(JSON.stringify(rows && rows.length ? rows[0] : null), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const rows = await AppDataSource.query('select id, name, description from roles');
		return new Response(JSON.stringify(rows || []), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e: any) {
		if (e instanceof Response) throw e;
		return new Response(JSON.stringify({ error: 'Internal' }), { status: 500 });
	}
}

export async function POST(event: RequestEvent) {
	try {
		requireAuth(event as any);
		requirePermission(event as any, 'manage:users');

		const body = await event.request.json();
		if (!body || !body.name) {
			return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
		}

		if (!DB_URL) {
			// In environments without DB, return created stub
			return new Response(JSON.stringify({ id: 'local', name: body.name }), {
				status: 201,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		await initializeDataSource();
		const res = await AppDataSource.query(
			'insert into roles(id, name, description) values (gen_random_uuid(), $1, $2) returning id, name, description',
			[body.name, body.description || null] as any
		);
		const created = Array.isArray(res) && res.length > 0 ? res[0] : { id: null, name: body.name };
		return new Response(JSON.stringify(created), {
			status: 201,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e: any) {
		if (e instanceof Response) throw e;
		return new Response(JSON.stringify({ error: 'Internal' }), { status: 500 });
	}
}

export async function PUT(event: RequestEvent) {
	try {
		requireAuth(event as any);
		requirePermission(event as any, 'manage:users');

		const body = await event.request.json();
		if (!body || !body.id) {
			return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
		}

		if (!DB_URL) {
			return new Response(
				JSON.stringify({
					id: body.id,
					name: body.name || null,
					description: body.description || null
				}),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		await initializeDataSource();
		const res = await AppDataSource.query(
			'update roles set name = $1, description = $2 where id = $3 returning id, name, description',
			[body.name || null, body.description || null, body.id] as any
		);
		const updated = Array.isArray(res) && res.length ? res[0] : null;
		return new Response(JSON.stringify(updated), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e: any) {
		if (e instanceof Response) throw e;
		return new Response(JSON.stringify({ error: 'Internal' }), { status: 500 });
	}
}

export async function DELETE(event: RequestEvent) {
	try {
		requireAuth(event as any);
		requirePermission(event as any, 'manage:users');

		// id either in query or body
		const id = event.url.searchParams.get('id');
		let body: any = null;
		try {
			body = await event.request.json();
		} catch (e) {
			/* ignore */
		}
		const roleId = id || (body && body.id);
		if (!roleId) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });

		if (!DB_URL) {
			return new Response(null, { status: 204 });
		}

		await initializeDataSource();
		await AppDataSource.query('delete from roles where id = $1', [roleId] as any);
		return new Response(null, { status: 204 });
	} catch (e: any) {
		if (e instanceof Response) throw e;
		return new Response(JSON.stringify({ error: 'Internal' }), { status: 500 });
	}
}

export default { GET, POST };
