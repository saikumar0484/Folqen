import { Card, CardContent } from "@/components/ui/card";
import { SurfaceEmptyState } from "@/components/release/surface-empty-state";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { buildEmptyStateModel, resolveCreatorAccountState } from "@/lib/public-release/account-state";
import { getWorkspaceOverview } from "@/lib/public-release/workspace-service";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const user = await getCurrentUser();
  const [overview, draftCount, assetCount] = await Promise.all([
    user ? getWorkspaceOverview(user) : Promise.resolve({ hasWorkspace: false }),
    hasDatabaseUrl() ? getDb().contentItem.count() : Promise.resolve(0),
    hasDatabaseUrl() ? getDb().asset.count() : Promise.resolve(0),
  ]);
  const hasRecords = draftCount > 0 || assetCount > 0;
  const model = buildEmptyStateModel(
    "library",
    resolveCreatorAccountState({
      hasWorkspace: overview.hasWorkspace,
      hasRecords,
    }),
  );

  return (
    <div className="section-space pb-8">
      <Card className="panel-soft">
        <CardContent className="py-5">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">Library</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            Your library stores only real drafts, files, and assets generated from your account activity.
          </p>
        </CardContent>
      </Card>
      {!hasRecords ? <SurfaceEmptyState model={model} /> : null}
    </div>
  );
}
