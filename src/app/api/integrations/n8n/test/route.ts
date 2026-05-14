import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { canManageSystem } from "@/lib/auth/permissions";
import { testN8nWebhook } from "@/lib/integrations/n8n";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  if (!canManageSystem(user)) {
    return NextResponse.json({ error: "Only admins can test n8n connections." }, { status: 403 });
  }

  const safetyError = getMutationSafetyError(request, { key: `n8n-test:${user.id}`, limit: 6, windowMs: 60_000 });

  if (safetyError) {
    return NextResponse.json({ error: safetyError.error }, { status: safetyError.status });
  }

  const result = await testN8nWebhook();

  return NextResponse.json(result, {
    status: result.status === "failed" ? 502 : 200,
  });
}
