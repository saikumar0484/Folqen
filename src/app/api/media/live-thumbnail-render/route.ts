import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveMediaMutationAccess, resolveMediaReadAccess } from "@/lib/media/api-handler";
import { getLiveThumbnailDashboard, runLiveThumbnailRender } from "@/lib/media/live-thumbnail-rendering";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = resolveMediaReadAccess(await getCurrentUser());

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  return NextResponse.json({
    ok: true,
    mode: "governed_live_thumbnail_readiness",
    dashboard: await getLiveThumbnailDashboard(),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const access = resolveMediaMutationAccess({
    user,
    safetyError: user ? getMutationSafetyError(request, { key: `media-live-thumbnail:${user.id}`, limit: 3, windowMs: 60_000 }) : null,
  });

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const result = await runLiveThumbnailRender(await request.json().catch(() => null), access.user.id);
    return NextResponse.json({
      ok: result.status === "completed_live",
      mode: result.mode,
      result,
      message:
        result.status === "completed_live"
          ? "Governed live thumbnail render completed through the controlled worker. Publishing, video generation, autonomous retries, and workflow mutation remained blocked."
          : "Live thumbnail rendering did not complete. Approval, activation, provider, quota, validation, kill-switch, or quarantine controls blocked the request.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid live thumbnail render request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Live thumbnail render failed." }, { status: 500 });
  }
}
