import { Card, CardContent } from "@/components/ui/card";
import { SurfaceEmptyState } from "@/components/release/surface-empty-state";
import { getCurrentUser } from "@/lib/auth/current-user";
import { buildEmptyStateModel, resolveCreatorAccountState } from "@/lib/public-release/account-state";
import { getWorkspaceOverview } from "@/lib/public-release/workspace-service";

export const dynamic = "force-dynamic";

export default async function MonetizationPage() {
  const user = await getCurrentUser();
  const overview = user ? await getWorkspaceOverview(user) : { hasWorkspace: false };
  const model = buildEmptyStateModel(
    "monetization",
    resolveCreatorAccountState({
      hasWorkspace: overview.hasWorkspace,
      hasRecords: false,
      integrationConnected: false,
    }),
  );

  return (
    <div className="section-space pb-8">
      <Card className="panel-soft">
        <CardContent className="py-5">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">Monetization</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            Track monetization readiness as your channels and creator workflows mature.
          </p>
        </CardContent>
      </Card>
      <SurfaceEmptyState model={model} />
    </div>
  );
}
