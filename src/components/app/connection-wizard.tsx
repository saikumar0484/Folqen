"use client";

import { useState, useTransition } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/app/toast-provider";
import { StatusBadge } from "@/components/ui/status-badge";
import { mutationFetch } from "@/lib/client/mutation-fetch";
import { connectionDefinitions, type ConnectionProviderId } from "@/lib/connections/definitions";

export function ConnectionWizard() {
  const { toast } = useToast();
  const [provider, setProvider] = useState<ConnectionProviderId>("google_drive");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const definition = connectionDefinitions.find((item) => item.id === provider) ?? connectionDefinitions[0];

  return (
    <section className="rounded-3xl border border-neon/20 bg-neon/[0.06] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-neon/20 bg-neon/[0.08] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-neon">
            <KeyRound className="h-3.5 w-3.5" />
            Connection wizard
          </div>
          <h2 className="mt-3 font-display text-2xl font-semibold">Connect Folqen to your accounts</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Choose a provider, enter the details Folqen asks for, and Folqen stores sensitive values encrypted. Social accounts use setup metadata now and official OAuth later. Never enter social media passwords.
          </p>
        </div>
        <StatusBadge tone="warning">Approval gated</StatusBadge>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[320px_1fr]">
        <div className="grid gap-2">
          {connectionDefinitions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setProvider(item.id);
                setError(null);
                setMessage(null);
              }}
              className={`rounded-2xl border p-3 text-left transition ${
                item.id === provider ? "border-neon/40 bg-neon/10 text-foreground" : "border-white/10 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06]"
              }`}
            >
              <div className="text-sm font-medium">{item.label}</div>
              <div className="mt-1 text-xs leading-5">{item.description}</div>
            </button>
          ))}
        </div>

        <form
          className="rounded-3xl border border-white/10 bg-black/20 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            const values = Object.fromEntries(definition.fields.map((field) => [field.name, String(data.get(field.name) ?? "")]));

            setError(null);
            setMessage(null);

            startTransition(async () => {
              const response = await mutationFetch("/api/connections/intake", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider: definition.id, values }),
              });
              const body = (await response.json().catch(() => ({}))) as { error?: string; message?: string };

              if (!response.ok) {
                setError(body.error ?? "Connection details could not be saved.");
                toast({ title: "Connection setup blocked", description: body.error ?? "Connection details could not be saved.", tone: "error" });
                return;
              }

              form.reset();
              setMessage(body.message ?? "Connection details saved encrypted.");
              toast({
                title: "Connection details saved",
                description: "Test the provider before enabling real automation.",
                tone: "success",
              });
            });
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-semibold">{definition.label}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{definition.permissionNote}</p>
            </div>
            <StatusBadge tone="premium">Encrypted save</StatusBadge>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {definition.fields.map((field) => (
              <label key={field.name} className="space-y-1.5">
                <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  {field.label}
                  {field.secret ? <StatusBadge tone="warning">secret</StatusBadge> : null}
                </span>
                <input
                  name={field.name}
                  type={field.type}
                  required={field.required}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-neon/40"
                  autoComplete="off"
                />
              </label>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={isPending} className="rounded-xl bg-neon px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow disabled:opacity-60">
              {isPending ? "Saving..." : "Save connection details"}
            </button>
            <div className="flex items-center gap-2 text-xs leading-5 text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-neon" />
              Saving does not publish, spend credits, or run workflows.
            </div>
          </div>

          {message ? <div className="mt-4 rounded-xl border border-neon/20 bg-neon/10 p-3 text-sm text-neon">{message}</div> : null}
          {error ? <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</div> : null}
        </form>
      </div>
    </section>
  );
}
