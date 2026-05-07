import { AppShell } from "@/components/layout/app-shell";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export default function AuditPage() {
  return (
    <AppShell title="Audit">
      <PagePlaceholder title="Audit" route="/audit" />
    </AppShell>
  );
}
