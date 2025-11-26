import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const uptime = process.uptime();
	const now = new Date().toISOString();
	const payload = {
		status: 'ok',
		timestamp: now,
		uptime_seconds: Math.floor(uptime)
	};

	return new Response(JSON.stringify(payload), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
