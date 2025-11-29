import type { RequestEvent } from '@sveltejs/kit';
import { getSessionFromEvent, enrichSessionWithDB } from '$lib/auth/server';
import { DB_URL } from '$lib/settings';

export async function GET(event: RequestEvent) {
	try {
		const session = getSessionFromEvent(event as any) as any;
		if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

		// best-effort: enrich with DB-backed roles/permissions when configured
		try {
			if (DB_URL) await enrichSessionWithDB(session);
		} catch (e) {
			// ignore enrichment failures
		}

		const payload = {
			user: session.user ?? null,
			roles: session.roles ?? [],
			permissions: session.permissions ?? [],
			groups: session.groups ?? []
		};

		return new Response(JSON.stringify(payload), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (e) {
		return new Response(JSON.stringify({ error: 'Internal' }), { status: 500 });
	}
}
