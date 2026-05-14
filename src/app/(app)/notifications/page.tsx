import { Card, CardContent } from "@/components/ui/card";
import { SurfaceEmptyState } from "@/components/release/surface-empty-state";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { buildEmptyStateModel, resolveCreatorAccountState } from "@/lib/public-release/account-state";
import { getWorkspaceOverview } from "@/lib/public-release/workspace-service";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  const [overview, notificationCount] = await Promise.all([
    user ? getWorkspaceOverview(user) : Promise.resolve({ hasWorkspace: false }),
    user && hasDatabaseUrl() ? getDb().notification.count({ where: { userId: user.id } }) : Promise.resolve(0),
  ]);
  const model = buildEmptyStateModel(
    "notifications",
    resolveCreatorAccountState({
      hasWorkspace: overview.hasWorkspace,
      hasRecords: notificationCount > 0,
    }),
  );

  return (
    <div className="section-space pb-8">
      <Card className="panel-soft">
        <CardContent className="py-5">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">Notifications</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            Notifications are event-driven. This page stays quiet until real workflow or approval events are created.
          </p>
        </CardContent>
      </Card>
      {notificationCount === 0 ? <SurfaceEmptyState model={model} /> : null}
    </div>
  );
}
