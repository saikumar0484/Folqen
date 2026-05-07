import { AnalyticsScreen } from "@/components/app/operations-screens";
import { getAnalyticsData } from "@/lib/operations-data";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return <AnalyticsScreen data={data} />;
}
