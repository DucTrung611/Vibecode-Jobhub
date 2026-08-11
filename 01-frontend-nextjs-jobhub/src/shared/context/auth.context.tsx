"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ACCESS_TOKEN_COOKIE } from "@/shared/services/api-client";
import { deleteCookie, getCookie, setCookie } from "@/shared/utils/cookie.util";

const REFRESH_TOKEN_COOKIE = "jobhub_refresh_token";
const USER_COOKIE = "jobhub_user";
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export interface SessionUser {
  id: number;
  fullName: string;
  email: string;
  type: "user" | "admin";
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: SessionUser;
}

interface AuthContextValue {
  isLoggedIn: boolean;
  isAdminAccount: boolean;
  /**
   * False until the one-time cookie hydration effect below has run. Pages
   * that redirect unauthenticated visitors (e.g. `/profile`) must wait for
   * this before checking `isLoggedIn` — on mount, a child component's
   * effect fires *before* this provider's own effect, so `isLoggedIn` is
   * still `false` (not yet hydrated) the first time a child effect reads
   * it, which previously caused a false "not logged in" redirect on every
   * hard page load/reload even for an actually-logged-in session.
   */
  isAuthReady: boolean;
  user: SessionUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // One-time hydration from an external system (cookies) unavailable
    // during SSR — not a derived-state sync, so the effect is warranted.
    /* eslint-disable react-hooks/set-state-in-effect */
    const token = getCookie(ACCESS_TOKEN_COOKIE);
    const refresh = getCookie(REFRESH_TOKEN_COOKIE);
    const userRaw = getCookie(USER_COOKIE);
    if (!token || !refresh || !userRaw) {
      setIsAuthReady(true);
      return;
    }
    try {
      setAccessToken(token);
      setRefreshToken(refresh);
      setUser(JSON.parse(userRaw) as SessionUser);
    } catch {
      deleteCookie(ACCESS_TOKEN_COOKIE);
      deleteCookie(REFRESH_TOKEN_COOKIE);
      deleteCookie(USER_COOKIE);
    } finally {
      setIsAuthReady(true);
    }
  }, []);

  const setSession = (session: AuthSession) => {
    setCookie(ACCESS_TOKEN_COOKIE, session.accessToken, session.expiresIn);
    setCookie(REFRESH_TOKEN_COOKIE, session.refreshToken, REFRESH_TOKEN_MAX_AGE_SECONDS);
    setCookie(USER_COOKIE, JSON.stringify(session.user), REFRESH_TOKEN_MAX_AGE_SECONDS);
    setAccessToken(session.accessToken);
    setRefreshToken(session.refreshToken);
    setUser(session.user);
  };

  const clearSession = () => {
    deleteCookie(ACCESS_TOKEN_COOKIE);
    deleteCookie(REFRESH_TOKEN_COOKIE);
    deleteCookie(USER_COOKIE);
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoggedIn: accessToken !== null,
      isAdminAccount: user?.type === "admin",
      isAuthReady,
      user,
      accessToken,
      refreshToken,
      setSession,
      clearSession,
    }),
    [accessToken, refreshToken, user, isAuthReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
