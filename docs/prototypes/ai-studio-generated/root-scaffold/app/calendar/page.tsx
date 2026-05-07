import { AppShell } from "@/components/layout/app-shell";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export default function CalendarPage() {
  return (
    <AppShell title="Calendar">
      <PagePlaceholder title="Calendar" route="/calendar" />
    </AppShell>
  );
}
