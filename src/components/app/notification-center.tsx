"use client";

import { useState } from "react";
import { Bell, X } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

const alerts = [
  { title: "Public publishing blocked", body: "Approval, safety, copyright, and review gates must pass first.", tone: "safe" as const },
  { title: "n8n not connected", body: "Webhook URL and secret are still placeholders.", tone: "warning" as const },
  { title: "Upgrade proposal drafted", body: "Research can continue, execution requires approval.", tone: "premium" as const },
];

export function NotificationCenter() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-foreground transition hover:bg-white/[0.06]"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-neon" />
      </button>

      {open ? (
        <div className="absolute right-0 mt-3 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <div className="font-display text-sm font-semibold">Notifications</div>
              <div className="text-xs text-muted-foreground">Mock signal center</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2 p-3">
            {alerts.map((alert) => (
              <div key={alert.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm font-medium">{alert.title}</div>
                  <StatusBadge tone={alert.tone}>{alert.tone === "warning" ? "Not connected" : "Mock"}</StatusBadge>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{alert.body}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
