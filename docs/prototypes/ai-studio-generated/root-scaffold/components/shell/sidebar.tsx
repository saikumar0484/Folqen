"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { appRoutes } from "@/lib/routes";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-full border-r border-zinc-800 bg-zinc-950/80 p-4 md:w-72">
      <h1 className="mb-5 text-xl font-semibold">Folqen</h1>
      <nav className="space-y-1">
        {appRoutes.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return <Link key={href} href={href} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900"}`}><Icon className="h-4 w-4" />{label}</Link>;
        })}
      </nav>
    </aside>
  );
}
