import { NextResponse } from "next/server";

import { resolveAiGatewayReadAccess } from "@/lib/ai-gateway/api-handler";
import { getAiGatewayDashboard } from "@/lib/ai-gateway/service";
import { getCurrentUser } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = resolveAiGatewayReadAccess(await getCurrentUser());
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  return NextResponse.json({ ok: true, dashboard: await getAiGatewayDashboard() });
}
