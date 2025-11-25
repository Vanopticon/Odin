import { describe, it, expect } from 'vitest';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '$lib/auth/permissions';
import type { User } from '$lib/types/user';

describe('auth permissions helpers', () => {
    const basicUser: User = { id: '1', username: 'alice', roles: [], permissions: ['read:reports'] };
    const adminUser: User = { id: '2', username: 'admin', roles: ['admin'], permissions: [] };
    const multiUser: User = { id: '3', username: 'bob', roles: [], permissions: ['read:reports', 'write:triggers'] };

    it('hasPermission returns true for explicit permission', () => {
        expect(hasPermission(basicUser, 'read:reports')).toBe(true);
    });

    it('hasPermission returns false when user lacks permission', () => {
        expect(hasPermission(basicUser, 'write:triggers')).toBe(false);
    });

    it('hasPermission returns true for admin role', () => {
        expect(hasPermission(adminUser, 'anything:goes')).toBe(true);
    });

    it('hasAnyPermission returns true when any permission matches', () => {
        expect(hasAnyPermission(multiUser, ['delete:stuff', 'write:triggers'])).toBe(true);
    });

    it('hasAnyPermission returns false when none match', () => {
        expect(hasAnyPermission(basicUser, ['delete:stuff', 'write:triggers'])).toBe(false);
    });

    it('hasAllPermissions returns true when all are present', () => {
        expect(hasAllPermissions(multiUser, ['read:reports', 'write:triggers'])).toBe(true);
    });

    it('hasAllPermissions returns false when one is missing', () => {
        expect(hasAllPermissions(multiUser, ['read:reports', 'delete:stuff'])).toBe(false);
    });

    it('helpers return false for null/undefined user', () => {
        expect(hasPermission(null, 'read:reports')).toBe(false);
        expect(hasAnyPermission(undefined, ['read:reports'])).toBe(false);
        expect(hasAllPermissions(null, ['read:reports'])).toBe(false);
    });
});
