import AppDataSource from '$lib/db/data-source';

export type AuditEntry = {
	actor_id?: string | null;
	actor_type?: string | null;
	action: string;
	resource?: string | null;
	resource_id?: string | null;
	data?: any;
	outcome?: string | null;
	req_id?: string | null;
};

export async function writeAudit(entry: AuditEntry) {
	const payload = {
		ts: new Date().toISOString(),
		level: 'info',
		type: 'audit',
		...entry
	};

	// Emit structured audit event to stdout (JSON) for centralized collection
	try {
		// Keep console output synchronous-friendly
		// eslint-disable-next-line no-console
		console.log(JSON.stringify(payload));
	} catch (e) {
		// ignore logging errors
	}

	// Best-effort persistence: insert into `audit_entries` table if DB is available
	try {
		if (AppDataSource && (AppDataSource as any).isInitialized) {
			const sql = `INSERT INTO audit_entries(
                id, actor_id, actor_type, action, resource, resource_id, data, outcome, created_at
            ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6::jsonb, $7, now())`;
			const params = [
				entry.actor_id || null,
				entry.actor_type || null,
				entry.action,
				entry.resource || null,
				entry.resource_id || null,
				JSON.stringify(entry.data || {}),
				entry.outcome || null
			];
			await AppDataSource.query(sql, params as any);
		}
	} catch (e) {
		// do not throw — audit persistence failures should not impact application flow
		// eslint-disable-next-line no-console
		console.error('audit persistence failed', e);
	}
}

export default { writeAudit };
