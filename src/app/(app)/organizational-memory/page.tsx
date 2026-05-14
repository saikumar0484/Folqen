import { MemoryIntelligencePanel } from "@/components/command-center/memory-intelligence-panel";
import { SurfaceEmptyState } from "@/components/release/surface-empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMemoryDashboard } from "@/lib/memory/service";
import { buildEmptyStateModel, resolveCreatorAccountState } from "@/lib/public-release/account-state";
import { getWorkspaceOverview } from "@/lib/public-release/workspace-service";

export default async function OrganizationalMemoryPage() {
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
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">Organizational Memory</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">Store validated lessons and reflections from real runs. No synthetic memories are injected for new accounts.</p>
        </CardContent>
      </Card>
      {hasRecords ? <MemoryIntelligencePanel dashboard={dashboard} /> : <SurfaceEmptyState model={model} />}
    </div>
  );
}
