import type { RequestHandler } from '@sveltejs/kit';
import { HealthResponse } from '$lib/schemas/health';

export const GET: RequestHandler = async () => {
	const uptime = process.uptime();
	const now = new Date().toISOString();
	const payload = {
		status: 'ok',
		timestamp: now,
		uptime_seconds: Math.floor(uptime)
	};

	// validate response shape with Zod in development for safety
	if (process.env['NODE_ENV'] !== 'production') {
		HealthResponse.parse({ status: payload.status, uptime: uptime });
	}

	return new Response(JSON.stringify(payload), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
