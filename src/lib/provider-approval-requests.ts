import type { RiskLevel } from "@prisma/client";

export const providerApprovalRequestTypes = ["google_drive_storage", "openai_paid_agent", "n8n_workflow_access", "media_worker"] as const;

export type ProviderApprovalRequestType = (typeof providerApprovalRequestTypes)[number];

type ProviderApprovalDefinition = {
  title: string;
  riskLevel: RiskLevel;
  reason: string;
  requiredSecrets: string[];
  blockedActions: string[];
  verificationPlan: string[];
};

export const providerApprovalDefinitions: Record<ProviderApprovalRequestType, ProviderApprovalDefinition> = {
  google_drive_storage: {
    title: "Connect Google Drive private storage",
    riskLevel: "MEDIUM",
    reason: "Allow Folqen to store creator files in a private Google Drive folder after OAuth credentials are configured server-side.",
    requiredSecrets: ["GOOGLE_DRIVE_CLIENT_ID", "GOOGLE_DRIVE_CLIENT_SECRET", "GOOGLE_DRIVE_REFRESH_TOKEN", "GOOGLE_DRIVE_FOLDER_ID"],
    blockedActions: ["public_file_access", "shared_link_creation", "destructive_file_delete"],
    verificationPlan: ["Confirm Drive status becomes configured.", "Upload a tiny private test file.", "Verify file metadata remains private."],
  },
  openai_paid_agent: {
    title: "Enable approval-gated OpenAI agent calls",
    riskLevel: "HIGH",
    reason: "Allow Folqen to use the selected OpenAI model only after an API key exists and paid-tool usage is explicitly approved.",
    requiredSecrets: ["OPENAI_API_KEY"],
    blockedActions: ["ungated_paid_generation", "automatic_public_publishing", "browser_automation"],
    verificationPlan: ["Confirm paid-tool guard blocks by default.", "Run one explicit approved test prompt.", "Record cost/status in audit logs."],
  },
  n8n_workflow_access: {
    title: "Connect self-hosted n8n workflow access",
    riskLevel: "HIGH",
    reason: "Allow Folqen to embed the self-hosted n8n UI and test a signed webhook while keeping real workflow execution approval-gated.",
    requiredSecrets: ["ORACLE_N8N_INSTANCE_URL", "N8N_WEBHOOK_URL", "N8N_WEBHOOK_SECRET"],
    blockedActions: ["public_publishing", "paid_tool_usage", "browser_automation", "account_mutations"],
    verificationPlan: ["Confirm n8n iframe requires login.", "Send connection_test webhook only.", "Review n8n logs before enabling workflows."],
  },
  media_worker: {
    title: "Connect local or Oracle media worker",
    riskLevel: "MEDIUM",
    reason: "Allow Folqen to test FFmpeg, ComfyUI, and TTS worker readiness without running long or paid media jobs inside Vercel.",
    requiredSecrets: ["LOCAL_WORKER_BASE_URL", "LOCAL_WORKER_SHARED_SECRET", "COMFYUI_BASE_URL", "FFMPEG_PATH", "TTS_PROVIDER_URL"],
    blockedActions: ["long_render_execution", "paid_voice_generation", "public_asset_upload"],
    verificationPlan: ["Run health checks only.", "Confirm worker secret validation.", "Keep render jobs queued until explicit approval."],
  },
};

export function buildProviderApprovalRequest(requestType: ProviderApprovalRequestType) {
  const definition = providerApprovalDefinitions[requestType];

  return {
    type: "provider_setup",
    title: definition.title,
    riskLevel: definition.riskLevel,
    reason: definition.reason,
    payload: {
      requestType,
      status: "approval_requested",
      requiredSecrets: definition.requiredSecrets,
      blockedActions: definition.blockedActions,
      verificationPlan: definition.verificationPlan,
      safetyDefaults: {
        publicPublishing: "blocked",
        paidTools: "blocked_until_explicit_approval",
        browserAutomation: "blocked",
        humanApproval: "required",
      },
      secretsIncluded: false,
    },
  };
}
