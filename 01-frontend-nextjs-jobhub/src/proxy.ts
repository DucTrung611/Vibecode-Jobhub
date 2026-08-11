import { NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN_COOKIE = "jobhub_access_token";
const USER_COOKIE = "jobhub_user";

/**
 * Coarse-grained only: checks the access-token cookie exists and (best
 * effort, unverified) that the cached user snapshot says `type: 'admin'`.
 * Real enforcement is server-side (`RolesGuard` + `@RequirePermission()`,
 * see 02-backend .../shared/guards/roles.guard.ts) — this only avoids
 * flashing admin UI at a logged-in non-admin before the API 403s.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRaw = request.cookies.get(USER_COOKIE)?.value;
  const type = userRaw ? (safeParseUserType(userRaw) ?? undefined) : undefined;
  if (type !== "admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

function safeParseUserType(raw: string): string | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "type" in parsed &&
      typeof (parsed as { type: unknown }).type === "string"
    ) {
      return (parsed as { type: string }).type;
    }
    return null;
  } catch {
    return null;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
