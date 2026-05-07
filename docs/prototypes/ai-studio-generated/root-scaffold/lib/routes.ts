import { Activity, AlertTriangle, BarChart3, Bell, Bot, CalendarDays, Database, FileStack, FolderKanban, Gem, Home, Layers, Settings2, ShieldCheck, Sparkles, Wallet, Workflow } from "lucide-react";

export const appRoutes = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/agent", label: "Agent", icon: Bot },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/pipeline", label: "Pipeline", icon: Workflow },
  { href: "/library", label: "Library", icon: FolderKanban },
  { href: "/approvals", label: "Approvals", icon: ShieldCheck },
  { href: "/platforms", label: "Platforms", icon: Layers },
  { href: "/tools", label: "Tools", icon: Database },
  { href: "/settings", label: "Settings", icon: Settings2 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/monetization", label: "Monetization", icon: Wallet },
  { href: "/brand", label: "Brand", icon: Sparkles },
  { href: "/errors", label: "Errors", icon: AlertTriangle },
  { href: "/audit", label: "Audit", icon: Activity },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/files", label: "Files", icon: FileStack },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/upgrades", label: "Upgrades", icon: Gem },
] as const;
