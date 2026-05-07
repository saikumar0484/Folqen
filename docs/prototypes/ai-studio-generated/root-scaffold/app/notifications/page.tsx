import { AppShell } from "@/components/layout/app-shell";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export default function NotificationsPage() {
  return (
    <AppShell title="Notifications">
      <PagePlaceholder title="Notifications" route="/notifications" />
    </AppShell>
  );
}
