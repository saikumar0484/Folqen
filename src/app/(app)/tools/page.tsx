import { ToolsScreen } from "@/components/app/tools-screen";
import { getAiGatewayDashboard } from "@/lib/ai-gateway/service";
import { getToolsData } from "@/lib/tools-data";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const [data, aiGateway] = await Promise.all([getToolsData(), getAiGatewayDashboard()]);

  return <ToolsScreen data={data} aiGateway={aiGateway} />;
}
