"use client";

import { useState } from "react";
import { PermissionGrid } from "../components/permission-grid";
import { RoleList } from "../components/role-list";
import { useRoles } from "../hooks/use-roles";
import { usePermissions } from "../hooks/use-permissions";
import * as rolesPermissionsService from "../services/roles-permissions.service";

export function RolesPermissionsPage() {
  const { data: roles, refetch: refetchRoles } = useRoles();
  const { data: permissions } = usePermissions();
  // Explicit user pick, if any; falls back to the first role once roles load
  // — derived at render time instead of synced via effect+setState.
  const [explicitRoleId, setExplicitRoleId] = useState<number | null>(null);
  const selectedRoleId = explicitRoleId ?? roles[0]?.id ?? null;

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;

  async function handleCreateRole(name: string) {
    const created = await rolesPermissionsService.createRole({ name });
    await refetchRoles();
    setExplicitRoleId(created.id);
  }

  async function handleSavePermissions(permissionIds: number[]) {
    if (!selectedRole) return;
    await rolesPermissionsService.assignPermissions(selectedRole.id, permissionIds);
    await refetchRoles();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl text-void">Roles & Permissions</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
        <RoleList
          roles={roles}
          selectedRoleId={selectedRoleId}
          onSelect={setExplicitRoleId}
          onCreate={handleCreateRole}
        />
        <PermissionGrid
          permissions={permissions}
          selectedRole={selectedRole}
          onSave={handleSavePermissions}
        />
      </div>
    </div>
  );
}
