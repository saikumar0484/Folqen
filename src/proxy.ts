import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

const protectedPrefixes = [
  "/dashboard",
  "/agent",
  "/calendar",
  "/pipeline",
  "/library",
  "/approvals",
  "/platforms",
  "/tools",
  "/settings",
  "/analytics",
  "/monetization",
  "/brand",
  "/errors",
  "/audit",
  "/workflows",
  "/browser-operations",
  "/files",
  "/notifications",
  "/upgrades",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedRoute = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!protectedRoute) {
    return NextResponse.next();
  }

  const session = verifySessionToken(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (session) {
    const response = NextResponse.next();
    if (process.env.PREVIEW_SAFE_MODE === "true" || process.env.VERCEL_ENV === "preview") {
      response.headers.set("X-Folqen-Preview-Mode", "safe");
      response.headers.set("X-Folqen-Execution-Mode", "dry-run");
      response.headers.set("X-Robots-Tag", "noindex, nofollow");
    }
    return response;
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/agent/:path*",
    "/calendar/:path*",
    "/pipeline/:path*",
    "/library/:path*",
    "/approvals/:path*",
    "/platforms/:path*",
    "/tools/:path*",
    "/settings/:path*",
    "/analytics/:path*",
    "/monetization/:path*",
    "/brand/:path*",
    "/errors/:path*",
    "/audit/:path*",
    "/workflows/:path*",
    "/browser-operations/:path*",
    "/files/:path*",
    "/notifications/:path*",
    "/upgrades/:path*",
  ],
};
