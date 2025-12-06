import type { RequestEvent } from '@sveltejs/kit';
import { getSessionFromEvent, enrichSessionWithDB } from '$lib/auth/server';
import { DB_URL } from '$lib/settings';

type MeResponse = {
	user: any | null;
	roles: string[];
	permissions: string[];
	groups: string[];
};

export async function GET(event: RequestEvent) {
	try {
		// support sync or async session retrieval
		const session = (await getSessionFromEvent(event as any)) as any;
		if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

		// best-effort: enrich with DB-backed roles/permissions when configured
		try {
			if (DB_URL) await enrichSessionWithDB(session);
		} catch (e) {
			// don't fail the request for enrichment issues; log at debug level
			// eslint-disable-next-line no-console
			console.debug && console.debug('me: enrichment failed', e);
		}

		const payload: MeResponse = {
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
