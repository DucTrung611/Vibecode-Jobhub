import { apiClient } from "@/shared/services/api-client";
import type { AuthResult, LoginPayload, RegisterPayload } from "../types/auth.types";

export async function registerUser(payload: RegisterPayload): Promise<AuthResult> {
  const res = await apiClient.post<AuthResult>("/auth/register", payload, { skipAuth: true });
  return res.data;
}

export async function login(payload: LoginPayload): Promise<AuthResult> {
  const res = await apiClient.post<AuthResult>("/auth/login", payload, { skipAuth: true });
  return res.data;
}

export async function refreshTokens(refreshToken: string): Promise<AuthResult> {
  const res = await apiClient.post<AuthResult>(
    "/auth/refresh",
    { refreshToken },
    { skipAuth: true },
  );
  return res.data;
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post("/auth/logout", { refreshToken });
}
