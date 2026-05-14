"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/components/app/toast-provider";
import { mutationFetch } from "@/lib/client/mutation-fetch";
import type { ProviderApprovalRequestType } from "@/lib/provider-approval-requests";

type ProviderApprovalAction = {
  requestType: ProviderApprovalRequestType;
  label: string;
};

const actions: ProviderApprovalAction[] = [
  { requestType: "google_drive_storage", label: "Request Drive access" },
  { requestType: "openai_paid_agent", label: "Request AI access" },
  { requestType: "n8n_workflow_access", label: "Request automation access" },
  { requestType: "media_worker", label: "Request media access" },
];

export function ProviderApprovalActions() {
  const router = useRouter();
  const { toast } = useToast();
  const [message, setMessage] = useState<string | null>(null);
  const [pendingType, setPendingType] = useState<ProviderApprovalRequestType | null>(null);
  const [isPending, startTransition] = useTransition();

  function requestApproval(requestType: ProviderApprovalRequestType) {
    setMessage(null);
    setPendingType(requestType);

    startTransition(async () => {
      const response = await mutationFetch("/api/provider-approvals/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestType }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string; duplicate?: boolean };

      if (!response.ok) {
        setMessage(body.error ?? "We couldn't submit this request right now.");
        toast({ title: "Request not sent", description: body.error ?? "We couldn't submit this request right now.", tone: "error" });
        setPendingType(null);
        return;
      }

      setMessage(body.duplicate ? "A request is already waiting for review." : "Your access request was sent.");
      toast({
        title: body.duplicate ? "Already in review" : "Request sent",
        description: "We’ll notify you when this access is approved.",
        tone: "success",
      });
      setPendingType(null);
      router.refresh();
    });
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Connected tools</div>
          <h2 className="mt-1 font-display text-xl font-semibold">Request access when you are ready</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Requests are reviewed before new tools are activated for your workspace.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-4">
        {actions.map((action) => (
          <button
            key={action.requestType}
            type="button"
            onClick={() => requestApproval(action.requestType)}
            disabled={isPending}
            className="rounded-xl border border-neon/20 bg-neon/[0.08] px-3 py-2 text-sm font-medium text-neon transition hover:bg-neon/[0.14] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendingType === action.requestType ? "Requesting..." : action.label}
          </button>
        ))}
      </div>

      {message ? <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-muted-foreground">{message}</div> : null}
    </div>
  );
}
