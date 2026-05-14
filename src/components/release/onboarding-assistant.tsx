"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { mutationFetch } from "@/lib/client/mutation-fetch";
import type { OnboardingConversationResult, OnboardingDraft } from "@/lib/public-release/types";

type OnboardingConversationResponse = {
  ok: boolean;
  result: OnboardingConversationResult;
};

type CreateWorkspaceResponse = {
  ok: boolean;
  workspace: {
    id: string;
    name: string;
  };
};

const defaultObjective = "I want to grow a horror storytelling shorts channel.";
const platforms = ["YOUTUBE", "INSTAGRAM", "FACEBOOK", "SNAPCHAT", "THREADS"] as const;
const steps = ["Workspace", "Audience", "Workforce", "Preview"] as const;
const ONBOARDING_MEMORY_KEY = "folqen:onboarding-memory:v1";

export function OnboardingAssistant({ initialDraft }: { initialDraft: OnboardingDraft }) {
  const router = useRouter();
  const [draft, setDraft] = useState<OnboardingDraft>(() => {
    if (typeof window === "undefined") return initialDraft;
    try {
      const raw = localStorage.getItem(ONBOARDING_MEMORY_KEY);
      if (!raw) return initialDraft;
      const parsed = JSON.parse(raw) as { draft?: OnboardingDraft };
      return parsed.draft ? { ...initialDraft, ...parsed.draft } : initialDraft;
    } catch {
      return initialDraft;
    }
  });
  const [step, setStep] = useState(() => {
    if (typeof window === "undefined") return 0;
    try {
      const raw = localStorage.getItem(ONBOARDING_MEMORY_KEY);
      if (!raw) return 0;
      const parsed = JSON.parse(raw) as { step?: number };
      return typeof parsed.step === "number" && parsed.step >= 0 && parsed.step <= 3 ? parsed.step : 0;
    } catch {
      return 0;
    }
  });
  const [conversation, setConversation] = useState<OnboardingConversationResult | null>(null);
  const [busyStage, setBusyStage] = useState<"idle" | "planning" | "creating">("idle");
  const [error, setError] = useState<string | null>(null);

  const canCreateWorkspace = useMemo(
    () => draft.objective.trim().length >= 8 && draft.workspaceName.trim().length >= 2 && draft.targetPlatforms.length > 0,
    [draft],
  );

  useEffect(() => {
    try {
      localStorage.setItem(ONBOARDING_MEMORY_KEY, JSON.stringify({ draft, step }));
    } catch {
      // Ignore storage write errors.
    }
  }, [draft, step]);

  async function buildPlan() {
    if (!canCreateWorkspace) return;
    setBusyStage("planning");
    setError(null);

    const response = await mutationFetch("/api/onboarding/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: draft.objective,
        draft,
      }),
    });

    const body = (await response.json().catch(() => null)) as OnboardingConversationResponse | { error?: string } | null;
    if (!response.ok || !body || !("ok" in body)) {
      setError((body && "error" in body && body.error) || "Unable to generate onboarding plan.");
      setBusyStage("idle");
      return;
    }

    setConversation(body.result);
    setDraft(body.result.draft);
    setBusyStage("idle");
  }

  async function createWorkspace() {
    const plan = conversation;
    if (!plan) return;

    setBusyStage("creating");
    setError(null);
    const response = await mutationFetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objective: draft.objective,
        draft: plan.draft,
      }),
    });

    const body = (await response.json().catch(() => null)) as CreateWorkspaceResponse | { error?: string } | null;
    if (!response.ok || !body || !("ok" in body)) {
      setError((body && "error" in body && body.error) || "Workspace creation failed.");
      setBusyStage("idle");
      return;
    }

    router.push("/dashboard");
    router.refresh();
    try {
      localStorage.removeItem(ONBOARDING_MEMORY_KEY);
    } catch {
      // Ignore storage cleanup errors.
    }
  }

  return (
    <div className="section-space pb-12">
      <Card className="panel">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-neon text-black">
              <Sparkles className="h-4.5 w-4.5" />
            </span>
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-[-0.03em]">Creator Onboarding</h1>
              <CardDescription>Tell Folqen what you want to build. We will draft your first workspace, AI workforce, and workflow system.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-4">
            {steps.map((label, index) => (
              <div key={label} className="rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2.5">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Step {index + 1}
                </div>
                <div className={`mt-1 text-sm font-semibold ${index === step ? "text-neon" : "text-foreground"}`}>{label}</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-white/12 bg-white/[0.03] p-3 text-xs text-muted-foreground">
            Conversation memory active: your onboarding answers and step progress are saved on this device so you can resume setup if interrupted.
          </div>

          {step === 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Primary Goal</span>
                <textarea
                  value={draft.objective}
                  onChange={(event) => setDraft((prev) => ({ ...prev, objective: event.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2.5 text-sm outline-none transition focus:border-neon/60"
                  placeholder={defaultObjective}
                />
              </label>
              <label className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Workspace Name</span>
                <input
                  value={draft.workspaceName}
                  onChange={(event) => setDraft((prev) => ({ ...prev, workspaceName: event.target.value }))}
                  className="w-full rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2 text-sm outline-none transition focus:border-neon/60"
                  placeholder="Horror Shorts Workspace"
                />
              </label>
              <label className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Posting cadence</span>
                <input
                  value={draft.postingCadence}
                  onChange={(event) => setDraft((prev) => ({ ...prev, postingCadence: event.target.value }))}
                  className="w-full rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2 text-sm outline-none transition focus:border-neon/60"
                  placeholder="5 shorts per week"
                />
              </label>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Audience focus</span>
                <textarea
                  value={draft.audienceFocus}
                  onChange={(event) => setDraft((prev) => ({ ...prev, audienceFocus: event.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2.5 text-sm outline-none transition focus:border-neon/60"
                />
              </label>
              <label className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Tone and style</span>
                <textarea
                  value={draft.tone}
                  onChange={(event) => setDraft((prev) => ({ ...prev, tone: event.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2.5 text-sm outline-none transition focus:border-neon/60"
                />
              </label>
              <div className="space-y-2 md:col-span-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Platform targets</span>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((platform) => {
                    const selected = draft.targetPlatforms.includes(platform);
                    return (
                      <button
                        key={platform}
                        type="button"
                        className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                          selected ? "border-neon/60 bg-neon/10 text-neon" : "border-white/12 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.08]"
                        }`}
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            targetPlatforms: selected ? prev.targetPlatforms.filter((item) => item !== platform) : [...prev.targetPlatforms, platform],
                          }))
                        }
                      >
                        {platform}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Operational profile</span>
                <select
                  value={draft.operationalProfile}
                  onChange={(event) => setDraft((prev) => ({ ...prev, operationalProfile: event.target.value as OnboardingDraft["operationalProfile"] }))}
                  className="w-full rounded-xl border border-white/12 bg-surface px-3 py-2 text-sm outline-none transition focus:border-neon/60"
                >
                  <option value="guided">Guided</option>
                  <option value="balanced">Balanced</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </label>
              <div className="rounded-xl border border-white/12 bg-white/[0.03] p-3 text-xs text-muted-foreground">
                Folqen will configure a creator-focused AI workforce preset for research, script, thumbnail, and metadata workflows.
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="rounded-xl border border-white/12 bg-white/[0.03] p-4 text-sm text-muted-foreground">
              <p className="leading-7">
                Final preview: Folqen will create a workspace, load the niche template, configure guided workflows, and prepare your first Research → Script → Thumbnail →
                YouTube draft run in draft-only mode.
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" disabled={step === 0 || busyStage !== "idle"} onClick={() => setStep((prev) => Math.max(0, prev - 1))}>
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button type="button" variant="secondary" disabled={step >= 3 || busyStage !== "idle"} onClick={() => setStep((prev) => Math.min(3, prev + 1))}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={!canCreateWorkspace || busyStage !== "idle"} onClick={buildPlan}>
              {busyStage === "planning" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate Setup Plan
            </Button>
            <Button type="button" variant="secondary" disabled={!conversation || busyStage !== "idle"} onClick={createWorkspace}>
              {busyStage === "creating" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Create Workspace
            </Button>
          </div>

          {error ? (
            <div className="inline-flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {conversation ? (
        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="panel xl:col-span-2">
            <CardHeader>
              <h2 className="text-lg font-semibold">Conversational Setup Summary</h2>
              <CardDescription>{conversation.assistantMessage}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Follow-up questions</div>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  {conversation.followUps.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Recommended Workflows</div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {conversation.recommendedWorkflows.map((workflow) => (
                    <div key={workflow.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="text-sm font-semibold">{workflow.name}</div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{workflow.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="panel-soft">
            <CardHeader>
              <h3 className="text-base font-semibold">AI Workforce</h3>
              <CardDescription>{conversation.recommendedTemplate.label}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {conversation.recommendedWorkforce.map((agent) => (
                <div key={agent.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-sm font-semibold">{agent.title}</div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{agent.focus}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="panel-soft">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Generate your onboarding plan to preview workflow templates, workforce setup, and strategy recommendations.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
