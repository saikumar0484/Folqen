import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveGovernanceMutationAccess } from "@/lib/governance/api-handler";
import { requestGovernanceApproval } from "@/lib/governance/service";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const access = resolveGovernanceMutationAccess({
    user,
    safetyError: user ? getMutationSafetyError(request, { key: `governance-approval-request:${user.id}`, limit: 20, windowMs: 60_000 }) : null,
  });

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const result = await requestGovernanceApproval(await request.json().catch(() => null), access.user.id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid governance approval request.", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Governance approval request failed." }, { status: 500 });
  }
}
