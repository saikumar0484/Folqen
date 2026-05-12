import { PlatformsScreen } from "@/components/app/platforms-screen";
import { getPlatformsData } from "@/lib/platforms-data";
import { getPlatformOpsDashboard } from "@/lib/platform-ops/service";

export const dynamic = "force-dynamic";

export default async function PlatformsPage() {
  const [data, platformOps] = await Promise.all([getPlatformsData(), getPlatformOpsDashboard()]);

  return <PlatformsScreen data={data} platformOps={platformOps} />;
}
