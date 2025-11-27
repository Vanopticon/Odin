import { randomBytes } from 'crypto';
import type { RequestEvent } from '@sveltejs/kit';

const COOKIE_NAME = 'od_csrf';
const HEADER_NAME = 'x-csrf-token';

export function generateCsrfToken(): string {
	return randomBytes(16).toString('base64url');
}

export function setCsrfCookie(event: RequestEvent, token: string) {
	// CSRF cookie intentionally NOT HttpOnly so SPA can read it and set header.
	event.cookies.set(COOKIE_NAME, token, {
		httpOnly: false,
		sameSite: 'lax',
		secure: true,
		path: '/',
		maxAge: 60 * 60 * 24 * 7
	});
}

export function validateCsrf(event: RequestEvent) {
	const cookie = event.cookies.get(COOKIE_NAME) || '';
	const header = event.request.headers.get(HEADER_NAME) || '';
	if (!cookie || !header) {
		throw new Response(JSON.stringify({ error: 'CSRF token missing' }), { status: 403 });
	}
	if (cookie !== header) {
		throw new Response(JSON.stringify({ error: 'CSRF token mismatch' }), { status: 403 });
	}
}

export default { generateCsrfToken, setCsrfCookie, validateCsrf };
