import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

/**
 * Junction table owned entirely by this feature (`roles`, `permissions`,
 * `role_permissions` are all one feature per DATABASE.md's "Core Features"
 * list) — plain FK columns, no ORM relations needed since callers query
 * through `RolesPermissionsService`, not this entity directly.
 */
@Entity('role_permissions')
export class RolePermission {
  @PrimaryColumn({ name: 'role_id', type: 'bigint', unsigned: true })
  roleId: number;

  @PrimaryColumn({ name: 'permission_id', type: 'bigint', unsigned: true })
  permissionId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
