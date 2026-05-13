import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveBrowserOpsReadAccess } from "@/lib/browser-ops/api-handler";
import { getBrowserOpsDashboard } from "@/lib/browser-ops/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = resolveBrowserOpsReadAccess(await getCurrentUser());

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  return NextResponse.json({
    ok: true,
    mode: "dry_run_browser_operations",
    dashboard: await getBrowserOpsDashboard(),
  });
}
