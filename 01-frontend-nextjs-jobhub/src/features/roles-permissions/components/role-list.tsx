"use client";

import { useState } from "react";
import type { Role } from "../types/role.types";

interface RoleListProps {
  roles: Role[];
  selectedRoleId: number | null;
  onSelect: (roleId: number) => void;
  onCreate: (name: string) => Promise<void>;
}

export function RoleList({ roles, selectedRoleId, onSelect, onCreate }: RoleListProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreate(name.trim());
      setName("");
      setIsCreating(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-[14px] border border-mist bg-white p-4">
      {roles.map((role) => (
        <button
          key={role.id}
          type="button"
          onClick={() => onSelect(role.id)}
          className={`rounded-[10px] px-4 py-3 text-left text-sm font-medium transition ${
            role.id === selectedRoleId
              ? "bg-void text-white"
              : "text-text-body hover:bg-paper"
          }`}
        >
          {role.name}
        </button>
      ))}

      {isCreating ? (
        <div className="mt-2 flex flex-col gap-2 border-t border-hairline pt-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Role name"
            className="rounded-[10px] border border-mist px-3 py-2 text-sm outline-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void handleCreate()}
              disabled={isSubmitting}
              className="flex-1 rounded-full bg-signal px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="flex-1 rounded-full border border-mist px-4 py-2 text-sm font-semibold text-text-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="mt-2 rounded-[10px] border border-dashed border-mist px-4 py-3 text-left text-sm font-medium text-meridian"
        >
          + Create new role
        </button>
      )}
    </div>
  );
}
