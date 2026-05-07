import { ApprovalStatus, type Prisma, type RiskLevel } from "@prisma/client";
import type { CurrentUser } from "@/lib/auth/current-user";
import { canManageSystem } from "@/lib/auth/permissions";
import { buildProviderApprovalRequest, providerApprovalRequestTypes } from "@/lib/provider-approval-requests";
import { z } from "zod";

const requestSchema = z.object({
  requestType: z.enum(providerApprovalRequestTypes),
});

export type ApprovalRecord = {
  id: string;
  type: string;
  title: string;
  status: ApprovalStatus;
  riskLevel: RiskLevel;
  reason?: string | null;
  payload?: unknown;
  requestedBy?: string | null;
};

type ProviderApprovalDb = {
  approval: {
    findFirst(input: unknown): Promise<ApprovalRecord | null>;
    create(input: { data: unknown }): Promise<ApprovalRecord>;
  };
};

type AuditInput = {
  actorId?: string | null;
  action: string;
  target?: string | null;
  riskLevel?: RiskLevel;
  metadata?: Prisma.InputJsonValue;
};

type ProviderApprovalHandlerInput = {
  user: CurrentUser | null;
  body: unknown;
  getDb: () => ProviderApprovalDb;
  createAuditLog: (input: AuditInput) => Promise<unknown>;
};

export async function requestProviderApproval({ user, body, getDb, createAuditLog }: ProviderApprovalHandlerInput) {
  if (!user) {
    return { status: 401, body: { error: "Login required." } };
  }

  if (!canManageSystem(user)) {
    return { status: 403, body: { error: "Only admins can request provider setup approvals." } };
  }

  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return { status: 400, body: { error: "Choose a valid provider setup request." } };
  }

  const approvalRequest = buildProviderApprovalRequest(parsed.data.requestType);
  const db = getDb();
  const existing = await db.approval.findFirst({
    where: {
      type: approvalRequest.type,
      title: approvalRequest.title,
      status: ApprovalStatus.PENDING,
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    return { status: 200, body: { ok: true, duplicate: true, approval: existing } };
  }

  const approval = await db.approval.create({
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

  return { status: 200, body: { ok: true, duplicate: false, approval } };
}
