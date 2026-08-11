"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/shared/types/api.types";
import * as rolesPermissionsService from "../services/roles-permissions.service";
import type { Permission } from "../types/role.types";

export function usePermissions() {
  const [data, setData] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    let cancelled = false;
    rolesPermissionsService
      .getPermissions()
      .then((permissions) => {
        if (!cancelled) setData(permissions);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err
              : new ApiError({ code: "GENERIC_000", message: "Something went wrong", details: null }, 500),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading, error };
}
