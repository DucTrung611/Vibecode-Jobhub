import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUsersTable1786374354374 implements MigrationInterface {
  name = 'CreateUsersTable1786374354374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
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
          { name: 'phone', type: 'varchar', length: '30', isNullable: true },
          {
            name: 'resume_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
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
      'users',
      new TableIndex({
        name: 'idx_users_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'idx_users_deleted_at');
    await queryRunner.dropTable('users');
  }
}
