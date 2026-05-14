"use client";

import { useState } from "react";
import { ShieldAlert, X } from "lucide-react";

export function ConfirmDialog({ label = "Risky action" }: { label?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"
      >
        <ShieldAlert className="h-4 w-4 text-neon" />
        Preview confirmation
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl border border-neon/25 bg-surface p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display text-lg font-semibold">{label}</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Real destructive, paid, publishing, credential, and security actions will require explicit approval before execution.
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-muted-foreground">
                Cancel
              </button>
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl bg-neon px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow">
                Keep blocked
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
