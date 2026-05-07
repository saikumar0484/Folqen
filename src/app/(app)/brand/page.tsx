import { BrandScreen } from "@/components/app/foundation-pages-screens";
import { getBrandData } from "@/lib/foundation-pages-data";

export const dynamic = "force-dynamic";

export default async function BrandPage() {
  const data = await getBrandData();

  return <BrandScreen data={data} />;
}
