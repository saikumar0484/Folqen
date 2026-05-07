import { FilesScreen } from "@/components/app/foundation-pages-screens";
import { getFilesData } from "@/lib/foundation-pages-data";

export const dynamic = "force-dynamic";

export default async function FilesPage() {
  const data = await getFilesData();

  return <FilesScreen data={data} />;
}
