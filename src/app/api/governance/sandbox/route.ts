import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveGovernanceMutationAccess } from "@/lib/governance/api-handler";
import { runSandboxExecution } from "@/lib/governance/service";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const access = resolveGovernanceMutationAccess({
    user,
    safetyError: user ? getMutationSafetyError(request, { key: `governance-sandbox:${user.id}`, limit: 20, windowMs: 60_000 }) : null,
  });

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const result = await runSandboxExecution(await request.json().catch(() => null), access.user.id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid sandbox execution request.", details: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Sandbox execution failed." }, { status: 500 });
  }
}
