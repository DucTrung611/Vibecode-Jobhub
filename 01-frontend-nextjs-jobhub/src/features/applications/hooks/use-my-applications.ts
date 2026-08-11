"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/shared/context/auth.context";
import { ApiError } from "@/shared/types/api.types";
import * as applicationsService from "../services/applications.service";
import type { Application } from "../types/application.types";

export function useMyApplications() {
  const { isLoggedIn } = useAuth();
  const [data, setData] = useState<Application[]>([]);
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
      const applications = await applicationsService.getMyApplications();
      setData(applications);
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
