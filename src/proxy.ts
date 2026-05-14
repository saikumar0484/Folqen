import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

const protectedPrefixes = [
  "/dashboard",
  "/agent",
  "/agents",
  "/departments",
  "/research-intelligence",
  "/content-studio",
  "/organizational-memory",
  "/automations",
  "/browser-operations",
  "/incident-center",
  "/infrastructure",
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
  "/files",
  "/notifications",
  "/upgrades",
];

function flag(key: string) {
  return process.env[key] === "true";
}

function isPreviewPublicModeEnabledForProxy() {
  const previewRuntime = process.env.FOLQEN_RUNTIME_PROFILE === "preview";
  const executionDisabled =
    !flag("ALLOW_PUBLIC_PUBLISH") &&
    !flag("ALLOW_PAID_TOOLS") &&
    !flag("ALLOW_BROWSER_AUTOMATION") &&
    process.env.ORCHESTRATION_EXECUTION_MODE !== "live" &&
    !flag("ORCHESTRATION_WORKER_ENABLED") &&
    !flag("ALLOW_LIVE_AI_EXECUTION") &&
    !flag("ALLOW_CONTROLLED_MEDIA_EXECUTION") &&
    !flag("ALLOW_LIVE_THUMBNAIL_RENDERING");

  return flag("PREVIEW_PUBLIC_MODE") && previewRuntime && flag("PREVIEW_SAFE_MODE") && flag("PREVIEW_FORCE_DRY_RUN") && executionDisabled;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedRoute = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!protectedRoute) {
    return NextResponse.next();
  }

  if (isPreviewPublicModeEnabledForProxy()) {
    const response = NextResponse.next();
    response.headers.set("X-Folqen-Preview-Mode", "public-safe");
    response.headers.set("X-Folqen-Execution-Mode", "dry-run");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
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
    "/agents/:path*",
    "/departments/:path*",
    "/research-intelligence/:path*",
    "/content-studio/:path*",
    "/organizational-memory/:path*",
    "/automations/:path*",
    "/browser-operations/:path*",
    "/incident-center/:path*",
    "/infrastructure/:path*",
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
    "/files/:path*",
    "/notifications/:path*",
    "/upgrades/:path*",
  ],
};
