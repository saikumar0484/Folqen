import { ApprovalStatus } from "@prisma/client";
import { ApprovalActions } from "@/components/app/approval-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { getCurrentUser } from "@/lib/auth/current-user";
import { canReviewApprovals, describeRoleLimit } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

function approvalTone(status: ApprovalStatus) {
  if (status === "APPROVED") return "safe" as const;
  if (status === "REJECTED" || status === "EXPIRED") return "danger" as const;
  return "warning" as const;
}

export default async function ApprovalsPage() {
  const user = await getCurrentUser();
  const canReview = user ? canReviewApprovals(user) : false;
  const roleMessage = user ? describeRoleLimit(user, "approval") : "Login required.";
  const approvals = await getDb().approval.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      content: { select: { title: true, status: true } },
      decidedBy: { select: { email: true } },
    },
    take: 50,
  });
  const pending = approvals.filter((approval) => approval.status === "PENDING").length;

  return (
    <div className="space-y-5 pb-24">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-neon">Human decision gate</div>
            <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Approval center</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              Approve or reject important decisions. Approval records are real database rows and every decision writes an audit log.
            </p>
          </div>
          <StatusBadge tone={pending ? "warning" : "safe"}>{pending} pending</StatusBadge>
        </div>
      </div>

      <div className="grid gap-4">
        {approvals.map((approval) => (
          <article key={approval.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-neon">{approval.type}</div>
                <h2 className="mt-1 font-display text-xl font-semibold">{approval.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{approval.reason ?? "No reason provided."}</p>
                {approval.content ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Content: <span className="text-foreground">{approval.content.title}</span> ({approval.content.status})
                  </p>
                ) : null}
                {approval.decidedBy ? <p className="mt-2 text-xs text-muted-foreground">Decided by {approval.decidedBy.email}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={approvalTone(approval.status)}>{approval.status}</StatusBadge>
                <StatusBadge tone={approval.riskLevel === "HIGH" || approval.riskLevel === "CRITICAL" ? "danger" : "neutral"}>{approval.riskLevel}</StatusBadge>
              </div>
            </div>
            <ApprovalActions approvalId={approval.id} disabled={approval.status !== "PENDING"} canReview={canReview} roleMessage={roleMessage} />
          </article>
        ))}
      </div>
    </div>
  );
}
