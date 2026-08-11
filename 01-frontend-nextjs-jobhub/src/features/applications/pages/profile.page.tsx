"use client";

import { JobCard, useSavedJobs } from "@/features/jobs";
import { ApplicationStatusBadge } from "../components/application-status-badge";
import { useMyApplications } from "../hooks/use-my-applications";

/**
 * Rounded-down replacement for the prototype's full Profile modal
 * (Personal Info/CV tabs are out of scope this phase) — see
 * features/applications/context.md "Key decisions".
 */
export function ProfilePage() {
  const { data: applications, isLoading: applicationsLoading } = useMyApplications();
  const { data: savedJobs, isLoading: savedJobsLoading } = useSavedJobs();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
      <h1 className="mb-8 font-display text-3xl text-void">My Applications &amp; Saved Jobs</h1>

      <section className="mb-10">
        <h2 className="mb-4 font-display text-xl text-void">My Applications</h2>
        {applicationsLoading && <p className="text-text-secondary">Loading...</p>}
        {!applicationsLoading && applications.length === 0 && (
          <p className="text-text-secondary">You haven&apos;t applied to any jobs yet.</p>
        )}
        <div className="flex flex-col gap-3">
          {applications.map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between rounded-[14px] border border-mist bg-white p-4"
            >
              <div>
                <p className="font-medium text-text-body">{app.jobTitle ?? `Job #${app.jobId}`}</p>
                <p className="font-mono text-xs text-text-secondary">
                  Applied {new Date(app.createdAt).toLocaleDateString()}
                </p>
              </div>
              <ApplicationStatusBadge status={app.status} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl text-void">Saved Jobs</h2>
        {savedJobsLoading && <p className="text-text-secondary">Loading...</p>}
        {!savedJobsLoading && savedJobs.length === 0 && (
          <p className="text-text-secondary">No saved jobs yet.</p>
        )}
        <div className="flex flex-col gap-4">
          {savedJobs.map((job) => (
            <JobCard key={job.id} job={job} isSaved />
          ))}
        </div>
      </section>
    </div>
  );
}
