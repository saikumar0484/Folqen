import { AppShell } from "@/components/layout/app-shell";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export default function FilesPage() {
  return (
    <AppShell title="Files">
      <PagePlaceholder title="Files" route="/files" />
    </AppShell>
  );
}
