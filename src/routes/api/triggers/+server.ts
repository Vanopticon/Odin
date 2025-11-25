import type { RequestEvent } from '@sveltejs/kit';
import Trigger from '$lib/types/trigger';
import { initializeDataSource, AppDataSource } from '$lib/db/data-source';
import { requirePermission, requireAuth } from '$lib/auth/server';

async function getRepository() {
	// ensure DataSource is initialized
	await initializeDataSource();
	return AppDataSource.getRepository(Trigger);
}

export async function GET(event: RequestEvent) {
	// require authenticated user for any access
	requireAuth(event);
	// list or get single trigger by ?id=..
	await initializeDataSource();
	const repo = AppDataSource.getRepository(Trigger);

	const id = event.url.searchParams.get('id');
	if (id) {
		const item = await repo.findOneBy({ id });
		if (!item) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
		return new Response(JSON.stringify(item), { status: 200 });
	}

	const list = await repo.find({ order: { createdAt: 'DESC' } as any });
	return new Response(JSON.stringify(list), { status: 200 });
}

export async function POST(event: RequestEvent) {
	// create new trigger — require permission
	requirePermission(event, 'manage:triggers');
	const body = await event.request.json();
	const repo = await getRepository();

	const t = repo.create({
		name: body.name || 'unnamed',
		expression: body.expression || '',
		enabled: typeof body.enabled === 'boolean' ? body.enabled : true
	} as Partial<Trigger>);

	const saved = await repo.save(t);
	return new Response(JSON.stringify(saved), { status: 201 });
}

export async function PUT(event: RequestEvent) {
	requirePermission(event, 'manage:triggers');
	const body = await event.request.json();
	if (!body.id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400 });

	const repo = await getRepository();
	const item = await repo.findOneBy({ id: body.id });
	if (!item) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

	item.name = body.name ?? item.name;
	item.expression = body.expression ?? item.expression;
	if (typeof body.enabled === 'boolean') item.enabled = body.enabled;

	const saved = await repo.save(item);
	return new Response(JSON.stringify(saved), { status: 200 });
}

export async function DELETE(event: RequestEvent) {
	requirePermission(event, 'manage:triggers');
	const id = event.url.searchParams.get('id');
	if (!id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400 });
	const repo = await getRepository();
	const item = await repo.findOneBy({ id });
	if (!item) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
	await repo.remove(item);
	return new Response(null, { status: 204 });
}
