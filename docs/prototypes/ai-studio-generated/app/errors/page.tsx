import { AppShell } from "@/components/layout/app-shell";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export default function ErrorsPage() {
  return (
    <AppShell title="Errors">
      <PagePlaceholder title="Errors" route="/errors" />
    </AppShell>
  );
}
