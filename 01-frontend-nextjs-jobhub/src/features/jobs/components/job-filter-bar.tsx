"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "@/shared/components/icons";
import type { Category, EmploymentType } from "../types/job.types";

const EMPLOYMENT_TYPES: EmploymentType[] = ["full_time", "part_time", "contract", "internship", "remote"];

interface JobFilterBarProps {
  categories: Category[];
}

/**
 * Filters live in the URL (`?keyword=&categoryId=&employmentType=`) per
 * PROJECT-RULES-FRONTEND.md §3 ("URL params/route state — preferred over
 * Context for filters"), not a feature Context.
 */
export function JobFilterBar({ categories }: JobFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/jobs?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4 rounded-[14px] border border-mist bg-white p-5">
      <div className="flex items-center gap-2 rounded-full border border-mist px-4 py-2.5">
        <SearchIcon className="h-4 w-4 text-text-secondary" />
        <input
          defaultValue={searchParams.get("keyword") ?? ""}
          onChange={(e) => setParam("keyword", e.target.value)}
          placeholder="Search job titles..."
          className="w-full text-sm outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-body">Category</label>
        <select
          value={searchParams.get("categoryId") ?? ""}
          onChange={(e) => setParam("categoryId", e.target.value)}
          className="rounded-[10px] border border-mist px-3 py-2 text-sm outline-none"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.jobCount})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-body">Employment type</label>
        <select
          value={searchParams.get("employmentType") ?? ""}
          onChange={(e) => setParam("employmentType", e.target.value)}
          className="rounded-[10px] border border-mist px-3 py-2 text-sm outline-none"
        >
          <option value="">All types</option>
          {EMPLOYMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
