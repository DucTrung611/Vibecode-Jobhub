import { apiClient } from "@/shared/services/api-client";
import type { CreateRolePayload, Permission, Role } from "../types/role.types";

export async function getRoles(): Promise<Role[]> {
  const res = await apiClient.get<Role[]>("/admin/roles", { params: { limit: 100 } });
  return res.data;
}

export async function createRole(payload: CreateRolePayload): Promise<Role> {
  const res = await apiClient.post<Role>("/admin/roles", payload);
  return res.data;
}

export async function getPermissions(): Promise<Permission[]> {
  const res = await apiClient.get<Permission[]>("/admin/permissions", { params: { limit: 100 } });
  return res.data;
}

export async function assignPermissions(roleId: number, permissionIds: number[]): Promise<Role> {
  const res = await apiClient.patch<Role>(`/admin/roles/${roleId}/permissions`, { permissionIds });
  return res.data;
}
