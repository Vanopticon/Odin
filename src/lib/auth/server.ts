import type { RequestEvent } from '@sveltejs/kit';
import { groupsGrantPermission, parseGroupsHeader } from './groups';
import { decryptSession } from './session';

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
