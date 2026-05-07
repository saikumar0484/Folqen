import { NotificationsScreen } from "@/components/app/operations-screens";
import { getNotificationsData } from "@/lib/operations-data";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const data = await getNotificationsData();

  return <NotificationsScreen data={data} />;
}
