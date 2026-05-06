import { NextResponse } from "next/server";
import { ApprovalStatus } from "@prisma/client";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth/current-user";
import { canReviewApprovals } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";

const decisionSchema = z.object({
  decision: z.enum(["approve", "reject"]),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  if (!canReviewApprovals(user)) {
    return NextResponse.json({ error: "Only admins and operators can review approvals." }, { status: 403 });
  }

  const { id } = await params;
  const parsed = decisionSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Choose approve or reject." }, { status: 400 });
  }

  const status = parsed.data.decision === "approve" ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;

  const approval = await getDb().approval.update({
    where: { id },
    data: {
      status,
      decidedById: user.id,
      decidedAt: new Date(),
    },
  });

  await createAuditLog({
    actorId: user.id,
    action: parsed.data.decision === "approve" ? "approval.approved" : "approval.rejected",
    target: approval.id,
    riskLevel: approval.riskLevel,
    metadata: {
      title: approval.title,
      type: approval.type,
      status,
      note: "Approval updates do not publish content or execute paid tools.",
    },
  });

  return NextResponse.json({ ok: true, approval });
}
