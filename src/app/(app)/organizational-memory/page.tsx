import { CommandCenterPage } from "@/components/command-center/command-center-page";
import { MemoryIntelligencePanel } from "@/components/command-center/memory-intelligence-panel";
import { getCommandCenterView } from "@/lib/command-center/mock-service";
import { getMemoryDashboard } from "@/lib/memory/service";

export default async function OrganizationalMemoryPage() {
  const dashboard = await getMemoryDashboard();

  return (
    <div className="space-y-5">
      <CommandCenterPage view={getCommandCenterView("organizational-memory")} />
      <MemoryIntelligencePanel dashboard={dashboard} />
    </div>
  );
}
