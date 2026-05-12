"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommandCenterStore } from "@/stores/command-center-store";

export function CommandSearchTrigger({ className }: { className?: string }) {
  const setCommandOpen = useCommandCenterStore((state) => state.setCommandOpen);

  return (
    <button
      type="button"
      onClick={() => setCommandOpen(true)}
      className={cn("min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition hover:bg-white/[0.06]", className)}
    >
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="truncate text-sm text-muted-foreground">Search agents, workflows, incidents, memory, infrastructure...</span>
      <span className="ml-auto rounded-md border border-white/10 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">Ctrl K</span>
    </button>
  );
}
