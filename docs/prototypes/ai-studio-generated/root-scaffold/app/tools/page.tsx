import { AppShell } from "@/components/layout/app-shell";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export default function ToolsPage() {
  return (
    <AppShell title="Tools">
      <PagePlaceholder title="Tools" route="/tools" />
    </AppShell>
  );
}
