import { MigrationInterface, QueryRunner } from 'typeorm';

export class GrantSuperAdminAllPermissions1786374360374 implements MigrationInterface {
  name = 'GrantSuperAdminAllPermissions1786374360374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT r.id, p.id
       FROM roles r
       CROSS JOIN permissions p
       WHERE r.name = 'super_admin'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE rp FROM role_permissions rp
       INNER JOIN roles r ON r.id = rp.role_id
       WHERE r.name = 'super_admin'`,
    );
  }
}
