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

	function scrub(obj: any) {
		// deep clone with redaction of obvious secrets/tokens/passwords
		if (obj === null || obj === undefined) return obj;
		if (typeof obj !== 'object') return obj;
		if (Array.isArray(obj)) return obj.map(scrub);
		const out: any = {};
		for (const [k, v] of Object.entries(obj)) {
			const key = String(k).toLowerCase();
			if (
				key.includes('password') ||
				key.includes('pass') ||
				key.includes('secret') ||
				key.includes('token') ||
				key.includes('credential') ||
				key.includes('client_id') ||
				key.includes('client_secret') ||
				key.includes('access_token') ||
				key.includes('refresh_token')
			) {
				out[k] = '[REDACTED]';
			} else {
				out[k] = scrub(v as any);
			}
		}
		return out;
	}

	// Emit structured (redacted) audit event to stdout (JSON) for centralized collection
	try {
		// Keep console output synchronous-friendly
		// eslint-disable-next-line no-console
		console.log(JSON.stringify(scrub(payload)));
	} catch (e) {
		// ignore logging errors
	}

	// Best-effort persistence: insert into `audit_entries` table if DB is available
	try {
		if (AppDataSource && (AppDataSource as any).isInitialized) {
			// Check whether the audit_entries table exists before attempting to insert.
			// This avoids noisy errors in environments where migrations weren't run
			// or the DB user lacks permissions to create objects.
			try {
				const check = await AppDataSource.query(
					"SELECT to_regclass('public.audit_entries') as reg"
				);
				if (!check || !check[0] || !check[0].reg) {
					// Table not present; skip persistence
					// eslint-disable-next-line no-console
					console.debug &&
						console.debug('Skipping audit persistence: audit_entries table not found');
					return;
				}
			} catch (e) {
				// If the check fails (permission issues), skip persistence but log debug
				// eslint-disable-next-line no-console
				console.debug &&
					console.debug(
						'Skipping audit persistence: to_regclass check failed',
						e && (e.message || e)
					);
				return;
			}

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
