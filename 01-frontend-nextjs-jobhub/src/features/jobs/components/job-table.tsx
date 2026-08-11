"use client";

import { useState } from "react";
import { StatusBadge } from "@/shared/components/status-badge";
import * as jobsService from "../services/jobs.service";
import { formatEmploymentType } from "../utils/format-salary";
import type { Job } from "../types/job.types";

interface JobTableProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onChanged: () => void | Promise<void>;
}

export function JobTable({ jobs, onEdit, onChanged }: JobTableProps) {
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const filtered = jobs.filter((j) => j.title.toLowerCase().includes(search.trim().toLowerCase()));

  async function runAction(id: number, action: () => Promise<unknown>) {
    setBusyId(id);
    try {
      await action();
      await onChanged();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(job: Job) {
    if (!window.confirm(`Delete "${job.title}"?`)) return;
    await runAction(job.id, () => jobsService.deleteJob(job.id));
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search jobs..."
        className="w-full max-w-sm rounded-[10px] border border-mist px-4 py-2.5 text-sm outline-none"
      />

      <div className="overflow-x-auto rounded-[14px] border border-mist bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-text-secondary">
              <th className="px-4 py-3 font-medium">Job</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((job) => {
              const isBusy = busyId === job.id;
              return (
                <tr key={job.id} className="border-b border-hairline last:border-0">
                  <td className="px-4 py-3 font-medium text-text-body">{job.title}</td>
                  <td className="px-4 py-3 text-text-secondary">{job.companyName ?? "—"}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {formatEmploymentType(job.employmentType)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={job.status} kind="job" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => onEdit(job)}
                        className="text-sm font-medium text-meridian"
                      >
                        Edit
                      </button>
                      {job.status === "draft" && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            void runAction(job.id, () => jobsService.submitForReview(job.id))
                          }
                          className="text-sm font-medium text-status-pending-fg disabled:opacity-50"
                        >
                          Submit for review
                        </button>
                      )}
                      {job.status === "pending_review" && (
                        <>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void runAction(job.id, () => jobsService.approveJob(job.id))}
                            className="text-sm font-medium text-status-open-fg disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void runAction(job.id, () => jobsService.rejectJob(job.id))}
                            className="text-sm font-medium text-status-closed-fg disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void handleDelete(job)}
                        className="text-sm font-medium text-[#D6394B] disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                  No jobs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
