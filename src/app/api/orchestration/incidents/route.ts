import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { canCreateDraftContent } from "@/lib/auth/permissions";
import { reportIncident } from "@/lib/orchestration/incidents";
import { getRecentEvents } from "@/lib/orchestration/service";
import { getMutationSafetyError } from "@/lib/security/request-guards";

const incidentSchema = z.object({
  title: z.string().min(3).max(140),
  summary: z.string().min(10).max(2000),
  severity: z.enum(["info", "warning", "error", "critical"]).default("warning"),
  departmentId: z
    .enum([
      "research",
      "content",
      "platform_operations",
      "analytics",
      "optimization",
      "infrastructure",
      "error_recovery",
      "organizational_memory",
    ])
    .optional(),
  agentId: z.string().optional(),
  workflowRunId: z.string().optional(),
  taskId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    incidents: getRecentEvents(100).filter((event) => event.type.startsWith("incident.")),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  if (!canCreateDraftContent(user)) {
    return NextResponse.json({ error: "Only admins and operators can report orchestration incidents." }, { status: 403 });
  }

  const safetyError = getMutationSafetyError(request, { key: `orchestration-incident:${user.id}`, limit: 20, windowMs: 60_000 });

  if (safetyError) {
    return NextResponse.json({ error: safetyError.error }, { status: safetyError.status });
  }

  try {
    const incident = await reportIncident(incidentSchema.parse(await request.json()));
    return NextResponse.json({
      ok: true,
      mode: "mock_safe",
      incident,
      message: "Incident captured and recovery plan queued. Risky remediation still requires human approval.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid incident report.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Incident reporting failed." }, { status: 500 });
  }
}
