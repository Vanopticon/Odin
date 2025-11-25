import type { RequestEvent } from '@sveltejs/kit';

/**
 * Minimal server-side permission helper for MVP.
 *
 * This reads request headers `x-permissions` and `x-roles` as comma-separated
 * lists. In production this should be replaced with proper auth middleware.
 */
export function getUserPermissionsFromEvent(event: RequestEvent) {
    const perms = event.request.headers.get('x-permissions') || '';
    const roles = event.request.headers.get('x-roles') || '';
    const permissions = perms.split(',').map((p) => p.trim()).filter(Boolean);
    const rolesList = roles.split(',').map((r) => r.trim()).filter(Boolean);
    return { permissions, roles: rolesList };
}

export function hasPermissionServer(event: RequestEvent, permission: string) {
    const { permissions, roles } = getUserPermissionsFromEvent(event);
    if (roles.includes('admin')) return true;
    return permissions.includes(permission);
}

export function requirePermission(event: RequestEvent, permission: string) {
    if (!hasPermissionServer(event, permission)) {
        throw new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }
}
