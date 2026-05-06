import { AppShell } from "@/components/layout/app-shell";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export default function WorkflowsPage() {
  return (
    <AppShell title="Workflows">
      <PagePlaceholder title="Workflows" route="/workflows" />
    </AppShell>
  );
}
