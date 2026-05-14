import { Card, CardContent } from "@/components/ui/card";
import { SurfaceEmptyState } from "@/components/release/surface-empty-state";
import { getCurrentUser } from "@/lib/auth/current-user";
import { buildEmptyStateModel, resolveCreatorAccountState } from "@/lib/public-release/account-state";
import { getWorkspaceOverview } from "@/lib/public-release/workspace-service";

export default async function AutomationsPage() {
  const user = await getCurrentUser();
  const overview = user ? await getWorkspaceOverview(user) : { hasWorkspace: false };
  const model = buildEmptyStateModel("automations", resolveCreatorAccountState({ hasWorkspace: overview.hasWorkspace, hasRecords: false, integrationConnected: false }));

  return (
    <div className="section-space pb-8">
      <Card className="panel-soft">
        <CardContent className="py-5">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">Automations</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">Automation stays essential-mode by default. Configure integrations first, then run governed workflows from dashboard mission control.</p>
        </CardContent>
      </Card>
      <SurfaceEmptyState model={model} />
    </div>
  );
}
