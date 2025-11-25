import type { User } from '$lib/types/user';

/**
 * Check whether a user has a given permission.
 *
 * Logic:
 * - If the user has the permission explicitly in `permissions`, return true.
 * - If the user has a role named `admin` return true (superuser).
 * - Future: map roles to permissions server-side; keep client-side helper minimal.
 */
export function hasPermission(user: User | null | undefined, permission: string): boolean {
    if (!user) return false;
    if (user.permissions && user.permissions.includes(permission)) return true;
    // simple role shortcut
    if (user.roles && user.roles.includes('admin')) return true;
    return false;
}

export function hasAnyPermission(user: User | null | undefined, permissions: string[]): boolean {
    if (!user) return false;
    for (const p of permissions) if (hasPermission(user, p)) return true;
    return false;
}

export function hasAllPermissions(user: User | null | undefined, permissions: string[]): boolean {
    if (!user) return false;
    for (const p of permissions) if (!hasPermission(user, p)) return false;
    return true;
}
