import type { Handle } from '@sveltejs/kit';
import { ANONYMOUS_USER, type User } from '$lib/types/user';
import { hasPermission } from '$lib/auth/permissions';
import { decryptSession } from '$lib/auth/session';

/**
 * Simple server-side hook that populates `event.locals.user` and
 * enforces permission checks for a few protected paths.
 *
 * Notes:
 * - This is intentionally small and conservative: it doesn't implement
 *   full session/token handling. Instead it reads a base64-encoded JSON
 *   `session` cookie for local/dev use. Real apps should replace this
 *   with secure server-side session verification.
 */
export const handle: Handle = async ({ event, resolve }) => {
	// Default to anonymous
	let user: User | null = ANONYMOUS_USER;

	try {
		const token = event.cookies.get('od_session');
		if (token) {
			const s = decryptSession(token) as any;
			if (s && s.user) user = s.user as User;
		}
	} catch (err) {
		// If session is malformed or decryption fails, treat as unauthenticated
		user = ANONYMOUS_USER;
	}

	event.locals.user = user;

	// Enforce no anonymous access for any route except the allowed list
	const path = event.url.pathname;
	const allowedPrefixes = ['/auth', '/_app', '/static', '/images'];
	const allowedFiles = ['/robots.txt', '/site.webmanifest', '/favicon.ico'];

	const isAllowed =
		allowedPrefixes.some((p) => path.startsWith(p)) ||
		allowedFiles.includes(path) ||
		path.endsWith('.css') ||
		path.endsWith('.js') ||
		path.endsWith('.png') ||
		path.endsWith('.svg') ||
		path.endsWith('.webmanifest');

	if (!isAllowed) {
		if (!user || user === ANONYMOUS_USER) {
			// For API clients prefer JSON 401, for browsers redirect to login
			const accept = event.request.headers.get('accept') || '';
			if (accept.includes('application/json') || path.startsWith('/api')) {
				return new Response(JSON.stringify({ error: 'Unauthenticated' }), { status: 401 });
			}
			const returnTo = encodeURIComponent(event.url.pathname + event.url.search);
			return new Response(null, {
				status: 302,
				headers: { Location: `/auth/login?returnTo=${returnTo}` }
			});
		}
	}

	// Protect admin routes as before
	const protectAdmin = path.startsWith('/admin') || path.startsWith('/api/admin');
	if (protectAdmin) {
		if (!user || user === ANONYMOUS_USER) {
			return new Response(JSON.stringify({ error: 'Unauthenticated' }), { status: 401 });
		}
		if (!hasPermission(user, 'manage:users')) {
			return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
		}
	}

	return resolve(event);
};
