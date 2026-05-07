import { WorkflowsScreen } from "@/components/app/operations-screens";
import { getWorkflowsData } from "@/lib/operations-data";

export const dynamic = "force-dynamic";

export default async function WorkflowsPage() {
  const data = await getWorkflowsData();

  return <WorkflowsScreen data={data} />;
}
