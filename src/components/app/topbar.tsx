import Link from "next/link";
import { Activity, RadioTower, ShieldCheck, Sparkles } from "lucide-react";
import { CommandPalette } from "@/components/app/command-palette";
import { LogoutButton } from "@/components/app/logout-button";
import { MobileSidebarDrawer } from "@/components/app/mobile-sidebar-drawer";
import { NotificationCenter } from "@/components/app/notification-center";
import { WorkspaceSwitcher } from "@/components/release/workspace-switcher";
import type { CurrentUser } from "@/lib/auth/current-user";

export function Topbar({ user }: { user: CurrentUser }) {
  const previewPublic = user.id === "preview-public-viewer";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090f16]/82 px-4 py-3 backdrop-blur-2xl sm:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto flex max-w-[1640px] min-w-0 items-center gap-2 lg:gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 lg:gap-3">
          <Link href="/" className="flex items-center gap-2.5 lg:hidden">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neon text-black">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-semibold tracking-[-0.02em]">Folqen</span>
          </Link>

          <MobileSidebarDrawer />

          <div className="hidden min-w-0 lg:block">
            <div className="truncate font-mono text-[10px] uppercase tracking-[0.24em] text-neon">Creator Workspace</div>
            <div className="mt-1 max-w-[16rem] truncate text-sm text-muted-foreground xl:max-w-[20rem] 2xl:max-w-[30rem]">
              Conversational guidance for research, scripts, thumbnails, and publish-ready draft packages
            </div>
          </div>
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          <WorkspaceSwitcher />

          <div className="hidden items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-xs 2xl:flex">
            {previewPublic ? <RadioTower className="h-4 w-4 text-neon" /> : <ShieldCheck className="h-4 w-4 text-neon" />}
            <span className="text-muted-foreground">{previewPublic ? "Preview mode" : "Guided mode"}</span>
          </div>

          <div className="hidden items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-xs text-muted-foreground 2xl:flex">
            <Activity className="h-3.5 w-3.5 text-neon" />
            Creator preview
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <CommandPalette />
            <NotificationCenter />
          </div>

          <div className="hidden rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-xs text-muted-foreground xl:block">
            <div className="max-w-[12rem] truncate text-sm font-medium text-foreground">{user.name ?? user.email}</div>
            <div className="mt-0.5 flex items-center gap-2 text-[11px]">
              <span className="truncate text-muted-foreground">{user.email}</span>
              <span className="font-mono uppercase tracking-[0.14em] text-neon">{previewPublic ? "Preview" : "Creator"}</span>
            </div>
          </div>

          <Link
            href="/settings"
            className="hidden rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-xs text-muted-foreground transition hover:bg-white/[0.08] hover:text-foreground xl:inline-flex"
          >
            Account
          </Link>

          {previewPublic ? null : <LogoutButton />}
        </div>
      </div>
    </header>
  );
}
