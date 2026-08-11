"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/context/auth.context";
import { InitialsAvatar } from "@/shared/components/initials-avatar";
import { NotchedCard } from "@/shared/components/notched-card";
import { StatusBadge } from "@/shared/components/status-badge";
import { BookmarkIcon } from "@/shared/components/icons";
import * as jobsService from "../services/jobs.service";
import { formatDate, formatEmploymentType, formatSalary } from "../utils/format-salary";
import type { Job } from "../types/job.types";

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onToggleSaved?: (job: Job, saved: boolean) => void;
}

export function JobCard({ job, isSaved = false, onToggleSaved }: JobCardProps) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(isSaved);
  const [isSaving, setIsSaving] = useState(false);

  async function handleToggleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setIsSaving(true);
    try {
      if (saved) {
        await jobsService.unsaveJob(job.id);
      } else {
        await jobsService.saveJob(job.id);
      }
      setSaved(!saved);
      onToggleSaved?.(job, !saved);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Link href={`/jobs/${job.slug}`} className="block">
      <NotchedCard className="flex flex-col gap-4 rounded-[14px] border border-mist p-6 transition hover:border-meridian">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <InitialsAvatar name={job.companyName ?? "?"} size={44} />
            <div>
              <h3 className="font-display text-lg text-void">{job.title}</h3>
              <p className="text-sm text-text-secondary">{job.companyName ?? "Unknown company"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => void handleToggleSave(e)}
            disabled={isSaving}
            aria-label={saved ? "Remove from saved jobs" : "Save job"}
            className="shrink-0 rounded-full p-2 text-text-secondary hover:bg-paper disabled:opacity-50"
          >
            <BookmarkIcon filled={saved} className="h-5 w-5 text-signal" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={job.status} kind="job" />
          <span className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-text-body">
            {formatEmploymentType(job.employmentType)}
          </span>
          {job.categoryName && (
            <span className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-text-body">
              {job.categoryName}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-hairline pt-4">
          <span className="font-mono text-sm font-semibold text-void">
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
          <span className="font-mono text-xs text-text-secondary">{formatDate(job.createdAt)}</span>
        </div>
      </NotchedCard>
    </Link>
  );
}
