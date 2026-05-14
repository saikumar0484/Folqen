import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { resolveAiGatewayMutationAccess } from "@/lib/ai-gateway/api-handler";
import { runAiGatewayExecution } from "@/lib/ai-gateway/service";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const access = resolveAiGatewayMutationAccess({
    user,
    safetyError: user ? getMutationSafetyError(request, { key: `ai-gateway-execute:${user.id}`, limit: 12, windowMs: 60_000 }) : null,
  });

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const result = await runAiGatewayExecution(
      {
        ...(body ?? {}),
        dryRun: true,
        sandbox: true,
        approvalStatus: body?.approvalStatus ?? "pending",
      },
      access.user.id,
    );
    return NextResponse.json({
      ok: true,
      mode: "dry_run",
      result,
      message: "AI provider execution simulated in mock-safe mode. No live provider, credential, paid API, or model call occurred.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid AI gateway execution request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "AI gateway execution failed." }, { status: 500 });
  }
}
