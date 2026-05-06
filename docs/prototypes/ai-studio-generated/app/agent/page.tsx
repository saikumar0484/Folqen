import { AppShell } from "@/components/layout/app-shell";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export default function AgentPage() {
  return (
    <AppShell title="Agent">
      <PagePlaceholder title="Agent" route="/agent" />
    </AppShell>
  );
}
