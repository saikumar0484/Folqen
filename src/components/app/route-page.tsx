import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { RiskBadge } from "@/components/app/risk-badge";
import { StatCard } from "@/components/app/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { routeById, type AppRouteId } from "@/lib/app-routes";
import { defaultProviderRegistry } from "@/lib/providers";

export function RoutePage({ routeId }: { routeId: AppRouteId }) {
  const route = routeById[routeId];

  return (
    <div className="space-y-5 pb-24">
      <PageHeader route={route} />

      <section className="grid gap-3 md:grid-cols-3">
        {route.stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Route modules</div>
              <h2 className="mt-1 font-display text-xl font-semibold">Phase 2 placeholder surface</h2>
            </div>
            <RiskBadge level="low" />
          </div>
          <div className="grid gap-3">
            {route.panels.map((panel) => (
              <article key={panel.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-semibold">{panel.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{panel.description}</p>
                  </div>
                  <StatusBadge tone={panel.status === "Not connected" ? "warning" : panel.status === "Needs approval" ? "safe" : "premium"}>
                    {panel.status}
                  </StatusBadge>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-neon/20 bg-neon/[0.06] p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Quick commands</div>
            <div className="mt-3 grid gap-2">
              {route.actions.map((action) => (
                <button
                  key={action}
                  type="button"
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Provider honesty</div>
            <div className="mt-3 space-y-2">
              {defaultProviderRegistry.map((provider) => (
                <div key={provider.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium">{provider.name}</div>
                    <StatusBadge tone="warning">Not connected</StatusBadge>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{provider.fallback}</p>
                </div>
              ))}
            </div>
          </div>

          <ConfirmDialog label={`${route.label} confirmation gate`} />
        </aside>
      </section>

      <EmptyState
        title="Real data arrives after the database and service phases"
        description="This route is intentionally useful as a shell but honest about mock state. It will connect to Prisma, provider adapters, approvals, and audit logs in later phases."
      />
    </div>
  );
}
