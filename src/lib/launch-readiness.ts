import type { ProviderConfig } from "@/lib/provider-config";

export type LaunchReadinessStatus = "ready" | "needs_human" | "needs_secret" | "later";

export type LaunchReadinessItem = {
  label: string;
  status: LaunchReadinessStatus;
  note: string;
};

const launchItems: LaunchReadinessItem[] = [
  {
    label: "Protected creator workspace",
    status: "ready",
    note: "Login, protected routes, database-backed dashboard, and audit trail are live.",
  },
  {
    label: "Manual channel content workflow",
    status: "ready",
    note: "Draft packages, approvals, library records, and manual posting packages are usable.",
  },
  {
    label: "Admin password rotation",
    status: "needs_human",
    note: "Use Settings to replace the first-run admin password before day-3 channel work.",
  },
  {
    label: "Google Drive private file storage",
    status: "needs_secret",
    note: "Needs Drive OAuth client, refresh token, and private folder id as server-only env vars.",
  },
  {
    label: "OpenAI real agent drafts",
    status: "needs_secret",
    note: "Needs OpenAI API key plus paid-tool approval before real model calls are allowed.",
  },
  {
    label: "Oracle n8n workflow testing",
    status: "needs_secret",
    note: "Needs n8n instance/webhook URL and shared secret before connection-only testing.",
  },
  {
    label: "Media rendering worker",
    status: "later",
    note: "FFmpeg, ComfyUI, and TTS should run on local/Oracle worker after health checks.",
  },
  {
    label: "Public platform publishing",
    status: "later",
    note: "Start with manual posting packages; OAuth and auto-publishing stay blocked.",
  },
];

export function buildLaunchReadiness(providerConfig: ProviderConfig) {
  const items = launchItems.map((item) => {
    if (item.label === "Google Drive private file storage" && providerConfig.storage.googleDrive.status === "configured") {
      return { ...item, status: "ready" as const, note: "Google Drive env values are configured; live upload testing is still required." };
    }

    if (item.label === "OpenAI real agent drafts" && providerConfig.ai.openai.status === "configured") {
      return { ...item, status: "needs_human" as const, note: "OpenAI key is configured; paid-tool approval is still required before real calls." };
    }

    if (item.label === "Oracle n8n workflow testing" && providerConfig.workflow.n8n.status === "configured") {
      return { ...item, status: "needs_human" as const, note: "n8n config exists; test only connection workflows until approved." };
    }

    return item;
  });
  const readyCount = items.filter((item) => item.status === "ready").length;
  const percent = Math.round((readyCount / items.length) * 100);

  return {
    percent,
    readyCount,
    totalCount: items.length,
    items,
    launchMode: "Day-3 usable MVP",
    summary:
      "Folqen can be used for protected planning and manual posting preparation now. Real automation needs secrets, approvals, and live tests before day-3 channel use.",
  };
}

export function statusLabel(status: LaunchReadinessStatus) {
  if (status === "ready") return "Ready";
  if (status === "needs_human") return "Needs human";
  if (status === "needs_secret") return "Needs secret";
  return "Later";
}
