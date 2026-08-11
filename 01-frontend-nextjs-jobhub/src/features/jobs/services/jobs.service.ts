import { apiClient } from "@/shared/services/api-client";
import type { ApiSuccessResponse } from "@/shared/types/api.types";
import type {
  AdminJobFilters,
  Category,
  CreateJobPayload,
  Job,
  JobFilters,
  UpdateJobPayload,
} from "../types/job.types";

// `keyword` is a client-side-only filter (no backend query param exists for
// it per API_SPEC.md `GET /jobs`), so it's stripped before hitting the API.
function toParams(filters: JobFilters) {
  return {
    page: filters.page,
    limit: filters.limit,
    employmentType: filters.employmentType,
    categoryId: filters.categoryId,
  };
}

export async function getJobs(filters: JobFilters = {}): Promise<ApiSuccessResponse<Job[]>> {
  return apiClient.get<Job[]>("/jobs", { params: toParams(filters), skipAuth: true });
}

export async function getJobBySlug(slug: string): Promise<Job> {
  const res = await apiClient.get<Job>(`/jobs/${slug}`, { skipAuth: true });
  return res.data;
}

export async function getCategories(): Promise<Category[]> {
  const res = await apiClient.get<Category[]>("/jobs/categories", { skipAuth: true });
  return res.data;
}

export async function saveJob(id: number): Promise<void> {
  await apiClient.post(`/jobs/${id}/save`);
}

export async function unsaveJob(id: number): Promise<void> {
  await apiClient.delete(`/jobs/${id}/save`);
}

export async function getSavedJobs(): Promise<Job[]> {
  const res = await apiClient.get<Job[]>("/users/me/saved-jobs", { params: { limit: 100 } });
  return res.data;
}

export async function getAdminJobs(filters: AdminJobFilters = {}): Promise<ApiSuccessResponse<Job[]>> {
  return apiClient.get<Job[]>("/admin/jobs", {
    params: { ...toParams(filters), status: filters.status },
  });
}

export async function getAdminJob(id: number): Promise<Job> {
  const res = await apiClient.get<Job>(`/admin/jobs/${id}`);
  return res.data;
}

export async function createJob(payload: CreateJobPayload): Promise<Job> {
  const res = await apiClient.post<Job>("/admin/jobs", payload);
  return res.data;
}

export async function updateJob(id: number, payload: UpdateJobPayload): Promise<Job> {
  const res = await apiClient.patch<Job>(`/admin/jobs/${id}`, payload);
  return res.data;
}

export async function submitForReview(id: number): Promise<Job> {
  return updateJob(id, { status: "pending_review" });
}

export async function approveJob(id: number): Promise<Job> {
  const res = await apiClient.post<Job>(`/admin/jobs/${id}/approve`);
  return res.data;
}

export async function rejectJob(id: number): Promise<Job> {
  const res = await apiClient.post<Job>(`/admin/jobs/${id}/reject`);
  return res.data;
}

export async function deleteJob(id: number): Promise<void> {
  await apiClient.delete(`/admin/jobs/${id}`);
}
