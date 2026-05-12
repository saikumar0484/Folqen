import { CommandCenterPage } from "@/components/command-center/command-center-page";
import { getCommandCenterView } from "@/lib/command-center/mock-service";

export default function ResearchIntelligencePage() {
  return <CommandCenterPage view={getCommandCenterView("research-intelligence")} />;
}
