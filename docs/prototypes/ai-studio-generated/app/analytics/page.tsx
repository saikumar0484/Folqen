import { AppShell } from "@/components/layout/app-shell";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export default function AnalyticsPage() {
  return (
    <AppShell title="Analytics">
      <PagePlaceholder title="Analytics" route="/analytics" />
    </AppShell>
  );
}
