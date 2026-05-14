import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveMediaMutationAccess } from "@/lib/media/api-handler";
import { engageMediaRenderShutdown } from "@/lib/media/controlled-rendering";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

const shutdownSchema = z.object({
  reason: z.string().min(6).max(1000).default("Emergency controlled media render shutdown requested."),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const access = resolveMediaMutationAccess({
    user,
    safetyError: user ? getMutationSafetyError(request, { key: `media-render-shutdown:${user.id}`, limit: 4, windowMs: 60_000 }) : null,
  });

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const body = shutdownSchema.parse(await request.json().catch(() => ({})));
    return NextResponse.json(await engageMediaRenderShutdown(body.reason, access.user.id));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid shutdown request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Controlled media shutdown failed." }, { status: 500 });
  }
}
