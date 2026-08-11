"use client";

import { useState } from "react";
import type { Company, CompanySize, CreateCompanyPayload, UpdateCompanyPayload } from "../types/company.types";

const COMPANY_SIZES: CompanySize[] = ["1-10", "11-50", "51-200", "201-500", "500+"];

interface CompanyFormProps {
  initialValues?: Company;
  onSubmit: (payload: CreateCompanyPayload | UpdateCompanyPayload) => Promise<void>;
  onCancel: () => void;
}

export function CompanyForm({ initialValues, onSubmit, onCancel }: CompanyFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [size, setSize] = useState<CompanySize | "">(initialValues?.size ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [logoUrl, setLogoUrl] = useState(initialValues?.logoUrl ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        size: size || undefined,
        description: description || undefined,
        logoUrl: logoUrl || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="flex flex-col gap-4 rounded-[14px] border border-mist bg-white p-6"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-body">Company name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-[10px] border border-mist px-3 py-2 text-sm outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-body">Size</label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as CompanySize | "")}
            className="rounded-[10px] border border-mist px-3 py-2 text-sm outline-none"
          >
            <option value="">Not specified</option>
            {COMPANY_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-sm font-medium text-text-body">Logo URL</label>
          <input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="rounded-[10px] border border-mist px-3 py-2 text-sm outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-sm font-medium text-text-body">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-[10px] border border-mist px-3 py-2 text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-signal px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-mist px-6 py-3 text-sm font-semibold text-text-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
