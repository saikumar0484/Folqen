import { DeploymentGovernancePanel } from "@/components/command-center/deployment-governance-panel";
import { PreviewDeploymentPanel } from "@/components/command-center/preview-deployment-panel";
import { SurfaceEmptyState } from "@/components/release/surface-empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDeploymentGovernanceDashboard } from "@/lib/deployment-governance/service";
import { getPreviewDeploymentDashboard } from "@/lib/preview-deployment/service";
import { buildEmptyStateModel, resolveCreatorAccountState } from "@/lib/public-release/account-state";
import { getWorkspaceOverview } from "@/lib/public-release/workspace-service";

export default async function InfrastructurePage() {
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
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em]">Infrastructure & Readiness</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
            Use these diagnostics to prepare a stable beta environment. Execution guardrails stay active while you validate readiness and recoverability.
          </p>
        </CardContent>
      </Card>
      {!overview.hasWorkspace ? <SurfaceEmptyState model={emptyModel} /> : null}
      {overview.hasWorkspace ? (
        <>
          <PreviewDeploymentPanel dashboard={previewDeployment} />
          <DeploymentGovernancePanel dashboard={deploymentGovernance} />
        </>
      ) : null}
    </div>
  );
}
