import { CommandCenterPage } from "@/components/command-center/command-center-page";
import { IntelligenceRunPanel } from "@/components/command-center/intelligence-run-panel";
import { getCommandCenterView } from "@/lib/command-center/mock-service";
import { getIntelligenceDashboard } from "@/lib/intelligence/service";

export const dynamic = "force-dynamic";

export default async function ResearchIntelligencePage() {
  const intelligence = await getIntelligenceDashboard("research");
  const department = intelligence.departments[0];

  return (
    <div className="space-y-5">
      <CommandCenterPage view={getCommandCenterView("research-intelligence")} />
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
