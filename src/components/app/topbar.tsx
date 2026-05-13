import Link from "next/link";
import { RadioTower, ShieldCheck, Sparkles } from "lucide-react";
import { CommandPalette } from "@/components/app/command-palette";
import { LogoutButton } from "@/components/app/logout-button";
import { MobileSidebarDrawer } from "@/components/app/mobile-sidebar-drawer";
import { NotificationCenter } from "@/components/app/notification-center";
import type { CurrentUser } from "@/lib/auth/current-user";
import { CommandSearchTrigger } from "@/components/app/command-search-trigger";

export function Topbar({ user }: { user: CurrentUser }) {
  const previewPublic = user.id === "preview-public-viewer";

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-background/72 px-3 py-3 backdrop-blur-2xl sm:px-5 lg:px-7 xl:px-8">
      <div className="mx-auto flex max-w-[1500px] items-center gap-3">
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon text-primary-foreground shadow-glow">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-semibold">Folqen</span>
        </Link>
        <MobileSidebarDrawer />
        <div className="hidden min-w-0 lg:block">
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-neon/90">Folqen command OS</div>
          <div className="mt-1 truncate text-xs text-muted-foreground">Autonomous creator organization / preview-safe operations</div>
        </div>
        <CommandSearchTrigger className="hidden md:flex" />
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-xl border border-neon/20 bg-neon/[0.065] px-3 py-2 text-xs text-neon shadow-[0_0_30px_rgba(182,255,59,.08)] sm:flex">
            {previewPublic ? <RadioTower className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            {previewPublic ? "Public preview" : "Safe mode"}
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <CommandPalette />
            <NotificationCenter />
          </div>
          <div className="hidden rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,.04)] sm:block">
            <span className="text-foreground">{user.email}</span>
            <span className="ml-2 font-mono text-[10px] uppercase text-neon">{previewPublic ? "VIEW ONLY" : user.role}</span>
          </div>
          {previewPublic ? null : <LogoutButton />}
        </div>
      </div>
    </header>
  );
}
