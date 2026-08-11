import { ApiError, ApiErrorResponse, ApiSuccessResponse } from "@/shared/types/api.types";
import { getCookie } from "@/shared/utils/cookie.util";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";
const ACCESS_TOKEN_COOKIE = "jobhub_access_token";

/**
 * Cookie-based, not a React hook, so it also works server-side once
 * Server Component fetching needs it (Phase 4+); server-side currently
 * has no cookie source wired and returns undefined.
 */
function getAccessToken(): string | undefined {
  return getCookie(ACCESS_TOKEN_COOKIE);
}

interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  isFormData?: boolean;
  skipAuth?: boolean;
}

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  options: RequestOptions = {},
): Promise<ApiSuccessResponse<T>> {
  const headers: HeadersInit = {};
  if (!options.isFormData && options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (!options.skipAuth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path, options.params), {
    method,
    headers,
    body:
      options.body === undefined
        ? undefined
        : options.isFormData
          ? (options.body as FormData)
          : JSON.stringify(options.body),
  });

  const json = (await res.json()) as ApiSuccessResponse<T> | ApiErrorResponse;

  if (!json.success) {
    throw new ApiError(json.error, res.status);
  }
  return json;
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, "body">) =>
    request<T>("GET", path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, { ...options, body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "body">) =>
    request<T>("DELETE", path, options),
};

export { ACCESS_TOKEN_COOKIE };
