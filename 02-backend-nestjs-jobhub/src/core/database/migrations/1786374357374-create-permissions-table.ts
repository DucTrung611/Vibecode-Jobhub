import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePermissionsTable1786374357374 implements MigrationInterface {
  name = 'CreatePermissionsTable1786374357374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'permissions',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            unsigned: true,
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', length: '100', isUnique: true },
          {
            name: 'method',
            type: 'enum',
            enum: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
          },
          { name: 'route', type: 'varchar', length: '150' },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
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
      'permissions',
      new TableIndex({
        name: 'uq_permissions_method_route',
        columnNames: ['method', 'route'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('permissions', 'uq_permissions_method_route');
    await queryRunner.dropTable('permissions');
  }
}
