import { Card, CardContent } from "@/components/ui/card";
import { SurfaceEmptyState } from "@/components/release/surface-empty-state";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { buildEmptyStateModel, resolveCreatorAccountState } from "@/lib/public-release/account-state";
import { getWorkspaceOverview } from "@/lib/public-release/workspace-service";

export const dynamic = "force-dynamic";

export default async function PlatformsPage() {
  const user = await getCurrentUser();
  const [overview, connectedCount] = await Promise.all([
    user ? getWorkspaceOverview(user) : Promise.resolve({ hasWorkspace: false }),
    hasDatabaseUrl()
      ? getDb().platformConnection.count({
          where: {
            status: {
              in: ["CONFIGURED", "LIVE", "TESTING"],
            },
          },
        })
      : Promise.resolve(0),
  ]);
  const model = buildEmptyStateModel(
    "platforms",
    resolveCreatorAccountState({
      hasWorkspace: overview.hasWorkspace,
      hasRecords: connectedCount > 0,
      integrationConnected: connectedCount > 0,
    }),
  );

  return (
    <div className="section-space pb-8">
      <Card className="panel-soft">
        <CardContent className="py-5">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">Platforms</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            Platform connections remain explicit and governed. Folqen never claims publishing unless accounts are verified.
          </p>
        </CardContent>
      </Card>
      <SurfaceEmptyState model={model} />
    </div>
  );
}
