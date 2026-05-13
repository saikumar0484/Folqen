import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveGovernanceReadAccess } from "@/lib/governance/api-handler";
import { getOperationsTraceDashboard } from "@/lib/operations-trace/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = resolveGovernanceReadAccess(await getCurrentUser());

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const dashboard = await getOperationsTraceDashboard();

  return NextResponse.json({
    ok: true,
    mode: "read_only",
    approvals: dashboard.approvals,
    integrity: {
      status: dashboard.integrity.status,
      approvalIssues: dashboard.integrity.issues.filter((issue) => issue.type === "approval_mismatch" || issue.type === "missing_audit"),
    },
    generatedAt: dashboard.generatedAt,
  });
}
