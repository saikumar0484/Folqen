import { LibraryScreen } from "@/components/app/library-screen";
import { getLibraryData } from "@/lib/library-data";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const data = await getLibraryData();

  return <LibraryScreen data={data} />;
}
