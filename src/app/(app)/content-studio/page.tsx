import { ControlledMediaExecutionPanel } from "@/components/command-center/controlled-media-execution-panel";
import { IntelligenceRunPanel } from "@/components/command-center/intelligence-run-panel";
import { LiveContentOperationsPanel } from "@/components/command-center/live-content-operations-panel";
import { MediaPipelinePanel } from "@/components/command-center/media-pipeline-panel";
import { SurfaceEmptyState } from "@/components/release/surface-empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getIntelligenceDashboard } from "@/lib/intelligence/service";
import { getLiveExecutionDashboard } from "@/lib/live-execution/service";
import { getMediaDashboard } from "@/lib/media/service";
import { buildEmptyStateModel, resolveCreatorAccountState } from "@/lib/public-release/account-state";
import { getWorkspaceOverview } from "@/lib/public-release/workspace-service";

export const dynamic = "force-dynamic";

export default async function ContentStudioPage() {
  const user = await getCurrentUser();
  const [overview, intelligence, liveExecution, media] = await Promise.all([
    user ? getWorkspaceOverview(user) : Promise.resolve({ hasWorkspace: false }),
    getIntelligenceDashboard("content"),
    getLiveExecutionDashboard(),
    getMediaDashboard(),
  ]);
  const department = intelligence.departments[0];
  const hasRuns = intelligence.runs.length > 0 || media.recentAssets.length > 0;
  const emptyModel = buildEmptyStateModel("content", resolveCreatorAccountState({ hasWorkspace: overview.hasWorkspace, hasRecords: hasRuns }));

  return (
    <div className="section-space pb-8">
      <Card className="panel-soft">
        <CardContent className="py-5">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">Content Studio</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            Build hooks, scripts, captions, metadata, and thumbnail drafts in one guided workflow with transparent safety states.
          </p>
        </CardContent>
      </Card>
      {!overview.hasWorkspace ? <SurfaceEmptyState model={emptyModel} /> : null}
      {overview.hasWorkspace ? (
        <>
      <LiveContentOperationsPanel liveExecution={liveExecution} />
      <IntelligenceRunPanel
        departmentId="content"
        title="Content Department workflow runner"
        description="Run topic, hook, script, thumbnail, caption, and metadata workflows. Draft packages remain review-only."
        workflows={department.workflows}
        agents={department.agents}
        recentRuns={intelligence.runs.filter((run) => department.workflows.some((workflow) => workflow.kind === run.workflowId))}
      />
      <ControlledMediaExecutionPanel dashboard={media} />
      <MediaPipelinePanel dashboard={media} />
        </>
      ) : null}
    </div>
  );
}
