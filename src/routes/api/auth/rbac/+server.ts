import type { RequestEvent } from '@sveltejs/kit';
import { initializeDataSource, AppDataSource } from '$lib/db/data-source';
import { DB_URL } from '$lib/settings';
import { requirePermission, requireAuth } from '$lib/auth/server';

// Single POST endpoint to perform simple assignment operations:
// { action: 'assignRole', userEmail, roleId }
// { action: 'assignPermission', roleId, permissionId }
export async function POST(event: RequestEvent) {
    try {
        requireAuth(event as any);
        requirePermission(event as any, 'manage:users');

        const body = await event.request.json();
        if (!body || !body.action) return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });

        if (!DB_URL) {
            // No-DB mode: return a simple success stub
            return new Response(JSON.stringify({ ok: true, action: body.action }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        await initializeDataSource();

        if (body.action === 'assignRole') {
            const userEmail = body.userEmail;
            const roleId = body.roleId;
            if (!userEmail || !roleId) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
            await AppDataSource.query('insert into user_roles(user_email, role_id) values ($1, $2) on conflict do nothing', [userEmail, roleId] as any);
            return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        if (body.action === 'assignPermission') {
            const roleId = body.roleId;
            const permissionId = body.permissionId;
            if (!roleId || !permissionId) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
            await AppDataSource.query('insert into role_permissions(role_id, permission_id) values ($1, $2) on conflict do nothing', [roleId, permissionId] as any);
            return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });
    } catch (e: any) {
        if (e instanceof Response) throw e;
        return new Response(JSON.stringify({ error: 'Internal' }), { status: 500 });
    }
}

export default { POST };
