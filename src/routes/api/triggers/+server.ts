import type { RequestEvent } from '@sveltejs/kit';
import Trigger from '$lib/types/trigger';
import { initializeDataSource, AppDataSource } from '$lib/db/data-source';
import { requirePermission, requireAuth } from '$lib/auth/server';
import { validateCsrf } from '$lib/auth/csrf';
import { z } from 'zod';
import { TriggerCreate, TriggerUpdate } from '$lib/schemas/trigger';
import { requireValidBody } from '$lib/schemas/validate';
import { writeAudit } from '$lib/logging/audit';

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
	// validate CSRF for state-changing request
	try {
		validateCsrf(event);
	} catch (e) {
		return e as Response;
	}
	const maybe = await requireValidBody(event, TriggerCreate);
	if (maybe instanceof Response) return maybe;
	const body = maybe;
	const repo = await getRepository();

	const t = repo.create({
		name: body.name || 'unnamed',
		expression: body.expression || '',
		enabled: typeof body.enabled === 'boolean' ? body.enabled : true
	} as Partial<Trigger>);

	const saved = await repo.save(t);
	// audit: creation
	try {
		await writeAudit({
			action: 'trigger.create',
			resource: 'trigger',
			resource_id: saved.id,
			data: saved
		});
	} catch (err) {
		// do not block response on audit failures
	}
	return new Response(JSON.stringify(saved), { status: 201 });
}

export async function PUT(event: RequestEvent) {
	requirePermission(event, 'manage:triggers');
	try {
		validateCsrf(event);
	} catch (e) {
		return e as Response;
	}
	const maybeUpdate = await requireValidBody(event, TriggerUpdate);
	if (maybeUpdate instanceof Response) return maybeUpdate;
	const body = maybeUpdate;

	const repo = await getRepository();
	const item = await repo.findOneBy({ id: body.id });
	if (!item) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });

	item.name = body.name ?? item.name;
	item.expression = body.expression ?? item.expression;
	if (typeof body.enabled === 'boolean') item.enabled = body.enabled;

	const saved = await repo.save(item);
	try {
		await writeAudit({
			action: 'trigger.update',
			resource: 'trigger',
			resource_id: saved.id,
			data: saved
		});
	} catch (err) {}
	return new Response(JSON.stringify(saved), { status: 200 });
}

export async function DELETE(event: RequestEvent) {
	requirePermission(event, 'manage:triggers');
	try {
		validateCsrf(event);
	} catch (e) {
		return e as Response;
	}
	const id = event.url.searchParams.get('id');
	if (!id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400 });
	const repo = await getRepository();
	const item = await repo.findOneBy({ id });
	if (!item) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
	await repo.remove(item);
	try {
		await writeAudit({ action: 'trigger.delete', resource: 'trigger', resource_id: id });
	} catch (err) {}
	return new Response(null, { status: 204 });
}
