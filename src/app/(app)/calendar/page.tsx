import { CalendarScreen } from "@/components/app/foundation-pages-screens";
import { getCalendarData } from "@/lib/foundation-pages-data";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const data = await getCalendarData();

  return <CalendarScreen data={data} />;
}
