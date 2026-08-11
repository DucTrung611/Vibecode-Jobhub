import { SetMetadata } from '@nestjs/common';

export const REQUIRE_PERMISSION_KEY = 'requirePermission';

/** Marks a route as needing a specific admin permission, checked by RolesGuard. */
export const RequirePermission = (permissionName: string) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, permissionName);
