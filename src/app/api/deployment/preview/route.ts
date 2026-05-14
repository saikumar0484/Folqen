import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveGovernanceReadAccess } from "@/lib/governance/api-handler";
import { getPreviewDeploymentDashboard } from "@/lib/preview-deployment/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = resolveGovernanceReadAccess(await getCurrentUser());

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  return NextResponse.json({
    ok: true,
    dashboard: getPreviewDeploymentDashboard(),
  });
}
