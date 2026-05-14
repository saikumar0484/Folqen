import type { GovernanceActionType, GovernancePermission, GovernanceRole } from "./types";

export const governanceActions: Array<{ actionType: GovernanceActionType; label: string; description: string }> = [
  { actionType: "public_publish", label: "Public Publishing", description: "Any action that can make content public on a platform." },
  { actionType: "provider_execution", label: "Provider Execution", description: "Calls to AI, media, workflow, analytics, storage, or platform providers." },
  { actionType: "live_workflow", label: "Live Workflow", description: "n8n, worker, or queue-backed execution outside dry-run planning." },
  { actionType: "account_access", label: "Account Access", description: "OAuth, platform, storage, analytics, or monetization account access." },
  { actionType: "automation_trigger", label: "Automation Trigger", description: "Autonomous workflow or scheduled action execution." },
  { actionType: "media_render", label: "Media Rendering", description: "FFmpeg, ComfyUI, local worker, or other rendering execution." },
  { actionType: "paid_tool", label: "Paid Tool", description: "Any execution that can spend API credits or money." },
  { actionType: "provider_activation", label: "Provider Activation", description: "Changing a provider from placeholder/configured to live execution." },
  { actionType: "queue_live_mode", label: "Queue Live Mode", description: "Turning Redis/BullMQ workers into execution mode." },
  { actionType: "retry_execution", label: "Retry Execution", description: "Retrying failed live or publishing-adjacent operations." },
  { actionType: "sandbox_test", label: "Sandbox Test", description: "Dry-run provider simulation and isolated execution testing." },
];

export const roleMatrix: Array<{ role: GovernanceRole; permissions: GovernancePermission[]; restrictions: string[] }> = [
  {
    role: "EXECUTIVE",
    permissions: ["approve_high_risk", "approve_provider_activation", "approve_public_publishing", "approve_paid_tools", "run_sandbox", "view_audit", "request_approval", "revoke_execution", "escalate_incident"],
    restrictions: ["Cannot bypass hard-coded safety defaults without environment flags and code-level guards."],
  },
  {
    role: "DEPARTMENT_MANAGER",
    permissions: ["run_sandbox", "view_audit", "request_approval", "escalate_incident"],
    restrictions: ["Cannot approve public publishing, paid tools, provider activation, or account access."],
  },
  {
    role: "OPERATOR",
    permissions: ["run_sandbox", "view_audit", "request_approval", "escalate_incident"],
    restrictions: ["Can request and review routine approvals, but cannot activate providers or bypass policy blocks."],
  },
  {
    role: "WORKER",
    permissions: ["run_sandbox", "request_approval"],
    restrictions: ["No live execution permissions."],
  },
  {
    role: "VIEWER",
    permissions: ["view_audit"],
    restrictions: ["Read-only governance visibility."],
  },
  {
    role: "SYSTEM",
    permissions: ["request_approval"],
    restrictions: ["System can request approvals and log policy decisions but cannot approve itself."],
  },
];
