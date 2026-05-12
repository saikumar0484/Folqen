import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveGovernanceMutationAccess } from "@/lib/governance/api-handler";
import { evaluatePolicy } from "@/lib/governance/service";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const access = resolveGovernanceMutationAccess({
    user,
    safetyError: user ? getMutationSafetyError(request, { key: `governance-policy:${user.id}`, limit: 30, windowMs: 60_000 }) : null,
  });

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const result = await evaluatePolicy(await request.json().catch(() => null), access.user.id);
    return NextResponse.json({
      ok: true,
      mode: "dry_run",
      result,
      message: "Governance policy evaluated. No provider, workflow, rendering, publishing, or account execution occurred.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid governance policy request.", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Governance policy evaluation failed." }, { status: 500 });
  }
}
