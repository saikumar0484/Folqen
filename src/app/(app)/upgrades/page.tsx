import { Card, CardContent } from "@/components/ui/card";
import { SurfaceEmptyState } from "@/components/release/surface-empty-state";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { buildEmptyStateModel, resolveCreatorAccountState } from "@/lib/public-release/account-state";
import { getWorkspaceOverview } from "@/lib/public-release/workspace-service";

export const dynamic = "force-dynamic";

export default async function UpgradesPage() {
  const user = await getCurrentUser();
  const [overview, proposalCount] = await Promise.all([
    user ? getWorkspaceOverview(user) : Promise.resolve({ hasWorkspace: false }),
    hasDatabaseUrl() ? getDb().upgradeProposal.count() : Promise.resolve(0),
  ]);
  const model = buildEmptyStateModel(
    "upgrades",
    resolveCreatorAccountState({
      hasWorkspace: overview.hasWorkspace,
      hasRecords: proposalCount > 0,
    }),
  );

  return (
    <div className="section-space pb-8">
      <Card className="panel-soft">
        <CardContent className="py-5">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">Upgrades</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            Upgrade proposals should come from validated history, not seed demos. This surface stays empty until real findings exist.
          </p>
        </CardContent>
      </Card>
      {proposalCount === 0 ? <SurfaceEmptyState model={model} /> : null}
    </div>
  );
}
