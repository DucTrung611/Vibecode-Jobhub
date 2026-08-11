"use client";

import { useState } from "react";
import { useAuth } from "@/shared/context/auth.context";
import { ApiError } from "@/shared/types/api.types";
import { decodeAccessToken } from "@/shared/utils/jwt.util";
import * as authService from "../services/auth.service";
import type { RegisterPayload } from "../types/auth.types";

export function useRegister() {
  const { setSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  async function submit(payload: RegisterPayload): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authService.registerUser(payload);
      const decoded = decodeAccessToken(result.accessToken);
      setSession({
        ...result,
        user: { ...result.user, type: decoded?.type ?? "user" },
      });
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(
        { code: "GENERIC_000", message: "Something went wrong", details: null },
        500,
      ));
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { submit, isLoading, error };
}
