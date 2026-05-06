import { AppShell } from "@/components/layout/app-shell";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export default function BrandPage() {
  return (
    <AppShell title="Brand">
      <PagePlaceholder title="Brand" route="/brand" />
    </AppShell>
  );
}
