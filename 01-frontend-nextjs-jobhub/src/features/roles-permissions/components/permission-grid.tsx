"use client";

import { useState } from "react";
import type { Permission, Role } from "../types/role.types";

interface PermissionGridProps {
  permissions: Permission[];
  selectedRole: Role | null;
  onSave: (permissionIds: number[]) => Promise<void>;
}

function groupByModule(permissions: Permission[]): Map<string, Permission[]> {
  const groups = new Map<string, Permission[]>();
  for (const permission of permissions) {
    const [module] = permission.name.split(".");
    const list = groups.get(module) ?? [];
    list.push(permission);
    groups.set(module, list);
  }
  return groups;
}

export function PermissionGrid({ permissions, selectedRole, onSave }: PermissionGridProps) {
  if (!selectedRole) {
    return (
      <div className="rounded-[14px] border border-mist bg-white p-8 text-center text-sm text-text-secondary">
        Select a role to view its permissions.
      </div>
    );
  }

  // Don't mount the (lazy-initialized) inner grid until permissions have
  // actually loaded — otherwise it derives checkedIds from an empty list
  // and, since it never re-syncs after mount (see below), stays empty
  // forever once permissions do arrive.
  if (permissions.length === 0) {
    return (
      <div className="rounded-[14px] border border-mist bg-white p-8 text-center text-sm text-text-secondary">
        Loading permissions...
      </div>
    );
  }

  // Remounts (and re-derives initial checkbox state) whenever the selected
  // role changes, instead of syncing local edit state via useEffect.
  return (
    <PermissionGridForRole
      key={selectedRole.id}
      permissions={permissions}
      selectedRole={selectedRole}
      onSave={onSave}
    />
  );
}

function PermissionGridForRole({
  permissions,
  selectedRole,
  onSave,
}: PermissionGridProps & { selectedRole: Role }) {
  const [checkedIds, setCheckedIds] = useState<Set<number>>(
    () =>
      new Set(
        permissions
          .filter((permission) => selectedRole.permissions.includes(permission.name))
          .map((permission) => permission.id),
      ),
  );
  const [isSaving, setIsSaving] = useState(false);

  function toggle(permissionId: number) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) next.delete(permissionId);
      else next.add(permissionId);
      return next;
    });
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSave(Array.from(checkedIds));
    } finally {
      setIsSaving(false);
    }
  }

  const groups = groupByModule(permissions);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from(groups.entries()).map(([module, modulePermissions]) => (
          <div key={module} className="rounded-[14px] border border-mist bg-white p-4">
            <h3 className="mb-3 font-display text-sm capitalize text-void">{module}</h3>
            <div className="flex flex-col gap-2">
              {modulePermissions.map((permission) => (
                <label
                  key={permission.id}
                  className="flex items-center gap-2 text-sm text-text-body"
                >
                  <input
                    type="checkbox"
                    checked={checkedIds.has(permission.id)}
                    onChange={() => toggle(permission.id)}
                    className="h-4 w-4 accent-signal"
                  />
                  {permission.name}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={isSaving}
        className="self-start rounded-full bg-signal px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isSaving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
