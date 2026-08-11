"use client";

import { useEffect, useState } from "react";
import { companiesService } from "@/features/companies";
import { JobForm } from "../components/job-form";
import { JobTable } from "../components/job-table";
import { useAdminJobs } from "../hooks/use-admin-jobs";
import * as jobsService from "../services/jobs.service";
import type { Category, CreateJobPayload, Job, UpdateJobPayload } from "../types/job.types";

type FormMode = { kind: "create" } | { kind: "edit"; job: Job } | null;

export function JobManagementPage() {
  const { data: jobs, refetch } = useAdminJobs({ limit: 100 });
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    jobsService.getCategories().then(setCategories).catch(() => setCategories([]));
    companiesService
      .getCompanies()
      .then((cs) => setCompanies(cs.map((c) => ({ id: c.id, name: c.name }))))
      .catch(() => setCompanies([]));
  }, []);

  async function handleSubmit(payload: CreateJobPayload | UpdateJobPayload) {
    if (formMode?.kind === "edit") {
      await jobsService.updateJob(formMode.job.id, payload);
    } else {
      await jobsService.createJob(payload as CreateJobPayload);
    }
    setFormMode(null);
    await refetch();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-void">Job Management</h1>
        {!formMode && (
          <button
            type="button"
            onClick={() => setFormMode({ kind: "create" })}
            disabled={companies.length === 0}
            className="rounded-full bg-signal px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            New Job
          </button>
        )}
      </div>

      {formMode && (
        <JobForm
          initialValues={formMode.kind === "edit" ? formMode.job : undefined}
          categories={categories}
          companies={companies}
          onSubmit={handleSubmit}
          onCancel={() => setFormMode(null)}
        />
      )}

      <JobTable
        jobs={jobs}
        onEdit={(job) => setFormMode({ kind: "edit", job })}
        onChanged={refetch}
      />
    </div>
  );
}
