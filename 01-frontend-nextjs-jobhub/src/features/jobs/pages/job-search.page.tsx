"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { JobCard } from "../components/job-card";
import { JobFilterBar } from "../components/job-filter-bar";
import { useJobs } from "../hooks/use-jobs";
import { useSavedJobs } from "../hooks/use-saved-jobs";
import * as jobsService from "../services/jobs.service";
import type { Category, EmploymentType } from "../types/job.types";

export function JobSearchPage() {
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    jobsService
      .getCategories()
       
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const filters = useMemo(
    () => ({
      categoryId: searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined,
      employmentType: (searchParams.get("employmentType") || undefined) as EmploymentType | undefined,
      limit: 50,
    }),
    [searchParams],
  );
  const keyword = searchParams.get("keyword")?.trim().toLowerCase() ?? "";

  const { data: jobs, isLoading, error } = useJobs(filters);
  const { data: savedJobs } = useSavedJobs();
  const savedIds = new Set(savedJobs.map((j) => j.id));

  const filteredJobs = keyword
    ? jobs.filter((j) => j.title.toLowerCase().includes(keyword))
    : jobs;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
      <h1 className="mb-6 font-display text-3xl text-void">Find your next role</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
        <aside>
          <JobFilterBar categories={categories} />
        </aside>
        <div className="flex flex-col gap-4">
          {isLoading && <p className="text-text-secondary">Loading jobs...</p>}
          {error && <p className="text-[#D6394B]">Failed to load jobs: {error.message}</p>}
          {!isLoading && !error && filteredJobs.length === 0 && (
            <p className="text-text-secondary">No jobs match your filters.</p>
          )}
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} isSaved={savedIds.has(job.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
