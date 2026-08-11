import { apiClient } from "@/shared/services/api-client";
import type { Application, ApplicationStatus, ApplyPayload } from "../types/application.types";

export async function applyToJob(jobId: number, payload: ApplyPayload): Promise<Application> {
  const res = await apiClient.post<Application>(`/jobs/${jobId}/applications`, payload);
  return res.data;
}

export async function getMyApplications(): Promise<Application[]> {
  const res = await apiClient.get<Application[]>("/users/me/applications", {
    params: { limit: 100 },
  });
  return res.data;
}

export async function getApplicationsForJob(jobId: number): Promise<Application[]> {
  const res = await apiClient.get<Application[]>(`/admin/jobs/${jobId}/applications`, {
    params: { limit: 100 },
  });
  return res.data;
}

export async function updateApplicationStatus(
  id: number,
  status: ApplicationStatus,
): Promise<Application> {
  const res = await apiClient.patch<Application>(`/admin/applications/${id}/status`, { status });
  return res.data;
}
