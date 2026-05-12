import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { canCreateDraftContent } from "@/lib/auth/permissions";
import { runWorkflow } from "@/lib/orchestration/service";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  if (!canCreateDraftContent(user)) {
    return NextResponse.json({ error: "Only admins and operators can run orchestration workflows." }, { status: 403 });
  }

  const safetyError = getMutationSafetyError(request, { key: `orchestration-workflow:${user.id}`, limit: 12, windowMs: 60_000 });

  if (safetyError) {
    return NextResponse.json({ error: safetyError.error }, { status: safetyError.status });
  }

  try {
    const workflow = await runWorkflow(await request.json());
    return NextResponse.json({
      ok: true,
      mode: "mock_safe",
      workflow,
      message: "Workflow planned through LangGraph and CrewAI-compatible coordination. Approval gates remain active.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid orchestration workflow request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Workflow run failed." }, { status: 500 });
  }
}
