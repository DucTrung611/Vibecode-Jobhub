"use client";

import { useState } from "react";
import type {
  CreateJobPayload,
  EmploymentType,
  Job,
  UpdateJobPayload,
} from "../types/job.types";

const EMPLOYMENT_TYPES: EmploymentType[] = ["full_time", "part_time", "contract", "internship", "remote"];

interface CategoryOption {
  id: number;
  name: string;
}
interface CompanyOption {
  id: number;
  name: string;
}

interface JobFormProps {
  initialValues?: Job;
  categories: CategoryOption[];
  companies: CompanyOption[];
  onSubmit: (payload: CreateJobPayload | UpdateJobPayload) => Promise<void>;
  onCancel: () => void;
}

export function JobForm({ initialValues, categories, companies, onSubmit, onCancel }: JobFormProps) {
  const isEdit = Boolean(initialValues);
  const [companyId, setCompanyId] = useState(initialValues?.companyId ?? companies[0]?.id ?? 0);
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? categories[0]?.id ?? 0);
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [employmentType, setEmploymentType] = useState<EmploymentType>(
    initialValues?.employmentType ?? "full_time",
  );
  const [salaryMin, setSalaryMin] = useState(initialValues?.salaryMin ?? "");
  const [salaryMax, setSalaryMax] = useState(initialValues?.salaryMax ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const base = {
        categoryId: Number(categoryId),
        title,
        description,
        employmentType,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
      };
      if (isEdit) {
        await onSubmit(base);
      } else {
        await onSubmit({ ...base, companyId: Number(companyId) });
      }
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
        {!isEdit && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-body">Company</label>
            <select
              required
              value={companyId}
              onChange={(e) => setCompanyId(Number(e.target.value))}
              className="rounded-[10px] border border-mist px-3 py-2 text-sm outline-none"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-body">Category</label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="rounded-[10px] border border-mist px-3 py-2 text-sm outline-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-sm font-medium text-text-body">Job title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-[10px] border border-mist px-3 py-2 text-sm outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-body">Employment type</label>
          <select
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
            className="rounded-[10px] border border-mist px-3 py-2 text-sm outline-none"
          >
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-sm font-medium text-text-body">Salary min</label>
            <input
              type="number"
              min={0}
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              className="rounded-[10px] border border-mist px-3 py-2 text-sm outline-none"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-sm font-medium text-text-body">Salary max</label>
            <input
              type="number"
              min={0}
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              className="rounded-[10px] border border-mist px-3 py-2 text-sm outline-none"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-sm font-medium text-text-body">Description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
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
