import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateCompaniesTable1786374361374 implements MigrationInterface {
  name = 'CreateCompaniesTable1786374361374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'companies',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            unsigned: true,
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', length: '200' },
          { name: 'slug', type: 'varchar', length: '220', isUnique: true },
          {
            name: 'logo_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          { name: 'description', type: 'text', isNullable: true },
          {
            name: 'size',
            type: 'enum',
            enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
            isNullable: true,
          },
          { name: 'created_by', type: 'bigint', unsigned: true },
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
      'companies',
      new TableIndex({
        name: 'idx_companies_created_by',
        columnNames: ['created_by'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('companies', 'idx_companies_created_by');
    await queryRunner.dropTable('companies');
  }
}
