import type { MigrationInterface, QueryRunner } from 'typeorm';
import { Table } from 'typeorm';

export class CreateAuditEntries0003 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

		await queryRunner.createTable(
			new Table({
				name: 'audit_entries',
				columns: [
					{ name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
					{ name: 'actor_id', type: 'uuid', isNullable: true },
					{ name: 'actor_type', type: 'text', isNullable: true },
					{ name: 'action', type: 'text', isNullable: false },
					{ name: 'resource', type: 'text', isNullable: true },
					{ name: 'resource_id', type: 'text', isNullable: true },
					{ name: 'data', type: 'jsonb', isNullable: true },
					{ name: 'outcome', type: 'text', isNullable: true },
					{ name: 'created_at', type: 'timestamptz', isNullable: false, default: 'now()' }
				]
			})
		);

		await queryRunner.query(
			`CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_entries (resource, resource_id);`
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropIndex('audit_entries', 'idx_audit_resource');
		await queryRunner.dropTable('audit_entries');
	}
}

export default CreateAuditEntries0003;
