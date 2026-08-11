"use client";

import { ApplyButton } from "@/features/applications";
import { InitialsAvatar } from "@/shared/components/initials-avatar";
import { StatusBadge } from "@/shared/components/status-badge";
import { useJob } from "../hooks/use-job";
import { formatDate, formatEmploymentType, formatSalary } from "../utils/format-salary";

interface JobDetailPageProps {
  slug: string;
}

export function JobDetailPage({ slug }: JobDetailPageProps) {
  const { data: job, isLoading, error } = useJob(slug);

  if (isLoading) {
    return <div className="mx-auto max-w-4xl px-6 py-16 text-text-secondary">Loading job...</div>;
  }
  if (error || !job) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-text-secondary">
        Job not found. It may have been closed or is no longer published.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
      <div className="rounded-[14px] border border-mist bg-white p-8">
        <div className="mb-4 flex items-start gap-4">
          <InitialsAvatar name={job.companyName ?? "?"} size={56} />
          <div>
            <h1 className="font-display text-3xl text-void">{job.title}</h1>
            <p className="text-text-secondary">{job.companyName ?? "Unknown company"}</p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <StatusBadge status={job.status} kind="job" />
          <span className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-text-body">
            {formatEmploymentType(job.employmentType)}
          </span>
          {job.categoryName && (
            <span className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-text-body">
              {job.categoryName}
            </span>
          )}
          <span className="font-mono text-sm font-semibold text-void">
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_260px]">
          <div>
            <h2 className="mb-2 font-display text-xl text-void">About the role</h2>
            <p className="whitespace-pre-line text-text-body">{job.description}</p>
          </div>

          <aside className="flex flex-col gap-4 rounded-[14px] border border-mist p-5">
            <div>
              <p className="text-xs font-semibold uppercase text-text-secondary">Company</p>
              <p className="font-medium text-text-body">{job.companyName ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-text-secondary">Posted</p>
              <p className="font-mono text-sm text-text-body">{formatDate(job.createdAt)}</p>
            </div>
            <ApplyButton jobId={job.id} />
          </aside>
        </div>
      </div>
    </div>
  );
}
