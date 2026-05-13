export type DeploymentGovernanceStatus = "Mock" | "Not connected" | "Needs approval" | "Configured" | "Blocked" | "Live";

export type RuntimeProfile = "local" | "docker" | "vps" | "coolify" | "vercel";

export type DeploymentCheckSeverity = "info" | "warning" | "error" | "critical";

export type DeploymentCheck = {
  id: string;
  category: "environment" | "secret" | "startup" | "docker" | "vps" | "runtime" | "rollback" | "security" | "observability";
  label: string;
  status: DeploymentGovernanceStatus;
  severity: DeploymentCheckSeverity;
  summary: string;
  evidence: string[];
  recoveryAction: string;
};

export type SecretGovernanceCheck = {
  id: string;
  envKey: string;
  status: DeploymentGovernanceStatus;
  requiredFor: RuntimeProfile[];
  configured: boolean;
  maskedValue: string;
  summary: string;
  rotationGuidance: string;
};

export type StartupIntegrityCheck = {
  id: string;
  label: string;
  status: DeploymentGovernanceStatus;
  summary: string;
  controls: string[];
};

export type DockerDeploymentProfile = {
  id: string;
  name: string;
  status: DeploymentGovernanceStatus;
  services: string[];
  persistence: string[];
  safety: string[];
};

export type VpsReadinessCheck = {
  id: string;
  target: "Oracle VPS" | "Hetzner VPS" | "Coolify" | "Reverse proxy" | "Backups";
  status: DeploymentGovernanceStatus;
  summary: string;
  requiredActions: string[];
};

export type RollbackReadinessCheck = {
  id: string;
  label: string;
  status: DeploymentGovernanceStatus;
  summary: string;
  rollbackSteps: string[];
};

export type DeploymentReadinessDashboard = {
  mode: "read_only";
  generatedAt: string;
  runtimeProfile: RuntimeProfile;
  readinessStatus: DeploymentGovernanceStatus;
  startupMode: "dry_run" | "rollback" | "quarantine" | "kill_switch" | "normal";
  productionSafe: boolean;
  summary: {
    checks: number;
    blocked: number;
    warnings: number;
    configuredSecrets: number;
    missingRequiredSecrets: number;
  };
  environment: DeploymentCheck[];
  secrets: SecretGovernanceCheck[];
  startupIntegrity: StartupIntegrityCheck[];
  dockerProfiles: DockerDeploymentProfile[];
  vpsReadiness: VpsReadinessCheck[];
  rollbackReadiness: RollbackReadinessCheck[];
  observability: DeploymentCheck[];
  notes: string[];
};
