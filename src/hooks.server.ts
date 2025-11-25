import type { Handle } from '@sveltejs/kit';
import { ANONYMOUS_USER, type User } from '$lib/types/user';
import { hasPermission } from '$lib/auth/permissions';

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

	const sessionCookie = event.cookies.get('session');
	if (sessionCookie) {
		try {
			// Expect a base64-encoded JSON string in the cookie for dev.
			const decoded = Buffer.from(sessionCookie, 'base64').toString('utf8');
			const parsed = JSON.parse(decoded) as User;
			if (parsed) user = parsed;
		} catch (err) {
			// Malformed cookie — treat as anonymous
			user = ANONYMOUS_USER;
		}
	}

	event.locals.user = user;

	// Protect a few example admin routes. Returns 401 for unauthenticated
	// users and 403 for authenticated users lacking the permission.
	const path = event.url.pathname;
	const protectAdmin = path.startsWith('/admin') || path.startsWith('/api/admin');

	if (protectAdmin) {
		if (!user || user === ANONYMOUS_USER) {
			return new Response('Unauthenticated', { status: 401 });
		}
		if (!hasPermission(user, 'manage:users')) {
			return new Response('Forbidden', { status: 403 });
		}
	}

	return resolve(event);
};
