import { Card, CardContent } from "@/components/ui/card";
import { SurfaceEmptyState } from "@/components/release/surface-empty-state";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { buildEmptyStateModel, resolveCreatorAccountState } from "@/lib/public-release/account-state";
import { getWorkspaceOverview } from "@/lib/public-release/workspace-service";

export default async function BrowserOperationsPage() {
  const user = await getCurrentUser();
  const [overview, browserEventCount] = await Promise.all([
    user ? getWorkspaceOverview(user) : Promise.resolve({ hasWorkspace: false }),
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
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">Web Assistant</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            Use this space to preview guided web actions for research and creator setup. Full capabilities are expanding in early beta.
          </p>
        </CardContent>
      </Card>

      {!overview.hasWorkspace ? <SurfaceEmptyState model={emptyModel} /> : null}
      {overview.hasWorkspace && !hasRecords ? <SurfaceEmptyState model={emptyModel} /> : null}

      {overview.hasWorkspace && hasRecords ? (
        <Card className="panel">
          <CardContent className="py-5">
            <h2 className="mb-2 text-lg font-semibold">Recent web assistant activity</h2>
            <p className="text-sm text-muted-foreground">{browserEventCount} activity records found for this workspace.</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
