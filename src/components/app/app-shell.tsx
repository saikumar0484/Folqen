import type { ReactNode } from "react";
import { MiniAgentChat } from "@/components/app/mini-agent-chat";
import { Sidebar } from "@/components/app/sidebar";
import { ToastProvider } from "@/components/app/toast-provider";
import { Topbar } from "@/components/app/topbar";
import type { CurrentUser } from "@/lib/auth/current-user";

export function AppShell({ children, user }: { children: ReactNode; user: CurrentUser }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-neon/40 selection:text-primary-foreground">
      <div
        className="pointer-events-none fixed left-1/2 top-[-260px] -z-10 h-[620px] w-[980px] -translate-x-1/2 rounded-full opacity-80 blur-3xl"
        style={{
          background: "radial-gradient(ellipse at center, rgba(143,255,0,.18), rgba(27,214,162,.08) 38%, transparent 72%)",
        }}
      />
      <div className="pointer-events-none fixed right-[-220px] top-1/4 -z-10 h-[520px] w-[520px] rounded-full bg-neon/[0.055] blur-3xl" />
      <ToastProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar user={user} />
            <main className="mx-auto w-full max-w-[1500px] flex-1 overflow-x-hidden px-3 py-4 sm:px-5 lg:px-7 xl:px-8">{children}</main>
          </div>
        </div>
        <MiniAgentChat />
      </ToastProvider>
    </div>
  );
}
