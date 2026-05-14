import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveLiveExecutionOperatorAccess } from "@/lib/live-execution/api-handler";
import { resolveLiveExecutionMutationSafety, runControlledLiveExecution } from "@/lib/live-execution/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const access = resolveLiveExecutionOperatorAccess({
    user,
    safetyError: resolveLiveExecutionMutationSafety(request, user?.id),
  });

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const body = await request.json().catch(() => null);
    const result = await runControlledLiveExecution(body, access.user.id);
    return NextResponse.json({
      ok: result.status === "completed_live",
      result,
      message: result.status === "completed_live" ? "Controlled live execution completed under activation gates." : "Controlled live execution did not run. Readiness gates blocked the request.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid controlled live execution request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Controlled live execution failed." }, { status: 500 });
  }
}
