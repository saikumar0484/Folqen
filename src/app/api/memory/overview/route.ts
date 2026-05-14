import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveMemoryReadAccess } from "@/lib/memory/api-handler";
import { getMemoryDashboard } from "@/lib/memory/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = resolveMemoryReadAccess(await getCurrentUser());

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  return NextResponse.json({
    ok: true,
    mode: "mock_safe",
    dashboard: await getMemoryDashboard(),
  });
}
