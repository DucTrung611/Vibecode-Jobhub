"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/shared/types/api.types";
import * as jobsService from "../services/jobs.service";
import type { Job } from "../types/job.types";

export function useJob(slug: string) {
  const [data, setData] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const job = await jobsService.getJobBySlug(slug);
      setData(job);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err
          : new ApiError({ code: "GENERIC_000", message: "Something went wrong", details: null }, 500),
      );
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}
