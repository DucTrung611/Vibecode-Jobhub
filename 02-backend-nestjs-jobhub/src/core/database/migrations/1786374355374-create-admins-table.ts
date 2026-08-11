import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateAdminsTable1786374355374 implements MigrationInterface {
  name = 'CreateAdminsTable1786374355374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'admins',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            unsigned: true,
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'full_name', type: 'varchar', length: '150' },
          { name: 'email', type: 'varchar', length: '190', isUnique: true },
          { name: 'password_hash', type: 'varchar', length: '255' },
          { name: 'role_id', type: 'bigint', unsigned: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'deleted_at', type: 'datetime', isNullable: true },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'admins',
      new TableIndex({ name: 'idx_admins_role_id', columnNames: ['role_id'] }),
    );

    await queryRunner.createForeignKey(
      'admins',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('admins');
    const fk = table?.foreignKeys.find((f) =>
      f.columnNames.includes('role_id'),
    );
    if (fk) await queryRunner.dropForeignKey('admins', fk);
    await queryRunner.dropIndex('admins', 'idx_admins_role_id');
    await queryRunner.dropTable('admins');
  }
}
