import { ToolsScreen } from "@/components/app/tools-screen";
import { getAiGatewayDashboard } from "@/lib/ai-gateway/service";
import { getLiveExecutionDashboard } from "@/lib/live-execution/service";
import { getToolsData } from "@/lib/tools-data";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const [data, aiGateway, liveExecution] = await Promise.all([getToolsData(), getAiGatewayDashboard(), getLiveExecutionDashboard()]);

  return <ToolsScreen data={data} aiGateway={aiGateway} liveExecution={liveExecution} />;
}
