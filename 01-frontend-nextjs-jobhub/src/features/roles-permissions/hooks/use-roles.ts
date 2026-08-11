"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/shared/types/api.types";
import * as rolesPermissionsService from "../services/roles-permissions.service";
import type { Role } from "../types/role.types";

export function useRoles() {
  const [data, setData] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const roles = await rolesPermissionsService.getRoles();
      setData(roles);
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
