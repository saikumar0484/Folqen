import { CommandCenterPage } from "@/components/command-center/command-center-page";
import { IntelligenceRunPanel } from "@/components/command-center/intelligence-run-panel";
import { LiveResearchOperationsPanel } from "@/components/command-center/live-research-operations-panel";
import { getCommandCenterView } from "@/lib/command-center/mock-service";
import { getIntelligenceDashboard } from "@/lib/intelligence/service";
import { getLiveExecutionDashboard } from "@/lib/live-execution/service";

export const dynamic = "force-dynamic";

export default async function ResearchIntelligencePage() {
  const intelligence = await getIntelligenceDashboard("research");
  const liveExecution = await getLiveExecutionDashboard();
  const department = intelligence.departments[0];

  return (
    <div className="space-y-5">
      <CommandCenterPage view={getCommandCenterView("research-intelligence")} />
      <LiveResearchOperationsPanel liveExecution={liveExecution} />
      <IntelligenceRunPanel
        departmentId="research"
        title="Research Department workflow runner"
        description="Run trend, competitor, viral opportunity, audience, and platform intelligence workflows using manual inputs only."
        workflows={department.workflows}
        agents={department.agents}
        recentRuns={intelligence.runs.filter((run) => department.workflows.some((workflow) => workflow.kind === run.workflowId))}
      />
    </div>
  );
}
