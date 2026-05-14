import { IntelligenceRunPanel } from "@/components/command-center/intelligence-run-panel";
import { LiveResearchOperationsPanel } from "@/components/command-center/live-research-operations-panel";
import { SurfaceEmptyState } from "@/components/release/surface-empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getIntelligenceDashboard } from "@/lib/intelligence/service";
import { getLiveExecutionDashboard } from "@/lib/live-execution/service";
import { buildEmptyStateModel, resolveCreatorAccountState } from "@/lib/public-release/account-state";
import { getWorkspaceOverview } from "@/lib/public-release/workspace-service";

export const dynamic = "force-dynamic";

export default async function ResearchIntelligencePage() {
  const user = await getCurrentUser();
  const [overview, intelligence, liveExecution] = await Promise.all([
    user ? getWorkspaceOverview(user) : Promise.resolve({ hasWorkspace: false }),
    getIntelligenceDashboard("research"),
    getLiveExecutionDashboard(),
  ]);
  const department = intelligence.departments[0];
  const hasRuns = intelligence.runs.length > 0;
  const emptyModel = buildEmptyStateModel("research", resolveCreatorAccountState({ hasWorkspace: overview.hasWorkspace, hasRecords: hasRuns }));

  return (
    <div className="section-space pb-8">
      <Card className="panel-soft">
        <CardContent className="py-5">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">Research Intelligence</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            Start with one creator question and generate strategic signals you can immediately use in scripts and thumbnails.
          </p>
        </CardContent>
      </Card>
      {!overview.hasWorkspace ? <SurfaceEmptyState model={emptyModel} /> : null}
      {overview.hasWorkspace ? (
        <>
      <LiveResearchOperationsPanel liveExecution={liveExecution} />
      <IntelligenceRunPanel
        departmentId="research"
        title="Research Department workflow runner"
        description="Run trend, competitor, viral opportunity, audience, and platform intelligence workflows using manual inputs only."
        workflows={department.workflows}
        agents={department.agents}
        recentRuns={intelligence.runs.filter((run) => department.workflows.some((workflow) => workflow.kind === run.workflowId))}
      />
        </>
      ) : null}
    </div>
  );
}
