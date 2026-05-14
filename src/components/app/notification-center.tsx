"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, X } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

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
              <div className="text-xs text-muted-foreground">Signal center</div>
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
            <div className="rounded-xl border border-dashed border-white/12 bg-white/[0.02] p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-medium">No notifications yet</div>
                <StatusBadge tone="neutral">Configured</StatusBadge>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Folqen will show approval and workflow alerts only after real account events are created.</p>
              <Link href="/dashboard" className="mt-2 inline-block text-xs text-neon hover:underline">
                Open mission control
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
