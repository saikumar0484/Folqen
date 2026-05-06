import { DashboardScreen } from "@/components/app/dashboard-screen";
import { getDashboardData } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return <DashboardScreen data={data} />;
}
