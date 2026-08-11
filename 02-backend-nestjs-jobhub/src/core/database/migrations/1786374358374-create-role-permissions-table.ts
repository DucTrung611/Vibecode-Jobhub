import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateRolePermissionsTable1786374358374 implements MigrationInterface {
  name = 'CreateRolePermissionsTable1786374358374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'role_permissions',
        columns: [
          { name: 'role_id', type: 'bigint', unsigned: true, isPrimary: true },
          {
            name: 'permission_id',
            type: 'bigint',
            unsigned: true,
            isPrimary: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'role_permissions',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'role_permissions',
      new TableForeignKey({
        columnNames: ['permission_id'],
        referencedTableName: 'permissions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('role_permissions');
    if (table) {
      for (const fk of table.foreignKeys) {
        await queryRunner.dropForeignKey('role_permissions', fk);
      }
    }
    await queryRunner.dropTable('role_permissions');
  }
}
