"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Bot,
  Brain,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircuitBoard,
  DollarSign,
  FileText,
  FolderKanban,
  Globe2,
  KeyRound,
  Layers3,
  LockKeyhole,
  Megaphone,
  Palette,
  RadioTower,
  Settings,
  Server,
  ShieldAlert,
  Sparkles,
  TerminalSquare,
  UploadCloud,
  Users,
  Workflow,
  Wrench,
  Zap,
} from "lucide-react";
import { appRoutes, type AppRouteId } from "@/lib/app-routes";
import { cn } from "@/lib/utils";
import { useCommandCenterStore } from "@/stores/command-center-store";

const iconMap: Record<AppRouteId, ComponentType<{ className?: string }>> = {
  dashboard: CircuitBoard,
  agents: Users,
  departments: Building2,
  "research-intelligence": RadioTower,
  "content-studio": Layers3,
  "organizational-memory": Brain,
  automations: Zap,
  "browser-operations": Globe2,
  "incident-center": AlertTriangle,
  infrastructure: Server,
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

const commandCenterRouteIds: AppRouteId[] = [
  "dashboard",
  "agents",
  "departments",
  "workflows",
  "research-intelligence",
  "content-studio",
  "analytics",
  "organizational-memory",
  "automations",
  "browser-operations",
  "incident-center",
  "infrastructure",
  "settings",
];

const creatorRouteIds: AppRouteId[] = ["agent", "calendar", "pipeline", "library", "approvals", "platforms", "tools", "files"];
const systemRouteIds: AppRouteId[] = ["notifications", "audit", "errors", "upgrades", "monetization", "brand"];

function routesById(ids: AppRouteId[]) {
  return ids.map((id) => appRoutes.find((route) => route.id === id)).filter((route): route is (typeof appRoutes)[number] => Boolean(route));
}

const commandCenterRoutes = routesById(commandCenterRouteIds);
const creatorRoutes = routesById(creatorRouteIds);
const systemRoutes = routesById(systemRouteIds);

function NavList({ routes, onNavigate, collapsed = false }: { routes: typeof appRoutes; onNavigate?: () => void; collapsed?: boolean }) {
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
            onClick={onNavigate}
            className={cn(
              "group relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition duration-200",
              collapsed ? "justify-center px-0" : "",
              active
                ? "bg-neon/[0.12] text-foreground ring-1 ring-neon/35 shadow-[0_0_30px_rgba(182,255,59,.10)]"
                : "text-muted-foreground hover:bg-white/[0.045] hover:text-foreground",
            )}
            aria-label={collapsed ? route.label : undefined}
            title={collapsed ? route.label : undefined}
          >
            {active ? <span className="absolute left-0 h-5 w-0.5 rounded-full bg-neon shadow-[0_0_12px_rgba(182,255,59,.8)]" /> : null}
            <Icon className={cn("h-4 w-4 shrink-0 transition", active ? "text-neon" : "group-hover:text-neon/90")} />
            <span className={cn("truncate", collapsed ? "sr-only" : "")}>{route.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarContent({ onNavigate, collapsed = false }: { onNavigate?: () => void; collapsed?: boolean }) {
  return (
    <>
      <Link href="/dashboard" onClick={onNavigate} className={cn("flex shrink-0 items-center gap-3 rounded-2xl px-2 py-2", collapsed ? "justify-center px-0" : "")}>
        <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-neon text-primary-foreground shadow-glow">
          <span className="absolute inset-0 rounded-xl bg-white/30 opacity-0 transition group-hover:opacity-100" />
          <Sparkles className="h-5 w-5" />
        </span>
        <span className={cn(collapsed ? "sr-only" : "")}>
          <span className="block font-display text-lg font-semibold tracking-[-0.02em]">Folqen</span>
          <span className="block font-mono text-[10px] uppercase tracking-[0.28em] text-neon/80">Autonomous HQ</span>
        </span>
      </Link>

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(182,255,59,.25)_transparent]">
        <div>
          <div className={cn("mb-2 px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground", collapsed ? "sr-only" : "")}>Command Center</div>
          <NavList routes={commandCenterRoutes} onNavigate={onNavigate} collapsed={collapsed} />
        </div>

        <div className="mt-6">
          <div className={cn("mb-2 px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground", collapsed ? "sr-only" : "")}>Creator Ops</div>
          <NavList routes={creatorRoutes} onNavigate={onNavigate} collapsed={collapsed} />
        </div>

        <div className="mt-6 pb-2">
          <div className={cn("mb-2 px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground", collapsed ? "sr-only" : "")}>Control</div>
          <NavList routes={systemRoutes} onNavigate={onNavigate} collapsed={collapsed} />
        </div>
      </div>

      <div className={cn("scanline mt-4 shrink-0 rounded-2xl border border-neon/20 bg-[linear-gradient(180deg,rgba(182,255,59,.08),rgba(255,255,255,.025))] p-4 shadow-[0_0_35px_rgba(182,255,59,.08)]", collapsed ? "p-2" : "")}>
        <div className="flex items-center gap-2 text-sm font-medium text-neon">
          <LockKeyhole className="h-4 w-4" />
          <span className={cn(collapsed ? "sr-only" : "")}>Approval gates active</span>
        </div>
        <p className={cn("mt-2 text-xs leading-5 text-muted-foreground", collapsed ? "sr-only" : "")}>
          Publishing, paid tools, browser automation, and upgrades remain blocked until approved.
        </p>
      </div>
    </>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useCommandCenterStore();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-white/10 bg-[linear-gradient(180deg,rgba(7,11,9,.94),rgba(5,7,6,.82))] p-4 shadow-[24px_0_80px_rgba(0,0,0,.28)] backdrop-blur-2xl transition-[width] duration-300 lg:flex",
        sidebarCollapsed ? "w-20" : "w-72",
      )}
    >
      <button
        type="button"
        onClick={toggleSidebar}
        className="absolute -right-3 top-5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-surface text-muted-foreground shadow-xl transition hover:text-foreground"
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
      <SidebarContent collapsed={sidebarCollapsed} />
    </aside>
  );
}
