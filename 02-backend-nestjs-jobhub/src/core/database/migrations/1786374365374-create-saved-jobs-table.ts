import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateSavedJobsTable1786374365374 implements MigrationInterface {
  name = 'CreateSavedJobsTable1786374365374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'saved_jobs',
        columns: [
          { name: 'user_id', type: 'bigint', unsigned: true, isPrimary: true },
          { name: 'job_id', type: 'bigint', unsigned: true, isPrimary: true },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'saved_jobs',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'saved_jobs',
      new TableForeignKey({
        columnNames: ['job_id'],
        referencedTableName: 'jobs',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('saved_jobs');
    if (table) {
      for (const fk of table.foreignKeys) {
        await queryRunner.dropForeignKey('saved_jobs', fk);
      }
    }
    await queryRunner.dropTable('saved_jobs');
  }
}
