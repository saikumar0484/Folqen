"use client";

import { useEffect, useState } from "react";
import { Search, X, Zap } from "lucide-react";

const commands = [
  "Create content package",
  "Review latest draft",
  "Fix failed render",
  "Show tool limits",
  "Pause automation",
  "Explain analytics",
  "Show pending approvals",
  "Show upgrade proposals",
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-foreground transition hover:bg-white/[0.06]"
      >
        <Zap className="h-4 w-4 text-neon" />
        <span className="hidden sm:inline">Command</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="mx-auto mt-20 max-w-xl overflow-hidden rounded-2xl border border-neon/25 bg-surface shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Search className="h-4 w-4 text-neon" />
              <input
                autoFocus
                placeholder="Run a safe Folqen command..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-2">
              {commands.map((command) => (
                <button
                  key={command}
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm text-muted-foreground transition hover:bg-neon/[0.08] hover:text-foreground"
                >
                  {command}
                  <span className="rounded-md border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neon">
                    Mock
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
