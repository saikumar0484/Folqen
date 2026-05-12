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
    safetyError: user ? getMutationSafetyError(request, { key: `media-generate:${user.id}`, limit: 12, windowMs: 60_000 }) : null,
  });

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const result = await runMediaPipeline(await request.json().catch(() => null), access.user.id);
    return NextResponse.json({
      ok: true,
      mode: "dry_run",
      result,
      message: "Media generation pipeline planned in mock-safe mode. No ComfyUI, GPU, FFmpeg, or storage execution occurred.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid media generation request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Media generation pipeline failed." }, { status: 500 });
  }
}
