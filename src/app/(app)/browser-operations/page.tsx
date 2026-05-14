import { BrowserOperationsPanel } from "@/components/command-center/browser-operations-panel";
import { SurfaceEmptyState } from "@/components/release/surface-empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { getBrowserOpsDashboard } from "@/lib/browser-ops/service";
import { buildEmptyStateModel, resolveCreatorAccountState } from "@/lib/public-release/account-state";
import { getWorkspaceOverview } from "@/lib/public-release/workspace-service";

export default async function BrowserOperationsPage() {
  const user = await getCurrentUser();
  const [overview, dashboard, browserEventCount] = await Promise.all([
    user ? getWorkspaceOverview(user) : Promise.resolve({ hasWorkspace: false }),
    getBrowserOpsDashboard(),
    hasDatabaseUrl()
      ? getDb().eventLog.count({
          where: {
            type: {
              startsWith: "browser_ops.",
            },
          },
        })
      : Promise.resolve(0),
  ]);
  const hasRecords = browserEventCount > 0;
  const emptyModel = buildEmptyStateModel(
    "browser",
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
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">Browser Operations</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            Browser operations stay sandboxed and dry-run in public beta. Use this space to understand governed web workflows before any live automation is enabled.
          </p>
        </CardContent>
      </Card>
      {!overview.hasWorkspace ? <SurfaceEmptyState model={emptyModel} /> : null}
      {overview.hasWorkspace && !hasRecords ? <SurfaceEmptyState model={emptyModel} /> : null}
      {overview.hasWorkspace && hasRecords ? <BrowserOperationsPanel dashboard={dashboard} /> : null}
    </div>
  );
}
