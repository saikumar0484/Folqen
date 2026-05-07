"use client";
import { Bell, Command, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/70 p-4 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-wider text-zinc-500">AI Creator Command Center</p>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm"><Command className="mr-2 h-4 w-4" />Command</Button>
        <Button variant="outline" size="icon"><Bell className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon"><Moon className="h-4 w-4" /></Button>
      </div>
    </header>
  );
}
