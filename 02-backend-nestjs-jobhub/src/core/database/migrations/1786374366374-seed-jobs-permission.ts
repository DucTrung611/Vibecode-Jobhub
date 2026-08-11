import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * `jobs.read` (GET /admin/jobs) isn't in API_SPEC.md §6 — the spec only
 * lists public GET /jobs (published-only). Admin Job Management (#7) needs
 * to list jobs of every status, so this endpoint + permission is added
 * following the same seeding pattern as admins.read/roles.read — see
 * jobs/context.md.
 */
export class SeedJobsPermission1786374366374 implements MigrationInterface {
  name = 'SeedJobsPermission1786374366374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO permissions (name, method, route, description) VALUES (?, ?, ?, ?)`,
      ['jobs.read', 'GET', '/admin/jobs', 'List all jobs (any status)'],
    );
    await queryRunner.query(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT r.id, p.id FROM roles r, permissions p
       WHERE r.name = 'super_admin' AND p.name = 'jobs.read'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE rp FROM role_permissions rp
       INNER JOIN permissions p ON p.id = rp.permission_id
       WHERE p.name = 'jobs.read'`,
    );
    await queryRunner.query(`DELETE FROM permissions WHERE name = 'jobs.read'`);
  }
}
