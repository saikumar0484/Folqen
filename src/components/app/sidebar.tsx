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

const operationsRouteIds: AppRouteId[] = ["agent", "calendar", "pipeline", "library", "approvals", "platforms", "tools", "files"];
const controlRouteIds: AppRouteId[] = ["notifications", "audit", "errors", "upgrades", "monetization", "brand"];

function routeGroup(ids: AppRouteId[]) {
  return ids.map((id) => appRoutes.find((route) => route.id === id)).filter((route): route is (typeof appRoutes)[number] => Boolean(route));
}

const commandCenterRoutes = routeGroup(commandCenterRouteIds);
const operationsRoutes = routeGroup(operationsRouteIds);
const controlRoutes = routeGroup(controlRouteIds);

function NavList({ routes, collapsed, onNavigate }: { routes: typeof appRoutes; collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
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
              active ? "bg-white/[0.12] text-foreground" : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
              collapsed && "justify-center px-0",
            )}
            title={collapsed ? route.label : undefined}
            aria-label={collapsed ? route.label : undefined}
          >
            {active ? <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-neon" /> : null}
            <Icon className={cn("h-4 w-4 shrink-0", active ? "text-neon" : "text-muted-foreground group-hover:text-foreground")} />
            <span className={cn("truncate", collapsed ? "sr-only" : "")}>{route.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Group({
  title,
  routes,
  collapsed,
  onNavigate,
}: {
  title: string;
  routes: typeof appRoutes;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <section className="mt-6 first:mt-0">
      <div className={cn("mb-2 px-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground", collapsed ? "sr-only" : "")}>{title}</div>
      <NavList routes={routes} collapsed={collapsed} onNavigate={onNavigate} />
    </section>
  );
}

export function SidebarContent({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const isCollapsed = collapsed ?? false;
  return (
    <>
      <Link href="/dashboard" onClick={onNavigate} className={cn("flex items-center gap-3 rounded-2xl px-2 py-2", isCollapsed && "justify-center px-0")}>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-neon text-black">
          <Sparkles className="h-4.5 w-4.5" />
        </span>
        <span className={cn(isCollapsed && "sr-only")}>
          <span className="block font-display text-lg font-semibold tracking-[-0.02em]">Folqen</span>
          <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Command OS</span>
        </span>
      </Link>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,.2)_transparent]">
        <Group title="Command Center" routes={commandCenterRoutes} collapsed={isCollapsed} onNavigate={onNavigate} />
        <Group title="Operations" routes={operationsRoutes} collapsed={isCollapsed} onNavigate={onNavigate} />
        <Group title="Governance" routes={controlRoutes} collapsed={isCollapsed} onNavigate={onNavigate} />
      </div>

      <div className={cn("mt-4 rounded-xl border border-white/12 bg-white/[0.035] p-3", isCollapsed && "p-2")}>
        <div className="flex items-center gap-2 text-xs font-medium text-neon">
          <LockKeyhole className="h-4 w-4" />
          <span className={cn(isCollapsed && "sr-only")}>Safety gates live</span>
        </div>
        <p className={cn("mt-2 text-[11px] leading-5 text-muted-foreground", isCollapsed && "sr-only")}>
          Paid tools, rendering, browser execution, and publishing stay blocked unless explicitly approved.
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
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-white/10 bg-[#090f16]/92 px-3 py-4 backdrop-blur-2xl transition-[width] duration-300 lg:flex",
        sidebarCollapsed ? "w-20" : "w-80",
      )}
    >
      <button
        type="button"
        onClick={toggleSidebar}
        className="absolute right-2 top-5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/12 bg-[#0d131b] text-muted-foreground transition hover:text-foreground"
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
      <SidebarContent collapsed={sidebarCollapsed} />
    </aside>
  );
}

