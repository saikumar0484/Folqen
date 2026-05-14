export const honestStatuses = ["Configured", "Needs approval", "Not connected", "Blocked"] as const;

export type HonestStatus = (typeof honestStatuses)[number];

export const uiStateModes = ["loading", "empty", "success", "blocked", "needs_approval", "not_connected"] as const;

export type UiStateMode = (typeof uiStateModes)[number];

const normalizedMap: Record<string, HonestStatus> = {
  mock: "Configured",
  configured: "Configured",
  live: "Configured",
  operational: "Configured",
  connected: "Configured",
  ready: "Configured",
  "needs approval": "Needs approval",
  needs_approval: "Needs approval",
  pending: "Needs approval",
  "not connected": "Not connected",
  not_connected: "Not connected",
  disconnected: "Not connected",
  blocked: "Blocked",
  disabled: "Blocked",
  failed: "Blocked",
  rejected: "Blocked",
  quarantined: "Blocked",
  degraded: "Blocked",
};

export function toHonestStatus(value: unknown): HonestStatus {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  return normalizedMap[normalized] ?? "Not connected";
}
