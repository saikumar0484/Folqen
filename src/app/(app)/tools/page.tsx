import { ToolsScreen } from "@/components/app/tools-screen";
import { getToolsData } from "@/lib/tools-data";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const data = await getToolsData();

  return <ToolsScreen data={data} />;
}
