import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateJobsTable1786374364374 implements MigrationInterface {
  name = 'CreateJobsTable1786374364374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'jobs',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            unsigned: true,
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'company_id', type: 'bigint', unsigned: true },
          { name: 'category_id', type: 'bigint', unsigned: true },
          { name: 'title', type: 'varchar', length: '200' },
          { name: 'slug', type: 'varchar', length: '220', isUnique: true },
          { name: 'description', type: 'text' },
          {
            name: 'employment_type',
            type: 'enum',
            enum: [
              'full_time',
              'part_time',
              'contract',
              'internship',
              'remote',
            ],
          },
          {
            name: 'salary_min',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'salary_max',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: [
              'draft',
              'pending_review',
              'published',
              'closed',
              'rejected',
            ],
            default: "'draft'",
          },
          { name: 'expires_at', type: 'datetime', isNullable: true },
          {
            name: 'approved_by',
            type: 'bigint',
            unsigned: true,
            isNullable: true,
          },
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
      'jobs',
      new TableIndex({
        name: 'idx_jobs_company_id',
        columnNames: ['company_id'],
      }),
    );
    await queryRunner.createIndex(
      'jobs',
      new TableIndex({
        name: 'idx_jobs_category_id',
        columnNames: ['category_id'],
      }),
    );
    await queryRunner.createIndex(
      'jobs',
      new TableIndex({
        name: 'idx_jobs_status_expires_at',
        columnNames: ['status', 'expires_at'],
      }),
    );

    await queryRunner.createForeignKey(
      'jobs',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedTableName: 'companies',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
    await queryRunner.createForeignKey(
      'jobs',
      new TableForeignKey({
        columnNames: ['category_id'],
        referencedTableName: 'categories',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
    await queryRunner.createForeignKey(
      'jobs',
      new TableForeignKey({
        columnNames: ['approved_by'],
        referencedTableName: 'admins',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('jobs');
    if (table) {
      for (const fk of table.foreignKeys) {
        await queryRunner.dropForeignKey('jobs', fk);
      }
    }
    await queryRunner.dropIndex('jobs', 'idx_jobs_status_expires_at');
    await queryRunner.dropIndex('jobs', 'idx_jobs_category_id');
    await queryRunner.dropIndex('jobs', 'idx_jobs_company_id');
    await queryRunner.dropTable('jobs');
  }
}
