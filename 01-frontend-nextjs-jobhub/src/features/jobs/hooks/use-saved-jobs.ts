"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/shared/context/auth.context";
import { ApiError } from "@/shared/types/api.types";
import * as jobsService from "../services/jobs.service";
import type { Job } from "../types/job.types";

export function useSavedJobs() {
  const { isLoggedIn } = useAuth();
  const [data, setData] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const refetch = useCallback(async () => {
    if (!isLoggedIn) {
      setData([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const jobs = await jobsService.getSavedJobs();
      setData(jobs);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err
          : new ApiError({ code: "GENERIC_000", message: "Something went wrong", details: null }, 500),
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}
