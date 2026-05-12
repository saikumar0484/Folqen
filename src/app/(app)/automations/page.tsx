import { CommandCenterPage } from "@/components/command-center/command-center-page";
import { getCommandCenterView } from "@/lib/command-center/mock-service";

export default function AutomationsPage() {
  return <CommandCenterPage view={getCommandCenterView("automations")} />;
}
