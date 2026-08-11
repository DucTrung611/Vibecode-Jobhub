"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/shared/types/api.types";
import * as companiesService from "../services/companies.service";
import type { Company } from "../types/company.types";

export function useCompanies() {
  const [data, setData] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const companies = await companiesService.getCompanies();
      setData(companies);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err
          : new ApiError({ code: "GENERIC_000", message: "Something went wrong", details: null }, 500),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch on mount — kicks off an external system call whose
    // in-flight/result state is reflected via refetch's own setState calls.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}
