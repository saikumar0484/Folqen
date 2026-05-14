import { LiveAnalyticsOperationsPanel } from "@/components/command-center/live-analytics-operations-panel";
import { SurfaceEmptyState } from "@/components/release/surface-empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { getLiveExecutionDashboard } from "@/lib/live-execution/service";
import { buildEmptyStateModel, resolveCreatorAccountState } from "@/lib/public-release/account-state";
import { getWorkspaceOverview } from "@/lib/public-release/workspace-service";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  const [overview, liveExecution, analyticsCount] = await Promise.all([
    user ? getWorkspaceOverview(user) : Promise.resolve({ hasWorkspace: false }),
    getLiveExecutionDashboard(),
    hasDatabaseUrl() ? getDb().analyticsRecord.count() : Promise.resolve(0),
  ]);
  const hasRecords = analyticsCount > 0;
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
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">Analytics Intelligence</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            Understand what worked, what did not, and what to improve next through governed, draft-safe analytics reasoning.
          </p>
        </CardContent>
      </Card>
      {!overview.hasWorkspace ? <SurfaceEmptyState model={emptyModel} /> : null}
      {overview.hasWorkspace && !hasRecords ? <SurfaceEmptyState model={emptyModel} /> : null}
      {overview.hasWorkspace && hasRecords ? <LiveAnalyticsOperationsPanel liveExecution={liveExecution} /> : null}
    </div>
  );
}
