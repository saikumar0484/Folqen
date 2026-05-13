import { CommandCenterPage } from "@/components/command-center/command-center-page";
import { DeploymentGovernancePanel } from "@/components/command-center/deployment-governance-panel";
import { getDeploymentGovernanceDashboard } from "@/lib/deployment-governance/service";
import { getCommandCenterView } from "@/lib/command-center/mock-service";

export default async function InfrastructurePage() {
  const deploymentGovernance = await getDeploymentGovernanceDashboard();

  return (
    <div className="space-y-5">
      <CommandCenterPage view={getCommandCenterView("infrastructure")} embedded />
      <DeploymentGovernancePanel dashboard={deploymentGovernance} />
    </div>
  );
}
