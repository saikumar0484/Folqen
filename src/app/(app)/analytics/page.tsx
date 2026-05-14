import { Card, CardContent } from "@/components/ui/card";
import { SurfaceEmptyState } from "@/components/release/surface-empty-state";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { buildEmptyStateModel, resolveCreatorAccountState } from "@/lib/public-release/account-state";
import { getWorkspaceOverview } from "@/lib/public-release/workspace-service";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  const [overview, records] = await Promise.all([
    user ? getWorkspaceOverview(user) : Promise.resolve({ hasWorkspace: false }),
    hasDatabaseUrl()
      ? getDb().analyticsRecord.findMany({
          orderBy: { createdAt: "desc" },
          take: 12,
        })
      : Promise.resolve([]),
  ]);

  const hasRecords = records.length > 0;
  const emptyModel = buildEmptyStateModel(
    "analytics",
    resolveCreatorAccountState({
      hasWorkspace: overview.hasWorkspace,
      hasRecords,
      integrationConnected: hasRecords,
    }),
  );

  return (
    <div className="section-space pb-8">
      <Card className="panel-soft">
        <CardContent className="py-5">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">Analytics</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            Understand what is working, what to improve, and where your next creator iteration should focus.
          </p>
        </CardContent>
      </Card>

      {!overview.hasWorkspace ? <SurfaceEmptyState model={emptyModel} /> : null}
      {overview.hasWorkspace && !hasRecords ? <SurfaceEmptyState model={emptyModel} /> : null}

      {overview.hasWorkspace && hasRecords ? (
        <Card className="panel">
          <CardContent className="py-5">
            <h2 className="mb-3 text-lg font-semibold">Recent performance records</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {records.map((record) => (
                <article key={record.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{record.metric}</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">{record.value.toFixed(2)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{record.platform ?? "Creator workspace"} · {record.period}</div>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
