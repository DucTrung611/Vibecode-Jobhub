"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/shared/types/api.types";
import * as dashboardService from "../services/dashboard.service";
import type { DashboardStats } from "../types/dashboard.types";

export function useDashboardStats() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    dashboardService
      .getDashboardStats()
      .then((stats) => {
         
        setData(stats);
      })
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? err
            : new ApiError({ code: "GENERIC_000", message: "Something went wrong", details: null }, 500),
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading, error };
}
