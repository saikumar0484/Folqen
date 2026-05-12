import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolvePlatformOpsMutationAccess } from "@/lib/platform-ops/api-handler";
import { runPlatformOperation } from "@/lib/platform-ops/service";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const access = resolvePlatformOpsMutationAccess({
    user,
    safetyError: user ? getMutationSafetyError(request, { key: `platform-ops-analytics:${user.id}`, limit: 8, windowMs: 60_000 }) : null,
  });

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const body = await request.json().catch(() => null);
    const result = await runPlatformOperation({ ...body, workflowKind: "analytics_collection", approvalRequired: true }, access.user.id);
    return NextResponse.json({
      ok: true,
      mode: "dry_run",
      result,
      message: "Analytics ingestion planned in mock-safe mode. No platform analytics API, scraping, or account read occurred.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid analytics collection request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Analytics collection planning failed." }, { status: 500 });
  }
}
