import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveMediaMutationAccess } from "@/lib/media/api-handler";
import { runMediaPipeline } from "@/lib/media/service";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const access = resolveMediaMutationAccess({
    user,
    safetyError: user ? getMutationSafetyError(request, { key: `media-render:${user.id}`, limit: 8, windowMs: 60_000 }) : null,
  });

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const body = await request.json().catch(() => null);
    const result = await runMediaPipeline({ ...body, workflowKind: "rendering_workflow", mediaType: "render_output", approvalRequired: true }, access.user.id);
    return NextResponse.json({
      ok: true,
      mode: "dry_run",
      result,
      message: "Rendering workflow queued as a dry-run plan. No FFmpeg process or media worker job was executed.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid render request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Render planning failed." }, { status: 500 });
  }
}
