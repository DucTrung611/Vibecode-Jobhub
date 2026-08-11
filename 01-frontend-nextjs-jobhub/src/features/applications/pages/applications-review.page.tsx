"use client";

import { useEffect, useState } from "react";
import { jobsService } from "@/features/jobs";
import { ApplicationsReviewTable } from "../components/applications-review-table";
import { useJobApplications } from "../hooks/use-job-applications";
import * as applicationsService from "../services/applications.service";
import type { ApplicationStatus, Application } from "../types/application.types";

interface JobOption {
  id: number;
  title: string;
}

export function ApplicationsReviewPage() {
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  useEffect(() => {
    jobsService
      .getAdminJobs({ limit: 100 })
      .then((res) => setJobs(res.data.map((j) => ({ id: j.id, title: j.title }))))
      .catch(() => setJobs([]));
  }, []);

  const { data: applications, refetch } = useJobApplications(selectedJobId);

  async function handleStatusChange(application: Application, status: ApplicationStatus) {
    await applicationsService.updateApplicationStatus(application.id, status);
    await refetch();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl text-void">Applications Review</h1>
      <ApplicationsReviewTable
        jobs={jobs}
        selectedJobId={selectedJobId}
        onSelectJob={setSelectedJobId}
        applications={applications}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
