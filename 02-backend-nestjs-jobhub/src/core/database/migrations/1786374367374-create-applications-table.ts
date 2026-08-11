import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateApplicationsTable1786374367374 implements MigrationInterface {
  name = 'CreateApplicationsTable1786374367374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'applications',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            unsigned: true,
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'job_id', type: 'bigint', unsigned: true },
          { name: 'user_id', type: 'bigint', unsigned: true },
          { name: 'resume_url', type: 'varchar', length: '500' },
          { name: 'cover_letter', type: 'text', isNullable: true },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
            default: "'pending'",
          },
          {
            name: 'reviewed_by',
            type: 'bigint',
            unsigned: true,
            isNullable: true,
          },
          { name: 'reviewed_at', type: 'datetime', isNullable: true },
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
      'applications',
      new TableIndex({
        name: 'uq_applications_job_user',
        columnNames: ['job_id', 'user_id'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'applications',
      new TableIndex({
        name: 'idx_applications_user_id',
        columnNames: ['user_id'],
      }),
    );
    await queryRunner.createIndex(
      'applications',
      new TableIndex({
        name: 'idx_applications_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createForeignKey(
      'applications',
      new TableForeignKey({
        columnNames: ['job_id'],
        referencedTableName: 'jobs',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
    await queryRunner.createForeignKey(
      'applications',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
    await queryRunner.createForeignKey(
      'applications',
      new TableForeignKey({
        columnNames: ['reviewed_by'],
        referencedTableName: 'admins',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('applications');
    if (table) {
      for (const fk of table.foreignKeys) {
        await queryRunner.dropForeignKey('applications', fk);
      }
    }
    await queryRunner.dropIndex('applications', 'idx_applications_status');
    await queryRunner.dropIndex('applications', 'idx_applications_user_id');
    await queryRunner.dropIndex('applications', 'uq_applications_job_user');
    await queryRunner.dropTable('applications');
  }
}
