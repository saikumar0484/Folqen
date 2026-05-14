import { CreatorMissionControl } from "@/components/release/creator-mission-control";
import { WorkspaceLaunchpad } from "@/components/release/workspace-launchpad";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getWorkspaceOverview } from "@/lib/public-release/workspace-service";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const overview = user ? await getWorkspaceOverview(user) : { hasWorkspace: false };
  const defaultObjective = "activeWorkspace" in overview ? overview.activeWorkspace?.objective : undefined;

  return (
    <div className="section-space pb-8">
      <WorkspaceLaunchpad hasWorkspace={overview.hasWorkspace} />

      <Card className="panel-soft">
        <CardContent className="grid gap-3 py-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Current objective</div>
            <div className="mt-1 text-sm font-semibold text-foreground">{defaultObjective ?? "Set your first objective in the command dock."}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Workflow mode</div>
            <div className="mt-1 text-sm font-semibold text-foreground">Research -&gt; Script -&gt; Thumbnail -&gt; Draft</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Safety posture</div>
            <div className="mt-1 text-sm font-semibold text-foreground">Draft-only, governed execution</div>
          </div>
        </CardContent>
      </Card>

      <CreatorMissionControl defaultObjective={defaultObjective} />
    </div>
  );
}
