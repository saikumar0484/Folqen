import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="md:hidden border-b border-zinc-800 p-3 text-sm text-zinc-400">Navigation is available in desktop mode for now (mobile drawer placeholder).</div>
      <div className="grid min-h-screen md:grid-cols-[280px_1fr]">
        <div className="hidden md:block"><Sidebar /></div>
        <main>
          <Topbar title={title} />
          <section className="p-4 md:p-6">{children}</section>
        </main>
      </div>
    </div>
  );
}
