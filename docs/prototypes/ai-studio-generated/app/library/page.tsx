import { AppShell } from "@/components/layout/app-shell";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export default function LibraryPage() {
  return (
    <AppShell title="Library">
      <PagePlaceholder title="Library" route="/library" />
    </AppShell>
  );
}
