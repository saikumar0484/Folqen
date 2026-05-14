import type { DeploymentGovernanceStatus } from "@/lib/deployment-governance/types";

export type PreviewReadinessCheck = {
  id: string;
  label: string;
  status: DeploymentGovernanceStatus;
  summary: string;
  evidence: string[];
  recoveryAction: string;
};

export type PreviewDeploymentDashboard = {
  mode: "preview_safe";
  generatedAt: string;
  status: DeploymentGovernanceStatus;
  profile: string;
  summary: {
    checks: number;
    blocked: number;
    warnings: number;
    configured: number;
  };
  checks: PreviewReadinessCheck[];
  disabledRuntime: string[];
  visibleRoutes: string[];
  requiredEnv: string[];
  deploymentCommands: string[];
  notes: string[];
};
