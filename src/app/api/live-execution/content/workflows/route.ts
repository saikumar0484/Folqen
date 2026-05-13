import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { liveContentWorkflowKinds, liveContentWorkflowLabels } from "@/lib/live-execution/content-operations";
import { resolveLiveExecutionOperatorAccess, resolveLiveExecutionReadAccess } from "@/lib/live-execution/api-handler";
import { getLiveExecutionDashboard, resolveLiveExecutionMutationSafety, runControlledLiveExecution } from "@/lib/live-execution/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const access = resolveLiveExecutionReadAccess(user);

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const dashboard = await getLiveExecutionDashboard();
  return NextResponse.json({
    ok: true,
    workflows: liveContentWorkflowKinds.map((kind) => ({
      kind,
      label: liveContentWorkflowLabels[kind],
      status: "Governed live-capable when approved",
      constraints: ["Gemini only", "Content Department only", "Approval required", "No publishing", "No rendering", "No platform APIs", "No autonomous retries"],
    })),
    recentRuns: dashboard.recentRuns.filter((run) => run.departmentId === "content"),
    readiness: dashboard.readiness,
    budget: dashboard.budget,
  });
}

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
        departmentId: "content",
        workflowKind: "structured_generation",
        taskType: "structured_output",
        maxOutputTokens: typeof body.maxOutputTokens === "number" ? body.maxOutputTokens : 700,
      },
      access.user.id,
    );

    return NextResponse.json({
      ok: result.status === "completed_live",
      result,
      message:
        result.status === "completed_live"
          ? "Governed Content intelligence completed under live Gemini controls. No publishing, rendering, media generation, platform execution, autonomous retry, or workflow mutation occurred."
          : "Governed Content intelligence did not run live. Readiness, validation, or governance gates blocked the request and rollback remains available.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid governed Content workflow request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Governed Content workflow failed." }, { status: 500 });
  }
}
