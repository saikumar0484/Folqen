"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { SidebarContent } from "@/components/app/sidebar";

export function MobileSidebarDrawer() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-white/[0.05] text-muted-foreground transition hover:text-foreground lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="glass-heavy relative h-full w-[min(90vw,23rem)] border-r border-white/12 px-4 py-4 shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-3 rounded-xl border border-white/12 bg-white/[0.03] p-3 text-xs text-muted-foreground">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-neon">Creator quick path</div>
              <div className="mt-1">Onboarding → First workflow → Draft package review.</div>
            </div>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}
    </>
  );
}
