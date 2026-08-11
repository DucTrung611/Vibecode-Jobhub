import { Injectable } from '@nestjs/common';
import { AdminsService } from '../../modules/admins/admins.service';
import { RolesPermissionsService } from '../../modules/roles-permissions/roles-permissions.service';
import { PermissionChecker } from '../../shared/types/permission-checker.interface';

/**
 * Composition point for the two feature services RBAC needs together.
 * Lives in core/auth (infra the whole app depends on, not a feature) so
 * `admins` and `roles-permissions` never need to import each other just to
 * answer "can this admin do X" — see roles-permissions/context.md.
 */
@Injectable()
export class AuthorizationService implements PermissionChecker {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly rolesPermissionsService: RolesPermissionsService,
  ) {}

  async adminHasPermission(
    adminId: number,
    permissionName: string,
  ): Promise<boolean> {
    const admin = await this.adminsService
      .findByIdOrThrow(adminId)
      .catch(() => null);
    if (!admin) return false;
    return this.rolesPermissionsService.roleHasPermission(
      admin.roleId,
      permissionName,
    );
  }
}
