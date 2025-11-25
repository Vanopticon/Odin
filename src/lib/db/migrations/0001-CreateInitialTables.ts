import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateInitialTables0001 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		// Ensure extension for UUID generation is available
		await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

		// languages first (referenced by keywords)
		await queryRunner.createTable(
			new Table({
				name: 'languages',
				columns: [
					{ name: 'code', type: 'varchar', length: '3', isPrimary: true },
					{ name: 'name', type: 'text', isNullable: false }
				]
			})
		);

		await queryRunner.createTable(
			new Table({
				name: 'keywords',
				columns: [
					{ name: 'keyword', type: 'text', isPrimary: true },
					{ name: 'language_code', type: 'varchar', length: '3', isNullable: true },
					{ name: 'addedAt', type: 'timestamptz', isNullable: false, default: 'now()' },
					{ name: 'updatedAt', type: 'timestamptz', isNullable: false, default: 'now()' }
				]
			})
		);

		await queryRunner.createTable(
			new Table({
				name: 'sources',
				columns: [
					{ name: 'id', type: 'text', isPrimary: true },
					{ name: 'name', type: 'text', isNullable: true },
					{ name: 'type', type: 'text', isNullable: true },
					{ name: 'meta', type: 'jsonb', isNullable: true }
				]
			})
		);

		await queryRunner.createTable(
			new Table({
				name: 'reporters',
				columns: [
					{ name: 'id', type: 'text', isPrimary: true },
					{ name: 'name', type: 'text', isNullable: true },
					{ name: 'contact', type: 'text', isNullable: true },
					{ name: 'details', type: 'jsonb', isNullable: true }
				]
			})
		);

		await queryRunner.createTable(
			new Table({
				name: 'sightings',
				columns: [
					{ name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
					{ name: 'keyword', type: 'text', isNullable: false },
					{ name: 'timestamp', type: 'timestamptz', isNullable: false },
					{ name: 'data', type: 'jsonb', isNullable: true },
					{ name: 'source_id', type: 'text', isNullable: true },
					{ name: 'reporter_id', type: 'text', isNullable: true },
					{ name: 'details', type: 'jsonb', isNullable: true }
				]
			})
		);

		await queryRunner.createForeignKey(
			'keywords',
			new TableForeignKey({
				columnNames: ['language_code'],
				referencedTableName: 'languages',
				referencedColumnNames: ['code'],
				onDelete: 'SET NULL'
			})
		);

		await queryRunner.createForeignKey(
			'sightings',
			new TableForeignKey({
				columnNames: ['keyword'],
				referencedTableName: 'keywords',
				referencedColumnNames: ['keyword'],
				onDelete: 'CASCADE'
			})
		);

		await queryRunner.createForeignKey(
			'sightings',
			new TableForeignKey({
				columnNames: ['source_id'],
				referencedTableName: 'sources',
				referencedColumnNames: ['id'],
				onDelete: 'SET NULL'
			})
		);

		await queryRunner.createForeignKey(
			'sightings',
			new TableForeignKey({
				columnNames: ['reporter_id'],
				referencedTableName: 'reporters',
				referencedColumnNames: ['id'],
				onDelete: 'SET NULL'
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// drop in reverse order
		// drop FKs from sightings
		const sightingsTable = await queryRunner.getTable('sightings');
		if (sightingsTable) {
			for (const fk of sightingsTable.foreignKeys) {
				await queryRunner.dropForeignKey('sightings', fk);
			}
		}

		// drop FK from keywords
		const keywordsTable = await queryRunner.getTable('keywords');
		if (keywordsTable) {
			for (const fk of keywordsTable.foreignKeys) {
				await queryRunner.dropForeignKey('keywords', fk);
			}
		}

		await queryRunner.dropTable('sightings');
		await queryRunner.dropTable('reporters');
		await queryRunner.dropTable('sources');
		await queryRunner.dropTable('keywords');
		await queryRunner.dropTable('languages');
		// leave extensions as-is
	}
}

export default CreateInitialTables0001;
