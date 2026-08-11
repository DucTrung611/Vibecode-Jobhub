import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDefaultRole1786374353374 implements MigrationInterface {
  name = 'SeedDefaultRole1786374353374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO roles (name, description) VALUES ('super_admin', 'Full access — seeded default role, replaced by real RBAC roles in Phase 2')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM roles WHERE name = 'super_admin'`);
  }
}
