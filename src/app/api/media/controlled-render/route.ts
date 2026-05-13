import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getControlledMediaRuns, getRenderGovernanceSnapshot, runControlledMediaRender } from "@/lib/media/controlled-rendering";
import { resolveMediaMutationAccess, resolveMediaReadAccess } from "@/lib/media/api-handler";
import { controlledMediaWorkflowKinds, controlledMediaWorkflowLabels } from "@/lib/media/types";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = resolveMediaReadAccess(await getCurrentUser());

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  return NextResponse.json({
    ok: true,
    mode: "governed_sandbox",
    workflows: controlledMediaWorkflowKinds.map((kind) => ({
      kind,
      label: controlledMediaWorkflowLabels[kind],
      status: "Needs approval",
      constraints: ["Approval required", "Sandbox fallback", "No unrestricted GPU", "No autonomous retries", "No publishing", "No workflow mutation"],
    })),
    governance: await getRenderGovernanceSnapshot(),
    recentRuns: getControlledMediaRuns(),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const access = resolveMediaMutationAccess({
    user,
    safetyError: user ? getMutationSafetyError(request, { key: `media-controlled-render:${user.id}`, limit: 6, windowMs: 60_000 }) : null,
  });

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const result = await runControlledMediaRender(await request.json().catch(() => null), access.user.id);
    return NextResponse.json({
      ok: result.status === "completed_sandbox",
      mode: result.mode,
      result,
      message:
        result.status === "completed_sandbox"
          ? "Controlled media execution packet completed in sandbox mode. No GPU job, ComfyUI request, FFmpeg command, binary write, publishing, autonomous retry, or workflow mutation occurred."
          : "Controlled media execution did not run. Approval, governance, quota, provider health, or emergency controls blocked the request.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid controlled media render request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Controlled media render failed." }, { status: 500 });
  }
}
