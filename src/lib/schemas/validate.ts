import type { RequestEvent } from '@sveltejs/kit';
import type { ZodSchema } from 'zod';

export async function validateJson<T>(requestEvent: RequestEvent, schema: ZodSchema<T>) {
	const body = await requestEvent.request.json().catch(() => null);
	if (!body) return { ok: false, error: 'Invalid or missing JSON body' };

	const result = schema.safeParse(body);
	if (!result.success) return { ok: false, error: result.error };
	return { ok: true, data: result.data };
}

/**
 * Helper for routes: returns parsed data or a `Response` that can be returned directly by the route.
 */
export async function requireValidBody<T>(requestEvent: RequestEvent, schema: ZodSchema<T>) {
	const res = await validateJson(requestEvent, schema);
	if (res.ok) return res.data as T;

	// format Zod error details if present
	let details: any = res.error;
	if (res.error && res.error.issues) details = res.error.issues;

	return new Response(JSON.stringify({ error: 'Invalid input', details }), {
		status: 400,
		headers: { 'Content-Type': 'application/json' }
	});
}
