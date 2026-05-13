import { CommandCenterPage } from "@/components/command-center/command-center-page";
import { LiveAnalyticsOperationsPanel } from "@/components/command-center/live-analytics-operations-panel";
import { getCommandCenterView } from "@/lib/command-center/mock-service";
import { getLiveExecutionDashboard } from "@/lib/live-execution/service";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const liveExecution = await getLiveExecutionDashboard();

  return (
    <div className="space-y-5">
      <CommandCenterPage view={getCommandCenterView("analytics")} />
      <LiveAnalyticsOperationsPanel liveExecution={liveExecution} />
    </div>
  );
}
