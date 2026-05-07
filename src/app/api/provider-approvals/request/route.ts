import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db";
import { requestProviderApproval } from "@/lib/provider-approval-handler";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const result = await requestProviderApproval({
    user,
    body: await request.json().catch(() => null),
    getDb,
    createAuditLog,
  });

  return NextResponse.json(result.body, { status: result.status });
}
