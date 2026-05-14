"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { mutationFetch } from "@/lib/client/mutation-fetch";

type WorkspaceItem = {
  id: string;
  name: string;
  nicheTemplateId: string;
};

type WorkspaceOverviewResponse = {
  ok: boolean;
  workspaces: WorkspaceItem[];
  activeWorkspace: WorkspaceItem | null;
  canOperate: boolean;
};

export function WorkspaceSwitcher() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("");
  const [canOperate, setCanOperate] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const response = await fetch("/api/workspaces", { cache: "no-store" });
      const body = (await response.json().catch(() => null)) as WorkspaceOverviewResponse | { error?: string } | null;
      if (cancelled) return;

      if (!response.ok || !body || !("ok" in body)) {
        setError((body && "error" in body && body.error) || "Unable to load workspaces.");
        setLoading(false);
        return;
      }

      setWorkspaces(body.workspaces);
      setActiveWorkspaceId(body.activeWorkspace?.id ?? body.workspaces[0]?.id ?? "");
      setCanOperate(body.canOperate);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeWorkspace = useMemo(() => workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? null, [workspaces, activeWorkspaceId]);

  function switchWorkspace(nextWorkspaceId: string) {
    if (!nextWorkspaceId || nextWorkspaceId === activeWorkspaceId) return;
    startTransition(async () => {
      const response = await mutationFetch("/api/workspaces/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: nextWorkspaceId }),
      });

      if (!response.ok) {
        return;
      }

      setActiveWorkspaceId(nextWorkspaceId);
      router.refresh();
    });
  }

  if (loading) {
    return (
      <div className="hidden items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-xs text-muted-foreground lg:flex">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-neon" />
        Loading workspace
      </div>
    );
  }

  if (error) {
    return (
      <Link
        href="/onboarding"
        className="hidden items-center gap-2 rounded-xl border border-amber-300/30 bg-amber-300/[0.09] px-3 py-2 text-xs text-amber-100 transition hover:bg-amber-300/[0.14] lg:flex"
      >
        Setup workspace
      </Link>
    );
  }

  if (workspaces.length === 0) {
    if (!canOperate) {
      return (
        <div className="hidden items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-xs text-muted-foreground lg:flex">
          Workspace view only
        </div>
      );
    }

    return (
      <Link href="/onboarding" className="hidden items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-xs text-muted-foreground transition hover:bg-white/[0.08] lg:flex">
        Create workspace
      </Link>
    );
  }

  return (
    <div className="hidden items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 lg:flex">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Workspace</span>
      <select
        className="min-w-[180px] bg-transparent text-xs text-foreground outline-none"
        value={activeWorkspaceId}
        disabled={pending || !canOperate}
        onChange={(event) => switchWorkspace(event.target.value)}
      >
        {workspaces.map((workspace) => (
          <option key={workspace.id} value={workspace.id} className="bg-[#0b1118]">
            {workspace.name}
          </option>
        ))}
      </select>
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin text-neon" /> : null}
      {activeWorkspace ? (
        <span className="rounded-md border border-white/12 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-neon">{activeWorkspace.nicheTemplateId}</span>
      ) : null}
    </div>
  );
}
