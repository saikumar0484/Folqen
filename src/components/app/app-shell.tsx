import type { ReactNode } from "react";
import { MiniAgentChat } from "@/components/app/mini-agent-chat";
import { PasswordChangeBanner } from "@/components/app/password-change-banner";
import { Sidebar } from "@/components/app/sidebar";
import { ToastProvider } from "@/components/app/toast-provider";
import { Topbar } from "@/components/app/topbar";
import type { CurrentUser } from "@/lib/auth/current-user";

export function AppShell({ children, user }: { children: ReactNode; user: CurrentUser }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-neon/35 selection:text-primary-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(45%_35%_at_12%_0%,rgba(118,243,162,.14),transparent_70%),radial-gradient(50%_40%_at_90%_10%,rgba(94,203,255,.12),transparent_70%)]" />
      <ToastProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar user={user} />
            <PasswordChangeBanner user={user} />
            <main className="mx-auto w-full max-w-[1640px] flex-1 px-4 py-5 pb-28 sm:px-6 sm:py-6 sm:pb-24 lg:px-8 xl:px-10">{children}</main>
          </div>
        </div>
        <MiniAgentChat />
      </ToastProvider>
    </div>
  );
}
