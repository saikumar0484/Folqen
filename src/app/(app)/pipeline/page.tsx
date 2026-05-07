import { PipelineScreen } from "@/components/app/pipeline-screen";
import { getPipelineData } from "@/lib/pipeline-data";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const data = await getPipelineData();

  return <PipelineScreen data={data} />;
}
