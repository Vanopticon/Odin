mport { AppDataSource, initializeDataSource } from '$lib/db/data-source';

export type AuditPayload = {
	actor_id?: string;
	actor_type?: string;
	action: string;
	resource: string;
	resource_id?: string;
	data?: any;
	outcome?: string;
};

async function ensureAuditTable() {
	if (!AppDataSource.isInitialized) return;

	// Ensure pgcrypto extension for gen_random_uuid() is available, then
	// create the audit_entries table if it doesn't exist. Keep this SQL
	// idempotent so tests and runtime can call it safely.
	await AppDataSource.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

	await AppDataSource.query(`
    CREATE TABLE IF NOT EXISTS audit_entries (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      actor_id uuid,
      actor_type text,
      action text NOT NULL,
      resource text NOT NULL,
      resource_id text,
      data jsonb,
      outcome text,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
}

export async function writeAudit(payload: AuditPayload) {
	// Ensure datasource is initialized (tests may have already done this but
	// be defensive when called standalone).
	if (!AppDataSource.isInitialized) {
		await initializeDataSource();
	}

	// Ensure table exists before inserting (integration tests run migrations
	// which may not include audit entries yet).
	await ensureAuditTable();

	const res = await AppDataSource.query(
		`INSERT INTO audit_entries(actor_id, actor_type, action, resource, resource_id, data, outcome)
     VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
		[
			payload.actor_id || null,
			payload.actor_type || null,
			payload.action,
			payload.resource,
			payload.resource_id || null,
			payload.data ? JSON.stringify(payload.data) : null,
			payload.outcome || null
		]
	);

	return res && res[0] ? res[0] : null;
}

export default { writeAudit };
