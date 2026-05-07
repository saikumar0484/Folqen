"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, CheckCircle2, FileText, Search, ShieldAlert, Wrench, X, Zap } from "lucide-react";
import { useToast } from "@/components/app/toast-provider";
import { appRoutes } from "@/lib/app-routes";

const quickCommands = [
  { label: "Create content package", href: "/agent", status: "Mock", icon: Bot },
  { label: "Review latest draft", href: "/approvals", status: "Needs approval", icon: ShieldAlert },
  { label: "Show tool limits", href: "/tools", status: "Not connected", icon: Wrench },
  { label: "Show pending approvals", href: "/approvals", status: "Live database", icon: CheckCircle2 },
  { label: "Open posting packages", href: "/library", status: "Manual", icon: FileText },
  { label: "Explain analytics", href: "/analytics", status: "Mock", icon: Zap },
];

export function CommandPalette() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

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
    setOpen(false);
    setQuery("");
    router.push(command.href);
    toast({
      title: command.label,
      description: command.status === "Not connected" ? "This area is still setup-gated and will stay honest until credentials are configured." : "Opening the selected Folqen workspace.",
      tone: command.status === "Not connected" ? "info" : "success",
    });
  }

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
                value={query}
                onChange={(event) => setQuery(event.target.value)}
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
              {commands.length === 0 ? <div className="px-3 py-6 text-sm text-muted-foreground">No matching command.</div> : null}
              {commands.map((command) => {
                const Icon = command.icon;

                return (
                  <button
                    key={`${command.label}-${command.href}`}
                    type="button"
                    onClick={() => runCommand(command)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-sm text-muted-foreground transition hover:bg-neon/[0.08] hover:text-foreground"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0 text-neon" />
                      <span className="truncate">{command.label}</span>
                    </span>
                    <span className="shrink-0 rounded-md border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neon">
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
