import { StatusBadge } from "@/components/ui/status-badge";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const events = await getDb().auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { actor: { select: { email: true, role: true } } },
    take: 80,
  });

  return (
    <div className="space-y-5 pb-24">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-neon">Accountability</div>
            <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Audit trail</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              Real Supabase audit logs for seed data, settings changes, password changes, approvals, and saved agent messages.
            </p>
          </div>
          <StatusBadge tone="premium">{events.length} events</StatusBadge>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        {events.map((event) => (
          <article key={event.id} className="border-b border-white/10 p-4 last:border-b-0">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-neon">{event.action}</div>
                <h2 className="mt-1 text-sm font-medium">{event.target ?? "system"}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {event.actor?.email ?? "system"} {event.actor ? `(${event.actor.role})` : ""} - {event.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                </p>
              </div>
              <StatusBadge tone={event.riskLevel === "HIGH" || event.riskLevel === "CRITICAL" ? "danger" : event.riskLevel === "MEDIUM" ? "warning" : "safe"}>
                {event.riskLevel}
              </StatusBadge>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
