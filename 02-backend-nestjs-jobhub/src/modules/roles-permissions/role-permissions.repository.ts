import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';

@Injectable()
export class RolePermissionsRepository {
  constructor(
    @InjectRepository(RolePermission)
    private readonly repository: Repository<RolePermission>,
  ) {}

  /**
   * Keyed by `String(roleId)`, not `number` — mysql2 returns BIGINT columns
   * as JS strings at runtime (unlike the `number` TS type on the entity),
   * so a numeric Map key would silently never match `role.id` on lookup.
   */
  async findPermissionNamesForRoleIds(
    roleIds: number[],
  ): Promise<Map<string, string[]>> {
    const byRoleId = new Map<string, string[]>();
    if (roleIds.length === 0) return byRoleId;

    const rows = await this.repository
      .createQueryBuilder('rp')
      .innerJoin(Permission, 'p', 'p.id = rp.permission_id')
      .select(['rp.roleId AS roleId', 'p.name AS permissionName'])
      .where('rp.role_id IN (:...roleIds)', { roleIds })
      .getRawMany<{ roleId: string; permissionName: string }>();

    for (const row of rows) {
      const roleId = String(row.roleId);
      const list = byRoleId.get(roleId) ?? [];
      list.push(row.permissionName);
      byRoleId.set(roleId, list);
    }
    return byRoleId;
  }

  async roleHasPermission(
    roleId: number,
    permissionName: string,
  ): Promise<boolean> {
    const count = await this.repository
      .createQueryBuilder('rp')
      .innerJoin(Permission, 'p', 'p.id = rp.permission_id')
      .where('rp.role_id = :roleId', { roleId })
      .andWhere('p.name = :permissionName', { permissionName })
      .getCount();
    return count > 0;
  }

  async replaceForRole(roleId: number, permissionIds: number[]): Promise<void> {
    await this.repository.manager.transaction(async (manager) => {
      await manager.delete(RolePermission, { roleId });
      if (permissionIds.length === 0) return;
      const rows = permissionIds.map((permissionId) =>
        manager.create(RolePermission, { roleId, permissionId }),
      );
      await manager.save(rows);
    });
  }
}
