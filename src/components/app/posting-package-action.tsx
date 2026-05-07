"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { PlatformName } from "@prisma/client";
import { useToast } from "@/components/app/toast-provider";
import { mutationFetch } from "@/lib/client/mutation-fetch";

type PostingPackageActionProps = {
  contentId: string;
  platform?: PlatformName;
};

export function PostingPackageAction({ contentId, platform }: PostingPackageActionProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function createPackage() {
    if (!platform) return;
    setMessage(null);
    startTransition(async () => {
      const response = await mutationFetch("/api/posting-packages/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, platform }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string; postingPackage?: { platformLabel?: string } };

      if (!response.ok) {
        setMessage(body.error ?? "Could not create package.");
        toast({ title: "Package blocked", description: body.error ?? "Could not create package.", tone: "error" });
        return;
      }

      setMessage(`Manual ${body.postingPackage?.platformLabel ?? platform} package created.`);
      toast({
        title: "Manual package created",
        description: "No platform upload or public publishing happened.",
        tone: "success",
      });
      router.refresh();
    });
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={!platform || isPending}
        onClick={createPackage}
        className="rounded-xl border border-neon/30 bg-neon/10 px-3 py-2 text-xs font-medium text-neon transition hover:bg-neon/15 disabled:opacity-50"
      >
        Create manual package
      </button>
      {message ? <span className="text-xs text-muted-foreground">{message}</span> : null}
    </div>
  );
}
