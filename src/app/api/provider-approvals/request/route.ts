import { ApprovalStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth/current-user";
import { canManageSystem } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { buildProviderApprovalRequest, providerApprovalRequestTypes } from "@/lib/provider-approval-requests";

const requestSchema = z.object({
  requestType: z.enum(providerApprovalRequestTypes),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  if (!canManageSystem(user)) {
    return NextResponse.json({ error: "Only admins can request provider setup approvals." }, { status: 403 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a valid provider setup request." }, { status: 400 });
  }

  const approvalRequest = buildProviderApprovalRequest(parsed.data.requestType);
  const existing = await getDb().approval.findFirst({
    where: {
      type: approvalRequest.type,
      title: approvalRequest.title,
      status: ApprovalStatus.PENDING,
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true, approval: existing });
  }

  const approval = await getDb().approval.create({
    data: {
      ...approvalRequest,
      requestedBy: user.id,
    },
  });

  await createAuditLog({
    actorId: user.id,
    action: "provider_setup.approval_requested",
    target: approval.id,
    riskLevel: approval.riskLevel,
    metadata: {
      requestType: parsed.data.requestType,
      title: approval.title,
      note: "This only creates an approval record. It does not store credentials, call paid APIs, execute n8n workflows, render media, or publish content.",
    },
  });

  return NextResponse.json({ ok: true, duplicate: false, approval });
}
