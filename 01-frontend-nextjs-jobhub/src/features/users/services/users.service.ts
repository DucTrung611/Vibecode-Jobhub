import { apiClient } from "@/shared/services/api-client";
import type { UpdateUserPayload, User } from "../types/user.types";

export async function getMe(): Promise<User> {
  const res = await apiClient.get<User>("/users/me");
  return res.data;
}

export async function updateMe(payload: UpdateUserPayload): Promise<User> {
  const res = await apiClient.patch<User>("/users/me", payload);
  return res.data;
}

export async function uploadResume(file: File): Promise<User> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post<User>("/users/me/resume", formData, { isFormData: true });
  return res.data;
}

export async function deactivateMe(): Promise<void> {
  await apiClient.delete("/users/me");
}
