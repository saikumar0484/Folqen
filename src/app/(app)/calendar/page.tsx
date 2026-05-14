import { Card, CardContent } from "@/components/ui/card";
import { SurfaceEmptyState } from "@/components/release/surface-empty-state";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { buildEmptyStateModel, resolveCreatorAccountState } from "@/lib/public-release/account-state";
import { getWorkspaceOverview } from "@/lib/public-release/workspace-service";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const user = await getCurrentUser();
  const [overview, scheduledCount] = await Promise.all([
    user ? getWorkspaceOverview(user) : Promise.resolve({ hasWorkspace: false }),
    hasDatabaseUrl() ? getDb().contentItem.count({ where: { status: "SCHEDULED" } }) : Promise.resolve(0),
  ]);
  const state = resolveCreatorAccountState({
    hasWorkspace: overview.hasWorkspace,
    hasRecords: scheduledCount > 0,
    integrationConnected: false,
  });
  const model = buildEmptyStateModel("calendar", state);

  return (
    <div className="section-space pb-8">
      <Card className="panel-soft">
        <CardContent className="py-5">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">Calendar</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            Plan cadence only after your first draft workflow. Folqen keeps schedule controls clean and approval-aware.
          </p>
        </CardContent>
      </Card>
      <SurfaceEmptyState model={model} />
    </div>
  );
}
