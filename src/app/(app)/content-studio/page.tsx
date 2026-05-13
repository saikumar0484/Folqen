import { CommandCenterPage } from "@/components/command-center/command-center-page";
import { ControlledMediaExecutionPanel } from "@/components/command-center/controlled-media-execution-panel";
import { IntelligenceRunPanel } from "@/components/command-center/intelligence-run-panel";
import { LiveContentOperationsPanel } from "@/components/command-center/live-content-operations-panel";
import { MediaPipelinePanel } from "@/components/command-center/media-pipeline-panel";
import { getCommandCenterView } from "@/lib/command-center/mock-service";
import { getIntelligenceDashboard } from "@/lib/intelligence/service";
import { getLiveExecutionDashboard } from "@/lib/live-execution/service";
import { getMediaDashboard } from "@/lib/media/service";

export const dynamic = "force-dynamic";

export default async function ContentStudioPage() {
  const intelligence = await getIntelligenceDashboard("content");
  const liveExecution = await getLiveExecutionDashboard();
  const media = await getMediaDashboard();
  const department = intelligence.departments[0];

  return (
    <div className="space-y-5">
      <CommandCenterPage view={getCommandCenterView("content-studio")} />
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
    </div>
  );
}
