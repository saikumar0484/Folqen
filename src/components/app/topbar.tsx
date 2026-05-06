import Link from "next/link";
import { Menu, Search, ShieldCheck, Sparkles } from "lucide-react";
import { CommandPalette } from "@/components/app/command-palette";
import { LogoutButton } from "@/components/app/logout-button";
import { NotificationCenter } from "@/components/app/notification-center";
import type { CurrentUser } from "@/lib/auth/current-user";

export function Topbar({ user }: { user: CurrentUser }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-background/75 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon text-primary-foreground shadow-glow">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-semibold">Folqen</span>
        </Link>
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-muted-foreground lg:hidden">
          <Menu className="h-4 w-4" />
        </button>
        <div className="hidden min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 md:flex">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="truncate text-sm text-muted-foreground">Search drafts, approvals, tools, files, workflows...</span>
          <span className="ml-auto rounded-md border border-white/10 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">Ctrl K</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-xl border border-neon/20 bg-neon/[0.06] px-3 py-2 text-xs text-neon sm:flex">
            <ShieldCheck className="h-4 w-4" />
            Safe mode
          </div>
          <CommandPalette />
          <NotificationCenter />
          <div className="hidden rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-muted-foreground sm:block">
            <span className="text-foreground">{user.email}</span>
            <span className="ml-2 font-mono text-[10px] uppercase text-neon">{user.role}</span>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
