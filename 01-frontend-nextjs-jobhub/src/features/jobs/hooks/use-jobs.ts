"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, type PaginationMeta } from "@/shared/types/api.types";
import * as jobsService from "../services/jobs.service";
import type { Job, JobFilters } from "../types/job.types";

function toApiError(err: unknown): ApiError {
  return err instanceof ApiError
    ? err
    : new ApiError({ code: "GENERIC_000", message: "Something went wrong", details: null }, 500);
}

export function useJobs(filters: JobFilters) {
  const [data, setData] = useState<Job[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const filtersKey = JSON.stringify(filters);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await jobsService.getJobs(filters);
      setData(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(toApiError(err));
    } finally {
      setIsLoading(false);
    }
    // filters passed by value below via filtersKey dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refetch();
  }, [refetch]);

  return { data, meta, isLoading, error, refetch };
}
