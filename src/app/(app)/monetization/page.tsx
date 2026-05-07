import { MonetizationScreen } from "@/components/app/foundation-pages-screens";
import { getMonetizationData } from "@/lib/foundation-pages-data";

export const dynamic = "force-dynamic";

export default async function MonetizationPage() {
  const data = await getMonetizationData();

  return <MonetizationScreen data={data} />;
}
