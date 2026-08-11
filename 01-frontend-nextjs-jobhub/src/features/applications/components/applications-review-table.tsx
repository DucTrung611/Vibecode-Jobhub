"use client";

import { useMemo, useState } from "react";
import { InitialsAvatar } from "@/shared/components/initials-avatar";
import { ApplicationStatusBadge } from "./application-status-badge";
import type { Application, ApplicationStatus } from "../types/application.types";

const STATUS_OPTIONS: ApplicationStatus[] = ["pending", "reviewed", "shortlisted", "rejected", "accepted"];

interface JobOption {
  id: number;
  title: string;
}

interface ApplicationsReviewTableProps {
  jobs: JobOption[];
  selectedJobId: number | null;
  onSelectJob: (jobId: number | null) => void;
  applications: Application[];
  onStatusChange: (application: Application, status: ApplicationStatus) => Promise<void>;
}

export function ApplicationsReviewTable({
  jobs,
  selectedJobId,
  onSelectJob,
  applications,
  onStatusChange,
}: ApplicationsReviewTableProps) {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "">("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const filtered = useMemo(
    () => (statusFilter ? applications.filter((a) => a.status === statusFilter) : applications),
    [applications, statusFilter],
  );

  const selected = filtered.find((a) => a.id === selectedId) ?? filtered[0] ?? null;

  async function handleStatusChange(status: ApplicationStatus) {
    if (!selected) return;
    setIsUpdating(true);
    try {
      await onStatusChange(selected, status);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <select
          value={selectedJobId ?? ""}
          onChange={(e) => onSelectJob(e.target.value ? Number(e.target.value) : null)}
          className="rounded-[10px] border border-mist px-3 py-2 text-sm outline-none"
        >
          <option value="">Select a job...</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "")}
          className="rounded-[10px] border border-mist px-3 py-2 text-sm outline-none"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {!selectedJobId && (
        <p className="rounded-[14px] border border-mist bg-white p-6 text-text-secondary">
          Select a job to review its applications.
        </p>
      )}

      {selectedJobId && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px]">
          <div className="overflow-x-auto rounded-[14px] border border-mist bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-text-secondary">
                  <th className="px-4 py-3 font-medium">Candidate</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Applied</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => setSelectedId(app.id)}
                    className={`cursor-pointer border-b border-hairline last:border-0 ${
                      selected?.id === app.id ? "bg-paper" : ""
                    }`}
                  >
                    <td className="flex items-center gap-3 px-4 py-3">
                      <InitialsAvatar name={app.userFullName ?? "?"} size={32} />
                      <span className="font-medium text-text-body">{app.userFullName ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <ApplicationStatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 font-mono text-text-secondary">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-text-secondary">
                      No applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="rounded-[14px] border border-mist bg-white p-5">
            {!selected ? (
              <p className="text-text-secondary">Select a candidate to review.</p>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <InitialsAvatar name={selected.userFullName ?? "?"} size={44} />
                  <div>
                    <p className="font-display text-lg text-void">{selected.userFullName ?? "—"}</p>
                    <ApplicationStatusBadge status={selected.status} />
                  </div>
                </div>
                <a
                  href={selected.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-meridian"
                >
                  View resume
                </a>
                {selected.coverLetter && (
                  <p className="text-sm text-text-body">{selected.coverLetter}</p>
                )}
                <div className="flex flex-col gap-2 border-t border-hairline pt-4">
                  <span className="text-xs font-semibold uppercase text-text-secondary">
                    Update status
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={isUpdating || s === selected.status}
                        onClick={() => void handleStatusChange(s)}
                        className="rounded-full border border-mist px-3 py-1.5 text-xs font-semibold text-text-body disabled:opacity-40"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
