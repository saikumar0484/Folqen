import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { resolveAiGatewayMutationAccess } from "@/lib/ai-gateway/api-handler";
import { retryAiGatewayExecution } from "@/lib/ai-gateway/service";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const access = resolveAiGatewayMutationAccess({
    user,
    safetyError: user ? getMutationSafetyError(request, { key: `ai-gateway-retry:${user.id}`, limit: 10, windowMs: 60_000 }) : null,
  });

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const body = await request.json().catch(() => null);
    const result = await retryAiGatewayExecution(body, access.user.id);
    return NextResponse.json({
      ...result,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid AI gateway retry request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "AI gateway retry failed." }, { status: 500 });
  }
}
