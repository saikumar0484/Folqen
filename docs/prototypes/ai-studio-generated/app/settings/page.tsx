import { AppShell } from "@/components/layout/app-shell";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export default function SettingsPage() {
  return (
    <AppShell title="Settings">
      <PagePlaceholder title="Settings" route="/settings" />
    </AppShell>
  );
}
