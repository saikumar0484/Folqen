"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  DollarSign,
  FileText,
  FolderKanban,
  KeyRound,
  LayoutGrid,
  LockKeyhole,
  Megaphone,
  Palette,
  Settings,
  ShieldAlert,
  Sparkles,
  TerminalSquare,
  UploadCloud,
  Workflow,
  Wrench,
} from "lucide-react";
import { appRoutes, type AppRouteId } from "@/lib/app-routes";
import { cn } from "@/lib/utils";

const iconMap: Record<AppRouteId, ComponentType<{ className?: string }>> = {
  dashboard: LayoutGrid,
  agent: Bot,
  calendar: CalendarDays,
  pipeline: FolderKanban,
  library: FileText,
  approvals: ShieldAlert,
  platforms: Megaphone,
  tools: Wrench,
  settings: Settings,
  analytics: BarChart3,
  monetization: DollarSign,
  brand: Palette,
  errors: TerminalSquare,
  audit: KeyRound,
  workflows: Workflow,
  files: UploadCloud,
  notifications: Bell,
  upgrades: Sparkles,
};

const primaryRoutes = appRoutes.slice(0, 10);
const systemRoutes = appRoutes.slice(10);

function NavList({ routes }: { routes: typeof appRoutes }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {routes.map((route) => {
        const Icon = iconMap[route.id];
        const active = pathname === route.href;

        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition",
              active
                ? "bg-neon/[0.12] text-foreground ring-1 ring-neon/30 shadow-glow"
                : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{route.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-white/10 bg-background/70 p-4 backdrop-blur-xl lg:flex">
      <Link href="/" className="flex shrink-0 items-center gap-3 rounded-2xl px-2 py-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon text-primary-foreground shadow-glow">
          <Sparkles className="h-5 w-5" />
        </span>
        <span>
          <span className="block font-display text-lg font-semibold">Folqen</span>
          <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Creator OS</span>
        </span>
      </Link>

      <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
        <div>
          <div className="mb-2 px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Workspace</div>
          <NavList routes={primaryRoutes} />
        </div>

        <div className="mt-6 pb-2">
          <div className="mb-2 px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Control</div>
          <NavList routes={systemRoutes} />
        </div>
      </div>

      <div className="mt-4 shrink-0 rounded-2xl border border-neon/20 bg-neon/[0.06] p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-neon">
          <LockKeyhole className="h-4 w-4" />
          Approval gates active
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Publishing, paid tools, browser automation, and upgrades remain blocked until approved.
        </p>
      </div>
    </aside>
  );
}
