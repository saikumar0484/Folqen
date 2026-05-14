import { Card, CardContent } from "@/components/ui/card";
import { SurfaceEmptyState } from "@/components/release/surface-empty-state";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { buildEmptyStateModel, resolveCreatorAccountState } from "@/lib/public-release/account-state";
import { getWorkspaceOverview } from "@/lib/public-release/workspace-service";

export default async function WorkflowsPage() {
  const user = await getCurrentUser();
  const [overview, runCount] = await Promise.all([
    user ? getWorkspaceOverview(user) : Promise.resolve({ hasWorkspace: false }),
    hasDatabaseUrl() ? getDb().workflowRun.count() : Promise.resolve(0),
  ]);

  const state = resolveCreatorAccountState({
    hasWorkspace: overview.hasWorkspace,
    hasRecords: runCount > 0,
    integrationConnected: true,
  });
  const model = buildEmptyStateModel("workflows", state);

  return (
    <div className="section-space pb-8">
      <Card className="panel-soft">
        <CardContent className="py-5">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">Workflow Storyboard</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">Folqen keeps workflows creator-first: start from one objective, generate drafts, review safety state, and iterate conversationally.</p>
        </CardContent>
      </Card>
      {runCount === 0 ? <SurfaceEmptyState model={model} /> : null}
    </div>
  );
}
