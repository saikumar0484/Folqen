import { AppShell } from "@/components/layout/app-shell";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard">
      <PagePlaceholder title="Dashboard" route="/dashboard" />
    </AppShell>
  );
}
