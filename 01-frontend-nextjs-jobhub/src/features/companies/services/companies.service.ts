import { apiClient } from "@/shared/services/api-client";
import type { Company, CreateCompanyPayload, UpdateCompanyPayload } from "../types/company.types";

export async function getCompanies(): Promise<Company[]> {
  const res = await apiClient.get<Company[]>("/companies", {
    params: { limit: 100 },
    skipAuth: true,
  });
  return res.data;
}

export async function createCompany(payload: CreateCompanyPayload): Promise<Company> {
  const res = await apiClient.post<Company>("/admin/companies", payload);
  return res.data;
}

export async function updateCompany(id: number, payload: UpdateCompanyPayload): Promise<Company> {
  const res = await apiClient.patch<Company>(`/admin/companies/${id}`, payload);
  return res.data;
}

export async function deleteCompany(id: number): Promise<void> {
  await apiClient.delete(`/admin/companies/${id}`);
}
