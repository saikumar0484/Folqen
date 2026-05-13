import { CommandCenterPage } from "@/components/command-center/command-center-page";
import { DeploymentGovernancePanel } from "@/components/command-center/deployment-governance-panel";
import { PreviewDeploymentPanel } from "@/components/command-center/preview-deployment-panel";
import { getDeploymentGovernanceDashboard } from "@/lib/deployment-governance/service";
import { getCommandCenterView } from "@/lib/command-center/mock-service";
import { getPreviewDeploymentDashboard } from "@/lib/preview-deployment/service";

export default async function InfrastructurePage() {
  const [deploymentGovernance, previewDeployment] = await Promise.all([getDeploymentGovernanceDashboard(), getPreviewDeploymentDashboard()]);

  return (
    <div className="space-y-5">
      <CommandCenterPage view={getCommandCenterView("infrastructure")} embedded />
      <PreviewDeploymentPanel dashboard={previewDeployment} />
      <DeploymentGovernancePanel dashboard={deploymentGovernance} />
    </div>
  );
}
