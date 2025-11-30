import type { RequestEvent } from '@sveltejs/kit';
import { groupsGrantPermission, parseGroupsHeader } from './groups';
import { decryptSession } from './session';
import { DB_URL } from '$lib/settings';

function safeJson(obj: any) {
	try {
		return JSON.stringify(obj);
	} catch {
		return '{"error":"internal"}';
	}
}

/**
 * Server-side group-based auth for MVP.
 *
 * The server expects `x-groups` header (comma-separated). Group names are
 * mapped to permissions via `GROUP_PERMISSIONS` in `groups.ts`.
 */
export function getSessionFromEvent(event: RequestEvent) {
	try {
		const token = event.cookies.get('od_session');
		if (!token) return null;
		const s = decryptSession(token);
		return s || null;
	} catch (e) {
		return null;
	}
}

// Async helper: enrich a decrypted session object with DB-backed roles/permissions
// when a DB is configured. This can be used by callers that are able to await
// (for example during login callback flows) to ensure session objects contain
// DB-derived claims before being serialized back to cookies or used for checks.
export async function enrichSessionWithDB(session: any) {
	if (!session || !DB_URL) return session;
	try {
		const email = session.user && session.user.email;
		if (!email) return session;
		const rbac = await import('$lib/auth/rbac');
		const res = await rbac.getUserRolesAndPermissionsByEmail(email);
		if (res) {
			session.roles = res.roles || [];
			session.permissions = res.permissions || [];
		}
	} catch (e) {
		// ignore and return original session on any error
	}
	return session;
}

export function getUserGroupsFromEvent(event: RequestEvent) {
	// Prefer session-derived groups (secure) and fall back to x-groups header
	try {
		const session = getSessionFromEvent(event as any);
		if (session && Array.isArray((session as any).groups) && (session as any).groups.length > 0) {
			return (session as any).groups as string[];
		}
	} catch (e) {
		// fall through to header parsing
	}
	const header = event.request.headers.get('x-groups') || '';
	return parseGroupsHeader(header);
}

export function hasGroupServer(event: RequestEvent, group: string) {
	try {
		const groups = getUserGroupsFromEvent(event);
		if (groups.includes('odin_admins') || groups.includes('admin')) return true;
		return groups.includes(group);
	} catch (e) {
		return false;
	}
}

export function hasAnyGroupServer(event: RequestEvent, wanted: string[]) {
	try {
		const groups = getUserGroupsFromEvent(event);
		if (groups.includes('odin_admins') || groups.includes('admin')) return true;
		return wanted.some((g) => groups.includes(g));
	} catch (e) {
		return false;
	}
}

export function hasPermissionServer(event: RequestEvent, permission: string) {
	try {
		// Prefer explicit permissions attached to the session (e.g., DB-backed)
		try {
			const session = getSessionFromEvent(event as any) as any;
			if (session && Array.isArray(session.permissions) && session.permissions.length > 0) {
				// explicit permission match
				if (session.permissions.includes(permission)) return true;
				// honor admin role on the session (roles are separate from permissions)
				if (
					Array.isArray(session.roles) &&
					(session.roles.includes('admin') || session.roles.includes('odin_admins'))
				)
					return true;
				return false;
			}
		} catch (e) {
			// ignore and fall back to group/header mapping
		}
		const groups = getUserGroupsFromEvent(event);
		if (groups.includes('odin_admins') || groups.includes('admin')) return true;
		return groupsGrantPermission(groups, permission);
	} catch (e) {
		return false;
	}
}

export function requireAuth(event: RequestEvent) {
	// redirect to login if no session
	try {
		const session = getSessionFromEvent(event as any);
		if (!session) {
			const returnTo = encodeURIComponent(event.url.pathname + event.url.search);
			throw new Response(null, {
				status: 302,
				headers: { Location: `/auth/login?returnTo=${returnTo}` }
			});
		}
		return session;
	} catch (e) {
		// any error -> redirect to login
		const returnTo = encodeURIComponent(event.url.pathname + event.url.search);
		throw new Response(null, {
			status: 302,
			headers: { Location: `/auth/login?returnTo=${returnTo}` }
		});
	}
}

export function requirePermission(event: RequestEvent, permission: string) {
	try {
		// ensure authenticated first
		requireAuth(event);
		if (!hasPermissionServer(event, permission)) {
			throw new Response(safeJson({ error: 'Forbidden' }), { status: 403 });
		}
	} catch (e) {
		if (e instanceof Response) throw e;
		throw new Response(safeJson({ error: 'Forbidden' }), { status: 403 });
	}
}
