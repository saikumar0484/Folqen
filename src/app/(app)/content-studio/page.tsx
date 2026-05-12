import { CommandCenterPage } from "@/components/command-center/command-center-page";
import { IntelligenceRunPanel } from "@/components/command-center/intelligence-run-panel";
import { MediaPipelinePanel } from "@/components/command-center/media-pipeline-panel";
import { getCommandCenterView } from "@/lib/command-center/mock-service";
import { getIntelligenceDashboard } from "@/lib/intelligence/service";
import { getMediaDashboard } from "@/lib/media/service";

export const dynamic = "force-dynamic";

export default async function ContentStudioPage() {
  const intelligence = await getIntelligenceDashboard("content");
  const media = await getMediaDashboard();
  const department = intelligence.departments[0];

  return (
    <div className="space-y-5">
      <CommandCenterPage view={getCommandCenterView("content-studio")} />
      <IntelligenceRunPanel
        departmentId="content"
        title="Content Department workflow runner"
        description="Run topic, hook, script, thumbnail, caption, and metadata workflows. Draft packages remain review-only."
        workflows={department.workflows}
        agents={department.agents}
        recentRuns={intelligence.runs.filter((run) => department.workflows.some((workflow) => workflow.kind === run.workflowId))}
      />
      <MediaPipelinePanel dashboard={media} />
    </div>
  );
}
