"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/components/app/toast-provider";

export function ApprovalActions({ approvalId, disabled, canReview, roleMessage }: { approvalId: string; disabled: boolean; canReview: boolean; roleMessage?: string | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function decide(decision: "approve" | "reject") {
    setError(null);
    startTransition(async () => {
      const response = await fetch(`/api/approvals/${approvalId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(body.error ?? "Approval update failed.");
        toast({ title: "Approval update failed", description: body.error ?? "Approval update failed.", tone: "error" });
        return;
      }

      toast({
        title: decision === "approve" ? "Approval recorded" : "Rejection recorded",
        description: "This decision does not publish content or execute paid tools.",
        tone: "success",
      });
      router.refresh();
    });
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={disabled || isPending || !canReview}
        onClick={() => decide("approve")}
        className="rounded-xl bg-neon px-3 py-2 text-xs font-medium text-primary-foreground shadow-glow disabled:opacity-50"
      >
        Approve
      </button>
      <button
        type="button"
        disabled={disabled || isPending || !canReview}
        onClick={() => decide("reject")}
        className="rounded-xl border border-rose-300/25 bg-rose-400/10 px-3 py-2 text-xs font-medium text-rose-100 disabled:opacity-50"
      >
        Reject
      </button>
      {!canReview && roleMessage ? <span className="text-xs text-muted-foreground">{roleMessage}</span> : null}
      {error ? <span className="text-xs text-rose-200">{error}</span> : null}
    </div>
  );
}
