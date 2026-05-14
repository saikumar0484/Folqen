import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveMemoryMutationAccess } from "@/lib/memory/api-handler";
import { createExperiment } from "@/lib/memory/service";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const access = resolveMemoryMutationAccess({
    user,
    safetyError: user ? getMutationSafetyError(request, { key: `memory-experiment:${user.id}`, limit: 12, windowMs: 60_000 }) : null,
  });

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const result = await createExperiment(await request.json().catch(() => null), access.user.id);
    return NextResponse.json({
      ok: true,
      mode: "mock_safe",
      result,
      message: "Experiment tracked without automatic rollout.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid experiment request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Experiment tracking failed." }, { status: 500 });
  }
}
