"use client";

import { useState } from "react";
import { ApiError } from "@/shared/types/api.types";
import * as applicationsService from "../services/applications.service";
import type { Application, ApplyPayload } from "../types/application.types";

export function useApply() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  async function submit(jobId: number, payload: ApplyPayload): Promise<Application | null> {
    setIsLoading(true);
    setError(null);
    try {
      return await applicationsService.applyToJob(jobId, payload);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err
          : new ApiError({ code: "GENERIC_000", message: "Something went wrong", details: null }, 500),
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return { submit, isLoading, error };
}
