import { PlatformsScreen } from "@/components/app/platforms-screen";
import { getPlatformsData } from "@/lib/platforms-data";

export const dynamic = "force-dynamic";

export default async function PlatformsPage() {
  const data = await getPlatformsData();

  return <PlatformsScreen data={data} />;
}
