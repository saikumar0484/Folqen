import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveBrowserOpsMutationAccess } from "@/lib/browser-ops/api-handler";
import { controlBrowserOperations } from "@/lib/browser-ops/service";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const access = resolveBrowserOpsMutationAccess({
    user,
    safetyError: user ? getMutationSafetyError(request, { key: `browser-control:${user.id}`, limit: 6, windowMs: 60_000 }) : null,
  });

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    return NextResponse.json(await controlBrowserOperations(await request.json().catch(() => null), access.user.id));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid browser control request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Browser control action failed." }, { status: 500 });
  }
}
