import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveIntelligenceMutationAccess } from "@/lib/intelligence/api-handler";
import { createIntelligenceContentPackage } from "@/lib/intelligence/service";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const access = resolveIntelligenceMutationAccess({
    user,
    safetyError: user ? getMutationSafetyError(request, { key: `intelligence-package:${user.id}`, limit: 8, windowMs: 60_000 }) : null,
  });

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const result = await createIntelligenceContentPackage(await request.json().catch(() => null), access.user.id);

    return NextResponse.json({
      ok: true,
      mode: "mock_safe",
      ...result,
      message: "Draft content package prepared. Review is required before any public use.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid content package request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Content package creation failed." }, { status: 500 });
  }
}
