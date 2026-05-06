import { AppShell } from "@/components/layout/app-shell";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export default function PipelinePage() {
  return (
    <AppShell title="Pipeline">
      <PagePlaceholder title="Pipeline" route="/pipeline" />
    </AppShell>
  );
}
