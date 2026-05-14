"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Brain, CheckCircle2, FileText, Loader2, Search, ShieldAlert, Sparkles, Wrench, X, Zap } from "lucide-react";
import { useToast } from "@/components/app/toast-provider";
import { appRoutes } from "@/lib/app-routes";
import { useCommandCenterStore } from "@/stores/command-center-store";

const quickCommands = [
  { label: "Open creator dashboard", href: "/dashboard", status: "Configured", icon: Sparkles },
  { label: "Open research workspace", href: "/research-intelligence", status: "Configured", icon: Brain },
  { label: "Open script and thumbnail workspace", href: "/content-studio", status: "Configured", icon: Bot },
  { label: "Open workflow history", href: "/workflows", status: "Configured", icon: FileText },
  { label: "Start creator onboarding", href: "/onboarding", status: "Configured", icon: Sparkles },
  { label: "Create first content package", href: "/agent", status: "Configured", icon: Bot },
  { label: "Review latest draft checklist", href: "/approvals", status: "Needs approval", icon: ShieldAlert },
  { label: "Open integrations setup", href: "/tools", status: "Not connected", icon: Wrench },
  { label: "Show pending approvals", href: "/approvals", status: "Needs approval", icon: CheckCircle2 },
  { label: "Open creator library", href: "/library", status: "Configured", icon: FileText },
  { label: "Explain analytics", href: "/analytics", status: "Configured", icon: Zap },
];

export function CommandPalette() {
  const router = useRouter();
  const { toast } = useToast();
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);
  const open = useCommandCenterStore((state) => state.commandOpen);
  const query = useCommandCenterStore((state) => state.query);
  const setOpen = useCommandCenterStore((state) => state.setCommandOpen);
  const setQuery = useCommandCenterStore((state) => state.setQuery);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(!open);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  const commands = useMemo(() => {
    const routeCommands = appRoutes.map((route) => ({
      label: `Open ${route.label}`,
      href: route.href,
      status: route.status,
      icon: Search,
    }));
    const allCommands = [...quickCommands, ...routeCommands];
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return allCommands.slice(0, 12);

    return allCommands.filter((command) => command.label.toLowerCase().includes(normalizedQuery)).slice(0, 12);
  }, [query]);

  function runCommand(command: (typeof commands)[number]) {
    setPendingLabel(command.label);
    setOpen(false);
    setQuery("");
    router.push(command.href);
    setTimeout(() => setPendingLabel(null), 900);
    toast({
      title: command.label,
      description: command.status === "Not connected" ? "This area unlocks after setup is completed." : "Opening your selected creator workspace.",
      tone: command.status === "Not connected" ? "info" : "success",
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/12 bg-white/[0.05] px-3 text-sm text-foreground transition hover:border-white/20 hover:bg-white/[0.08]"
      >
        {pendingLabel ? <Loader2 className="h-4 w-4 animate-spin text-neon" /> : <Zap className="h-4 w-4 text-neon" />}
        <span className="hidden sm:inline">Command</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="glass-heavy mx-auto mt-16 max-w-2xl overflow-hidden rounded-2xl border border-white/12 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Search className="h-4 w-4 text-neon" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ask Folqen to open a workspace or next action..."
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
              {commands.length === 0 ? <div className="px-3 py-6 text-sm text-muted-foreground">No matching command.</div> : null}
              {commands.map((command) => {
                const Icon = command.icon;

                return (
                  <button
                    key={`${command.label}-${command.href}`}
                    type="button"
                    onClick={() => runCommand(command)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm text-muted-foreground transition hover:bg-white/[0.07] hover:text-foreground"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0 text-neon/90" />
                      <span className="truncate">{command.label}</span>
                    </span>
                    <span className="shrink-0 rounded-md border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-neon">
                      {command.status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
