import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolvePlatformOpsReadAccess } from "@/lib/platform-ops/api-handler";
import { getPlatformOpsDashboard } from "@/lib/platform-ops/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = resolvePlatformOpsReadAccess(await getCurrentUser());
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  return NextResponse.json({
    ok: true,
    mode: "mock_safe",
    dashboard: await getPlatformOpsDashboard(),
  });
}
