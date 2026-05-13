import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveMediaMutationAccess } from "@/lib/media/api-handler";
import { controlLiveThumbnailRendering } from "@/lib/media/live-thumbnail-rendering";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

const controlSchema = z.object({
  action: z.enum(["disable", "rollback_to_dry_run", "quarantine", "drain_queue", "recover_failed_render"]),
  reason: z.string().min(6).max(1000),
  renderId: z.string().max(180).optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const access = resolveMediaMutationAccess({
    user,
    safetyError: user ? getMutationSafetyError(request, { key: `media-live-thumbnail-control:${user.id}`, limit: 4, windowMs: 60_000 }) : null,
  });

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const body = controlSchema.parse(await request.json().catch(() => null));
    return NextResponse.json(await controlLiveThumbnailRendering(body, access.user.id));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid live thumbnail control request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Live thumbnail control action failed." }, { status: 500 });
  }
}
