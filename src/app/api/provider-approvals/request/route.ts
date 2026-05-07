import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db";
import { requestProviderApproval } from "@/lib/provider-approval-handler";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (user) {
    const safetyError = getMutationSafetyError(request, { key: `provider-approval:${user.id}`, limit: 10, windowMs: 60_000 });

    if (safetyError) {
      return NextResponse.json({ error: safetyError.error }, { status: safetyError.status });
    }
  }

  const result = await requestProviderApproval({
    user,
    body: await request.json().catch(() => null),
    getDb,
    createAuditLog,
  });

  return NextResponse.json(result.body, { status: result.status });
}
