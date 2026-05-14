import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { analyticsDataSourceKinds, liveAnalyticsWorkflowKinds, liveAnalyticsWorkflowLabels } from "@/lib/live-execution/analytics-operations";
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
    workflows: liveAnalyticsWorkflowKinds.map((kind) => ({
      kind,
      label: liveAnalyticsWorkflowLabels[kind],
      status: "Governed live-capable when approved",
      constraints: ["Gemini only", "Analytics Department only", "Approval required", "Mock/internal analytics only", "No platform APIs", "No autonomous optimization", "No workflow mutation"],
    })),
    dataSources: analyticsDataSourceKinds.map((kind) => ({
      kind,
      status: kind.startsWith("future_") ? "Not connected" : "Mock",
    })),
    recentRuns: dashboard.recentRuns.filter((run) => run.departmentId === "analytics"),
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
        departmentId: "analytics",
        workflowKind: "structured_generation",
        taskType: "structured_output",
        maxOutputTokens: typeof body.maxOutputTokens === "number" ? body.maxOutputTokens : 720,
      },
      access.user.id,
    );

    return NextResponse.json({
      ok: result.status === "completed_live",
      result,
      message:
        result.status === "completed_live"
          ? "Governed Analytics intelligence completed under live Gemini controls. No publishing, rendering, platform account execution, autonomous optimization, prompt mutation, or workflow mutation occurred."
          : "Governed Analytics intelligence did not run live. Readiness, validation, or governance gates blocked the request and rollback remains available.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid governed Analytics workflow request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Governed Analytics workflow failed." }, { status: 500 });
  }
}
