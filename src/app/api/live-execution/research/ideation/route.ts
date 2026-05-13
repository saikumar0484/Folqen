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
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const result = await runControlledLiveExecution(
      {
        ...body,
        providerId: "gemini",
        departmentId: "research",
        workflowKind: "structured_generation",
        taskType: "planning",
        maxOutputTokens: typeof body.maxOutputTokens === "number" ? body.maxOutputTokens : 500,
      },
      access.user.id,
    );

    return NextResponse.json({
      ok: result.status === "completed_live",
      result,
      message:
        result.status === "completed_live"
          ? "Gemini Research ideation completed under controlled live gates. No publishing, rendering, platform execution, autonomous retry, or workflow mutation occurred."
          : "Gemini Research ideation did not run live. Readiness gates blocked or failed the request and rollback remains available.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid Gemini Research ideation request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Gemini Research ideation failed." }, { status: 500 });
  }
}
