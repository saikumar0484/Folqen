import { BrowserOperationsPanel } from "@/components/command-center/browser-operations-panel";
import { CommandCenterPage } from "@/components/command-center/command-center-page";
import { getBrowserOpsDashboard } from "@/lib/browser-ops/service";
import { getCommandCenterView } from "@/lib/command-center/mock-service";

export default async function BrowserOperationsPage() {
  const dashboard = await getBrowserOpsDashboard();

  return (
    <div className="space-y-5">
      <CommandCenterPage view={getCommandCenterView("browser-operations")} embedded />
      <BrowserOperationsPanel dashboard={dashboard} />
    </div>
  );
}
