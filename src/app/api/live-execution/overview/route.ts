import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveLiveExecutionReadAccess } from "@/lib/live-execution/api-handler";
import { getLiveExecutionDashboard } from "@/lib/live-execution/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = resolveLiveExecutionReadAccess(await getCurrentUser());
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  return NextResponse.json({ ok: true, dashboard: await getLiveExecutionDashboard() });
}
