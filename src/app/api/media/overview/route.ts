import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveMediaReadAccess } from "@/lib/media/api-handler";
import { getMediaDashboard } from "@/lib/media/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = resolveMediaReadAccess(await getCurrentUser());

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  return NextResponse.json({
    ok: true,
    mode: "mock_safe",
    dashboard: await getMediaDashboard(),
  });
}
