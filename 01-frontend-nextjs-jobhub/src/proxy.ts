import { NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN_COOKIE = "jobhub_access_token";

/**
 * Coarse-grained only: checks the access-token cookie exists, redirects to
 * /login otherwise. Fine-grained RBAC (does this admin actually have the
 * permission for this page) happens server-side once Phase 2 ships
 * roles-permissions — this cannot verify the token, only its presence.
 */
export function proxy(request: NextRequest) {
  const hasToken = request.cookies.has(ACCESS_TOKEN_COOKIE);
  if (!hasToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
