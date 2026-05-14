import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveGovernanceMutationAccess } from "@/lib/governance/api-handler";
import { actOnGovernanceApproval } from "@/lib/governance/service";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const access = resolveGovernanceMutationAccess({
    user,
    safetyError: user ? getMutationSafetyError(request, { key: `governance-approval-action:${user.id}`, limit: 30, windowMs: 60_000 }) : null,
  });

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const result = await actOnGovernanceApproval(await request.json().catch(() => null), access.user.id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid governance approval action.", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Governance approval action failed." }, { status: 500 });
  }
}
