import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { canCreateDraftContent } from "@/lib/auth/permissions";
import { delegateTask } from "@/lib/orchestration/service";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  if (!canCreateDraftContent(user)) {
    return NextResponse.json({ error: "Only admins and operators can delegate orchestration tasks." }, { status: 403 });
  }

  const safetyError = getMutationSafetyError(request, { key: `orchestration-task:${user.id}`, limit: 20, windowMs: 60_000 });

  if (safetyError) {
    return NextResponse.json({ error: safetyError.error }, { status: safetyError.status });
  }

  try {
    const task = await delegateTask(await request.json());
    return NextResponse.json({
      ok: true,
      mode: "mock_safe",
      task,
      message: "Task delegated through the Folqen orchestration layer. Real external execution remains disabled.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid orchestration task request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Task delegation failed." }, { status: 500 });
  }
}
