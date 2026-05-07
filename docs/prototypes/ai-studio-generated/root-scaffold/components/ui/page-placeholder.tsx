import { CommandPalettePlaceholder } from "@/components/shell/command-palette";
import { NotificationCenterPlaceholder } from "@/components/shell/notification-center";
import { ConfirmDialog } from "@/components/design/confirm-dialog";
import { EmptyState } from "@/components/design/empty-state";
import { LoadingSkeleton } from "@/components/design/loading-skeleton";
import { PageHeader } from "@/components/design/page-header";
import { StatCard } from "@/components/design/stat-card";

export function PagePlaceholder({ title, route }: { title: string; route: string }) {
  return (
    <div className="space-y-5">
      <PageHeader title={title} subtitle={`${route} • Premium placeholder UI`} />
      <div className="grid gap-3 md:grid-cols-3">
        <StatCard label="Agent Status" value="Active" hint="Mock execution mode" />
        <StatCard label="Pending Approvals" value="3" hint="Human review required" />
        <StatCard label="Integrations" value="Not connected" hint="Safe default state" />
      </div>
      <LoadingSkeleton />
      <EmptyState title="No live data yet" description="This module is intentionally running in mocked mode until Phase 3+ integrations are configured." />
      <div className="grid gap-3 md:grid-cols-2">
        <CommandPalettePlaceholder />
        <NotificationCenterPlaceholder />
      </div>
      <ConfirmDialog />
    </div>
  );
}
