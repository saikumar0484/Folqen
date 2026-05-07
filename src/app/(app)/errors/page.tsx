import { ErrorsScreen } from "@/components/app/operations-screens";
import { getErrorsData } from "@/lib/operations-data";

export const dynamic = "force-dynamic";

export default async function ErrorsPage() {
  const data = await getErrorsData();

  return <ErrorsScreen data={data} />;
}
