import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolvePlatformOpsMutationAccess } from "@/lib/platform-ops/api-handler";
import { retryPublishing } from "@/lib/platform-ops/service";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const access = resolvePlatformOpsMutationAccess({
    user,
    safetyError: user ? getMutationSafetyError(request, { key: `platform-ops-retry:${user.id}`, limit: 8, windowMs: 60_000 }) : null,
  });

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const result = await retryPublishing(await request.json().catch(() => null), access.user.id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid publishing retry request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Publishing retry failed." }, { status: 500 });
  }
}
