import { Card, CardContent } from "@/components/ui/card";
import { SurfaceEmptyState } from "@/components/release/surface-empty-state";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDeploymentGovernanceDashboard } from "@/lib/deployment-governance/service";
import { getPreviewDeploymentDashboard } from "@/lib/preview-deployment/service";
import { buildEmptyStateModel, resolveCreatorAccountState } from "@/lib/public-release/account-state";
import { getWorkspaceOverview } from "@/lib/public-release/workspace-service";
import { toHonestStatus } from "@/lib/status-semantics";

export default async function WorkspaceHealthPage() {
  const user = await getCurrentUser();
  const [overview, deploymentGovernance, previewDeployment] = await Promise.all([
    user ? getWorkspaceOverview(user) : Promise.resolve({ hasWorkspace: false }),
    getDeploymentGovernanceDashboard(),
    getPreviewDeploymentDashboard(),
  ]);

  const emptyModel = buildEmptyStateModel("infrastructure", resolveCreatorAccountState({ hasWorkspace: overview.hasWorkspace, hasRecords: true }));

  return (
    <div className="section-space pb-8">
      <Card className="panel-soft">
        <CardContent className="py-5">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">Workspace Health</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            Quick health checks for your workspace so you can keep creating without setup surprises.
          </p>
        </CardContent>
      </Card>

      {!overview.hasWorkspace ? <SurfaceEmptyState model={emptyModel} /> : null}

      {overview.hasWorkspace ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="panel">
            <CardContent className="py-5">
              <h2 className="text-lg font-semibold">Readiness</h2>
              <div className="mt-3 space-y-2">
                {previewDeployment.checks.slice(0, 8).map((check) => (
                  <article key={check.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="font-semibold text-sm">{check.label}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{toHonestStatus(check.status)}</div>
                  </article>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="panel-soft">
            <CardContent className="py-5">
              <h2 className="text-lg font-semibold">Environment profile</h2>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">Profile: {deploymentGovernance.runtimeProfile}</div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">Status: {toHonestStatus(deploymentGovernance.readinessStatus)}</div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">Key warning count: {deploymentGovernance.summary.warnings}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
