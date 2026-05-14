import { Card, CardContent } from "@/components/ui/card";
import { SurfaceEmptyState } from "@/components/release/surface-empty-state";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMemoryDashboard } from "@/lib/memory/service";
import { buildEmptyStateModel, resolveCreatorAccountState } from "@/lib/public-release/account-state";
import { getWorkspaceOverview } from "@/lib/public-release/workspace-service";

export default async function HistoryPage() {
  const [user, dashboard] = await Promise.all([getCurrentUser(), getMemoryDashboard()]);
  const overview = user ? await getWorkspaceOverview(user) : { hasWorkspace: false };
  const hasRecords = dashboard.recentMemories.length > 0 || dashboard.recentReflections.length > 0 || dashboard.experiments.length > 0;
  const model = buildEmptyStateModel(
    "memory",
    resolveCreatorAccountState({
      hasWorkspace: overview.hasWorkspace,
      hasRecords,
      integrationConnected: false,
    }),
  );

  return (
    <div className="section-space pb-8">
      <Card className="panel-soft">
        <CardContent className="py-5">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">History</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">Review past learnings, reflections, and experiments captured from real creator activity.</p>
        </CardContent>
      </Card>

      {!hasRecords ? <SurfaceEmptyState model={model} /> : null}

      {hasRecords ? (
        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="panel">
            <CardContent className="py-5">
              <h2 className="text-sm font-semibold">Saved memories</h2>
              <div className="mt-2 text-3xl font-semibold text-foreground">{dashboard.recentMemories.length}</div>
            </CardContent>
          </Card>
          <Card className="panel-soft">
            <CardContent className="py-5">
              <h2 className="text-sm font-semibold">Reflections</h2>
              <div className="mt-2 text-3xl font-semibold text-foreground">{dashboard.recentReflections.length}</div>
            </CardContent>
          </Card>
          <Card className="panel-soft">
            <CardContent className="py-5">
              <h2 className="text-sm font-semibold">Experiments</h2>
              <div className="mt-2 text-3xl font-semibold text-foreground">{dashboard.experiments.length}</div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
