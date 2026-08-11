import { apiClient } from "@/shared/services/api-client";
import type { DashboardStats } from "../types/dashboard.types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await apiClient.get<DashboardStats>("/admin/dashboard/stats");
  return res.data;
}
