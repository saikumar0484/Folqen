"use client";

import { useMemo, useState, useTransition } from "react";
import { AlertCircle, Compass, Loader2, MessageSquareText, PlayCircle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { mutationFetch } from "@/lib/client/mutation-fetch";
import { FirstRunResultExperience } from "@/components/release/first-run-result-experience";
import type { FirstRunResponse } from "@/components/release/types";

const starterPrompts = [
  "Create a horror storytelling shorts channel.",
  "Build a mystery folklore shorts system for YouTube.",
  "Generate my first urban legends research-to-script workflow.",
];

const recommendationRail = [
  "Tune audience tone before running script generation.",
  "Use one focused objective to keep hooks sharper.",
  "Keep thumbnail prompts explicit about title space and contrast.",
];

export function CreatorMissionControl({ defaultObjective }: { defaultObjective?: string }) {
  const [objective, setObjective] = useState(defaultObjective || "Create a horror storytelling shorts channel.");
  const [result, setResult] = useState<FirstRunResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const missionSummary = useMemo(() => {
    if (result) return "First workflow completed. Review drafts, refine thumbnail, and prepare YouTube package.";
    return "No first-run output yet. Start with one clear objective and Folqen will guide your Research -> Script -> Thumbnail -> Draft flow.";
  }, [result]);

  function runFirstWorkflow() {
    setError(null);
    startTransition(async () => {
      const response = await mutationFetch("/api/beta/workflows/first-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective,
          platformTarget: "YOUTUBE",
        }),
      });
      const body = (await response.json().catch(() => ({}))) as FirstRunResponse & { error?: string };
      if (!response.ok || !body?.ok) {
        setError(body.error ?? "Unable to run the first workflow.");
        return;
      }
      setResult(body);
    });
  }

  return (
    <section className="section-space mb-7">
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="panel">
          <CardHeader>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MessageSquareText className="h-4 w-4 text-neon" />
              Conversational Command Dock
            </div>
            <CardDescription>Tell Folqen what you want to build and launch your first creator workflow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Creator Objective</span>
              <textarea
                rows={3}
                value={objective}
                onChange={(event) => setObjective(event.target.value)}
                className="w-full rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2.5 text-sm outline-none transition focus:border-neon/60"
                placeholder="Create a horror shorts AI business"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setObjective(prompt)}
                  className="rounded-lg border border-white/12 bg-white/[0.03] px-2.5 py-1.5 text-xs text-muted-foreground transition hover:bg-white/[0.08] hover:text-foreground"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={isPending || objective.trim().length < 8} onClick={runFirstWorkflow}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                Run First Workflow
              </Button>
              <Button type="button" variant="secondary" disabled>
                <Sparkles className="h-4 w-4" />
                Guided mode active
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

        <Card className="panel-soft">
          <CardHeader>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Compass className="h-4 w-4 text-neon" />
              Creator Mission
            </div>
            <CardDescription>AI-native guidance focused on launch clarity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-muted-foreground">{missionSummary}</div>
            <div className="space-y-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Suggested next moves</div>
              {recommendationRail.map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-muted-foreground">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {result ? (
        <FirstRunResultExperience objective={objective} result={result} onRetry={runFirstWorkflow} retrying={isPending} />
      ) : (
        <Card className="panel-soft">
          <CardContent className="py-10 text-center">
            <h3 className="font-display text-xl font-semibold tracking-[-0.02em]">Your first workflow story will appear here</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
              Folqen will generate a complete creator package with research insight, script drafts, thumbnail strategy, and a YouTube draft package.
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

