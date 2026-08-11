import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateRefreshTokensTable1786374356374 implements MigrationInterface {
  name = 'CreateRefreshTokensTable1786374356374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'refresh_tokens',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            unsigned: true,
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'owner_id', type: 'bigint', unsigned: true },
          { name: 'owner_type', type: 'enum', enum: ['user', 'admin'] },
          { name: 'token_hash', type: 'varchar', length: '255' },
          { name: 'expires_at', type: 'datetime' },
          { name: 'revoked_at', type: 'datetime', isNullable: true },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'refresh_tokens',
      new TableIndex({
        name: 'idx_refresh_tokens_token_hash',
        columnNames: ['token_hash'],
      }),
    );
    await queryRunner.createIndex(
      'refresh_tokens',
      new TableIndex({
        name: 'idx_refresh_tokens_owner',
        columnNames: ['owner_id', 'owner_type'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('refresh_tokens', 'idx_refresh_tokens_owner');
    await queryRunner.dropIndex(
      'refresh_tokens',
      'idx_refresh_tokens_token_hash',
    );
    await queryRunner.dropTable('refresh_tokens');
  }
}
