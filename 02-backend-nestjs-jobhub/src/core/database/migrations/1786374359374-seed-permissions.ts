import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * One row per Admin-auth endpoint in API_SPEC.md §6 — including endpoints
 * for features not built yet (companies/jobs/applications), since
 * `permissions` is just data and API_SPEC.md says this table is "the
 * source of truth" for the full set. `jobs.approve` and `jobs.reject` get
 * distinct names (both labelled "jobs.approve" in the spec's Auth column)
 * because `uq_permissions_name` forbids duplicate names — see
 * roles-permissions/context.md.
 */
const PERMISSIONS: Array<{
  name: string;
  method: string;
  route: string;
  description: string;
}> = [
  {
    name: 'admins.read',
    method: 'GET',
    route: '/admin/admins',
    description: 'List admins',
  },
  {
    name: 'admins.create',
    method: 'POST',
    route: '/admin/admins',
    description: 'Create admin',
  },
  {
    name: 'admins.update',
    method: 'PATCH',
    route: '/admin/admins/:id',
    description: 'Update admin (incl. role)',
  },
  {
    name: 'admins.delete',
    method: 'DELETE',
    route: '/admin/admins/:id',
    description: 'Deactivate admin',
  },
  {
    name: 'roles.read',
    method: 'GET',
    route: '/admin/roles',
    description: 'List roles',
  },
  {
    name: 'roles.create',
    method: 'POST',
    route: '/admin/roles',
    description: 'Create role',
  },
  {
    name: 'roles.update',
    method: 'PATCH',
    route: '/admin/roles/:id/permissions',
    description: 'Assign/replace permissions for role',
  },
  {
    name: 'permissions.read',
    method: 'GET',
    route: '/admin/permissions',
    description: 'List all permissions',
  },
  {
    name: 'companies.create',
    method: 'POST',
    route: '/admin/companies',
    description: 'Create company',
  },
  {
    name: 'companies.update',
    method: 'PATCH',
    route: '/admin/companies/:id',
    description: 'Update company',
  },
  {
    name: 'companies.delete',
    method: 'DELETE',
    route: '/admin/companies/:id',
    description: 'Soft-delete company',
  },
  {
    name: 'jobs.create',
    method: 'POST',
    route: '/admin/jobs',
    description: 'Create job (draft)',
  },
  {
    name: 'jobs.update',
    method: 'PATCH',
    route: '/admin/jobs/:id',
    description: 'Update job',
  },
  {
    name: 'jobs.approve',
    method: 'POST',
    route: '/admin/jobs/:id/approve',
    description: 'Approve & publish job',
  },
  {
    name: 'jobs.reject',
    method: 'POST',
    route: '/admin/jobs/:id/reject',
    description: 'Reject job',
  },
  {
    name: 'jobs.delete',
    method: 'DELETE',
    route: '/admin/jobs/:id',
    description: 'Soft-delete job',
  },
  {
    name: 'applications.read',
    method: 'GET',
    route: '/admin/jobs/:id/applications',
    description: 'List applications for a job',
  },
  {
    name: 'applications.review',
    method: 'PATCH',
    route: '/admin/applications/:id/status',
    description: 'Update application status',
  },
];

export class SeedPermissions1786374359374 implements MigrationInterface {
  name = 'SeedPermissions1786374359374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const permission of PERMISSIONS) {
      await queryRunner.query(
        `INSERT INTO permissions (name, method, route, description) VALUES (?, ?, ?, ?)`,
        [
          permission.name,
          permission.method,
          permission.route,
          permission.description,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const names = PERMISSIONS.map((p) => p.name);
    await queryRunner.query(
      `DELETE FROM permissions WHERE name IN (${names.map(() => '?').join(',')})`,
      names,
    );
  }
}
