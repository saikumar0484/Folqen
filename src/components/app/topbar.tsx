import Link from "next/link";
import { Activity, RadioTower, ShieldCheck, Sparkles } from "lucide-react";
import { CommandPalette } from "@/components/app/command-palette";
import { CommandSearchTrigger } from "@/components/app/command-search-trigger";
import { LogoutButton } from "@/components/app/logout-button";
import { MobileSidebarDrawer } from "@/components/app/mobile-sidebar-drawer";
import { NotificationCenter } from "@/components/app/notification-center";
import { WorkspaceSwitcher } from "@/components/release/workspace-switcher";
import type { CurrentUser } from "@/lib/auth/current-user";

export function Topbar({ user }: { user: CurrentUser }) {
  const previewPublic = user.id === "preview-public-viewer";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090f16]/82 px-4 py-3 backdrop-blur-2xl sm:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto flex max-w-[1640px] items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 lg:hidden">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neon text-black">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-semibold tracking-[-0.02em]">Folqen</span>
        </Link>

        <MobileSidebarDrawer />

        <div className="hidden min-w-0 lg:block">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-neon">Creator Command Center</div>
          <div className="mt-1 truncate text-sm text-muted-foreground">Conversational AI workforce for research, scripts, thumbnails, and draft packaging</div>
        </div>

        <CommandSearchTrigger className="hidden md:flex" />

        <div className="ml-auto flex items-center gap-2">
          <WorkspaceSwitcher />

          <div className="hidden items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-xs sm:flex">
            {previewPublic ? <RadioTower className="h-4 w-4 text-neon" /> : <ShieldCheck className="h-4 w-4 text-neon" />}
            <span className="text-muted-foreground">{previewPublic ? "Public preview mode" : "Governed runtime"}</span>
          </div>

          <div className="hidden items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-xs text-muted-foreground lg:flex">
            <Activity className="h-3.5 w-3.5 text-neon" />
            Dry-run safe
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <CommandPalette />
            <NotificationCenter />
          </div>

          <div className="hidden rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-xs text-muted-foreground xl:block">
            <span className="text-foreground">{user.email}</span>
            <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.18em] text-neon">{previewPublic ? "Viewer" : user.role}</span>
          </div>

          {previewPublic ? null : <LogoutButton />}
        </div>
      </div>
    </header>
  );
}
