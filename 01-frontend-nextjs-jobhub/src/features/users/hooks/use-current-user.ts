"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/shared/context/auth.context";
import { ApiError } from "@/shared/types/api.types";
import * as usersService from "../services/users.service";
import type { User } from "../types/user.types";

export function useCurrentUser() {
  const { isLoggedIn } = useAuth();
  const [data, setData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isLoggedIn);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    let cancelled = false;
    // Reflects the in-flight state of the fetch kicked off right below —
    // not a derived-state sync, so the effect is the right place for it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    usersService
      .getMe()
      .then((user) => {
        if (!cancelled) setData(user);
      })
      .catch((err) => {
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
  }, [isLoggedIn]);

  return { data: isLoggedIn ? data : null, isLoading: isLoggedIn && isLoading, error };
}
