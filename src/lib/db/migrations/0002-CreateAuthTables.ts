import type { MigrationInterface, QueryRunner } from 'typeorm';
import { Table, TableForeignKey } from 'typeorm';

export class CreateAuthTables0002 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		// users table
		await queryRunner.createTable(
			new Table({
				name: 'users',
				columns: [
					{ name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
					{ name: 'email', type: 'varchar', length: '255', isNullable: false },
					{ name: 'password_hash', type: 'text', isNullable: true },
					{ name: 'display_name', type: 'text', isNullable: true },
					{ name: 'is_active', type: 'boolean', isNullable: false, default: 'true' },
					{ name: 'created_at', type: 'timestamptz', isNullable: false, default: 'now()' },
					{ name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'now()' }
				],
				uniques: [{ columnNames: ['email'] }]
			})
		);

		// roles table
		await queryRunner.createTable(
			new Table({
				name: 'roles',
				columns: [
					{ name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
					{ name: 'name', type: 'varchar', length: '100', isNullable: false },
					{ name: 'description', type: 'text', isNullable: true }
				],
				uniques: [{ columnNames: ['name'] }]
			})
		);

		// permissions table
		await queryRunner.createTable(
			new Table({
				name: 'permissions',
				columns: [
					{ name: 'name', type: 'varchar', length: '150', isPrimary: true },
					{ name: 'description', type: 'text', isNullable: true }
				]
			})
		);

		// user_roles join
		await queryRunner.createTable(
			new Table({
				name: 'user_roles',
				columns: [
					{ name: 'user_id', type: 'uuid', isPrimary: true },
					{ name: 'role_id', type: 'uuid', isPrimary: true }
				]
			})
		);

		// role_permissions join
		await queryRunner.createTable(
			new Table({
				name: 'role_permissions',
				columns: [
					{ name: 'role_id', type: 'uuid', isPrimary: true },
					{ name: 'permission_name', type: 'varchar', length: '150', isPrimary: true }
				]
			})
		);

		// Foreign keys
		await queryRunner.createForeignKey(
			'user_roles',
			new TableForeignKey({
				columnNames: ['user_id'],
				referencedTableName: 'users',
				referencedColumnNames: ['id'],
				onDelete: 'CASCADE'
			})
		);

		await queryRunner.createForeignKey(
			'user_roles',
			new TableForeignKey({
				columnNames: ['role_id'],
				referencedTableName: 'roles',
				referencedColumnNames: ['id'],
				onDelete: 'CASCADE'
			})
		);

		await queryRunner.createForeignKey(
			'role_permissions',
			new TableForeignKey({
				columnNames: ['role_id'],
				referencedTableName: 'roles',
				referencedColumnNames: ['id'],
				onDelete: 'CASCADE'
			})
		);

		await queryRunner.createForeignKey(
			'role_permissions',
			new TableForeignKey({
				columnNames: ['permission_name'],
				referencedTableName: 'permissions',
				referencedColumnNames: ['name'],
				onDelete: 'CASCADE'
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// drop foreign keys then tables in reverse order
		const rp = await queryRunner.getTable('role_permissions');
		if (rp)
			for (const fk of rp.foreignKeys) await queryRunner.dropForeignKey('role_permissions', fk);

		const ur = await queryRunner.getTable('user_roles');
		if (ur) for (const fk of ur.foreignKeys) await queryRunner.dropForeignKey('user_roles', fk);

		await queryRunner.dropTable('role_permissions');
		await queryRunner.dropTable('user_roles');
		await queryRunner.dropTable('permissions');
		await queryRunner.dropTable('roles');
		await queryRunner.dropTable('users');
	}
}

export default CreateAuthTables0002;
