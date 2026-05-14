import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveLiveExecutionAdminAccess } from "@/lib/live-execution/api-handler";
import { actOnProvider, resolveLiveExecutionMutationSafety } from "@/lib/live-execution/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const access = resolveLiveExecutionAdminAccess({
    user,
    safetyError: resolveLiveExecutionMutationSafety(request, user?.id),
  });

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const body = await request.json().catch(() => null);
    const result = await actOnProvider(body, access.user.id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid provider control request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Provider control failed." }, { status: 500 });
  }
}
