"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/components/app/toast-provider";
import type { ProviderApprovalRequestType } from "@/lib/provider-approval-requests";

type ProviderApprovalAction = {
  requestType: ProviderApprovalRequestType;
  label: string;
};

const actions: ProviderApprovalAction[] = [
  { requestType: "google_drive_storage", label: "Request Drive approval" },
  { requestType: "openai_paid_agent", label: "Request OpenAI approval" },
  { requestType: "n8n_workflow_access", label: "Request n8n approval" },
  { requestType: "media_worker", label: "Request media approval" },
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
      const response = await fetch("/api/provider-approvals/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestType }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string; duplicate?: boolean };

      if (!response.ok) {
        setMessage(body.error ?? "Approval request failed.");
        toast({ title: "Approval request blocked", description: body.error ?? "Approval request failed.", tone: "error" });
        setPendingType(null);
        return;
      }

      setMessage(body.duplicate ? "A pending approval already exists." : "Approval request created.");
      toast({
        title: body.duplicate ? "Approval already pending" : "Approval request created",
        description: "No secrets were stored and no provider was connected.",
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
          <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Approval-first setup</div>
          <h2 className="mt-1 font-display text-xl font-semibold">Request provider approvals</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            These buttons create approval records only. They do not save secrets, call OpenAI, run n8n, render media, upload files, or publish content.
          </p>
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
