import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveIntelligenceMutationAccess } from "@/lib/intelligence/api-handler";
import { runIntelligenceWorkflow } from "@/lib/intelligence/service";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const access = resolveIntelligenceMutationAccess({
    user,
    safetyError: user ? getMutationSafetyError(request, { key: `intelligence-content:${user.id}`, limit: 12, windowMs: 60_000 }) : null,
  });

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const result = await runIntelligenceWorkflow(await request.json().catch(() => null), {
      actorId: access.user.id,
      requiredDepartment: "content",
    });

    return NextResponse.json({
      ok: true,
      mode: "mock_safe",
      result,
      message: "Content intelligence workflow completed in mock-safe mode. No paid AI, rendering, or publishing was used.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid content intelligence request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Content intelligence workflow failed." }, { status: 500 });
  }
}
