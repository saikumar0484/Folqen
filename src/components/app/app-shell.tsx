import type { ReactNode } from "react";
import { MiniAgentChat } from "@/components/app/mini-agent-chat";
import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import type { CurrentUser } from "@/lib/auth/current-user";

export function AppShell({ children, user }: { children: ReactNode; user: CurrentUser }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid-bg pointer-events-none fixed inset-0 -z-10" />
      <div
        className="pointer-events-none fixed left-1/2 top-[-220px] -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background: "radial-gradient(ellipse at center, color-mix(in oklab, var(--neon) 18%, transparent), transparent 70%)",
        }}
      />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar user={user} />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
      <MiniAgentChat />
    </div>
  );
}
