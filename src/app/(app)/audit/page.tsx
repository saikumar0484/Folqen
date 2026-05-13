import { OperationsTracePanel } from "@/components/command-center/operations-trace-panel";
import { getOperationsTraceDashboard } from "@/lib/operations-trace/service";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const dashboard = await getOperationsTraceDashboard();

  return (
    <div className="space-y-5 pb-24">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-neon">Accountability</div>
            <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Audit trail</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              Governed read-only operations trace across audit logs, events, workflows, approvals, incidents, queues, assets, renders, and safety controls.
            </p>
          </div>
        </div>
      </div>

      <OperationsTracePanel dashboard={dashboard} />
    </div>
  );
}
