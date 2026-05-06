import { AppShell } from "@/components/layout/app-shell";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export default function ApprovalsPage() {
  return (
    <AppShell title="Approvals">
      <PagePlaceholder title="Approvals" route="/approvals" />
    </AppShell>
  );
}
