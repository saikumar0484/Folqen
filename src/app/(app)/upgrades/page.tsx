import { UpgradesScreen } from "@/components/app/operations-screens";
import { getUpgradesData } from "@/lib/operations-data";

export const dynamic = "force-dynamic";

export default async function UpgradesPage() {
  const data = await getUpgradesData();

  return <UpgradesScreen data={data} />;
}
