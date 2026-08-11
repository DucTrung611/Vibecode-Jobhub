"use client";

import { useState } from "react";
import { InitialsAvatar } from "@/shared/components/initials-avatar";
import type { Company } from "../types/company.types";

interface CompanyTableProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export function CompanyTable({ companies, onEdit, onDelete }: CompanyTableProps) {
  const [search, setSearch] = useState("");

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search companies..."
        className="w-full max-w-sm rounded-[10px] border border-mist px-4 py-2.5 text-sm outline-none"
      />

      <div className="overflow-x-auto rounded-[14px] border border-mist bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-text-secondary">
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Open Jobs</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((company) => (
              <tr key={company.id} className="border-b border-hairline last:border-0">
                <td className="flex items-center gap-3 px-4 py-3">
                  <InitialsAvatar name={company.name} size={32} />
                  <span className="font-medium text-text-body">{company.name}</span>
                </td>
                <td className="px-4 py-3 text-text-secondary">{company.size ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-text-secondary">—</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => onEdit(company)}
                      className="text-sm font-medium text-meridian"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(company)}
                      className="text-sm font-medium text-[#D6394B]"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-text-secondary">
                  No companies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
