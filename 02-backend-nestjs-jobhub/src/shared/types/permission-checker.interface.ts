export const PERMISSION_CHECKER = Symbol('PERMISSION_CHECKER');

export interface PermissionChecker {
  adminHasPermission(adminId: number, permissionName: string): Promise<boolean>;
}
