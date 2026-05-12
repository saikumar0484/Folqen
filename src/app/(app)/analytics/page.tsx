import { CommandCenterPage } from "@/components/command-center/command-center-page";
import { getCommandCenterView } from "@/lib/command-center/mock-service";

export default function AnalyticsPage() {
  return <CommandCenterPage view={getCommandCenterView("analytics")} />;
}
