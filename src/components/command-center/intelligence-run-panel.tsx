"use client";

import { useMemo, useState } from "react";
import { Brain, Loader2, Play, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mutationFetch } from "@/lib/client/mutation-fetch";
import type { IntelligenceDepartmentId, IntelligenceRunResult, IntelligenceWorkflowKind } from "@/lib/intelligence/types";

type IntelligenceRunPanelProps = {
  departmentId: IntelligenceDepartmentId;
  title: string;
  description: string;
  workflows: Array<{
    kind: IntelligenceWorkflowKind;
    name: string;
    description: string;
  }>;
  agents: Array<{
    id: string;
    name: string;
    role: string;
    status: string;
  }>;
  recentRuns: Array<{
    id: string;
    workflowId: string;
    status: string;
    createdAt: string;
  }>;
};

type RunResponse = {
  ok: boolean;
  result?: IntelligenceRunResult;
  package?: {
    status: string;
    contentId?: string;
    message: string;
  };
  error?: string;
  message?: string;
};

const defaultObjective = {
  research: "Find safe India-relevant folklore and mystery opportunities for short-form content.",
  content: "Create a review-ready short-form mystery content package from the strongest topic seed.",
} satisfies Record<IntelligenceDepartmentId, string>;

function splitLines(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function IntelligenceRunPanel({ departmentId, title, description, workflows, agents, recentRuns }: IntelligenceRunPanelProps) {
  const [workflowKind, setWorkflowKind] = useState<IntelligenceWorkflowKind>(workflows[0]?.kind ?? "trend_discovery");
  const [objective, setObjective] = useState(defaultObjective[departmentId]);
  const [topics, setTopics] = useState(departmentId === "research" ? "haunted forts in India, cursed temple legend" : "haunted fort mystery");
  const [competitors, setCompetitors] = useState("");
  const [sources, setSources] = useState("");
  const [audienceNotes, setAudienceNotes] = useState("Viewers respond to cold-open questions, local context, and one clear reveal before the midpoint.");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<RunResponse | null>(null);

  const selectedWorkflow = useMemo(() => workflows.find((workflow) => workflow.kind === workflowKind), [workflowKind, workflows]);
  const endpoint = departmentId === "research" ? "/api/intelligence/research/run" : "/api/intelligence/content/run";

  async function runWorkflow(createPackage = false) {
    setPending(true);
    setResult(null);

    const response = await mutationFetch(createPackage ? "/api/intelligence/content/package" : endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        workflowKind,
        objective,
        seedTopics: splitLines(topics),
        competitors: splitLines(competitors),
        sourceReferences: splitLines(sources),
        audienceNotes: splitLines(audienceNotes),
        platforms: ["YOUTUBE", "INSTAGRAM", "FACEBOOK"],
        approvalRequired: true,
        providerId: "mock",
      }),
    });

    const payload = (await response.json().catch(() => ({ error: "Invalid response." }))) as RunResponse;
    setResult(payload);
    setPending(false);
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="premium">
              <Brain className="h-3.5 w-3.5" />
              Live intelligence controls
            </Badge>
            <Badge variant="info">Mock</Badge>
            <Badge variant="safe">No paid execution</Badge>
          </div>
          <CardTitle className="mt-3">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Workflow</span>
            <select
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-foreground outline-none focus:border-neon/60"
              value={workflowKind}
              onChange={(event) => setWorkflowKind(event.target.value as IntelligenceWorkflowKind)}
            >
              {workflows.map((workflow) => (
                <option key={workflow.kind} value={workflow.kind}>
                  {workflow.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Objective</span>
            <textarea className="min-h-24 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-foreground outline-none focus:border-neon/60" value={objective} onChange={(event) => setObjective(event.target.value)} />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Seed topics</span>
              <textarea className="min-h-20 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-foreground outline-none focus:border-neon/60" value={topics} onChange={(event) => setTopics(event.target.value)} />
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Competitors</span>
              <textarea className="min-h-20 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-foreground outline-none focus:border-neon/60" value={competitors} onChange={(event) => setCompetitors(event.target.value)} />
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Source references</span>
              <textarea className="min-h-20 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-foreground outline-none focus:border-neon/60" value={sources} onChange={(event) => setSources(event.target.value)} />
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Audience notes</span>
              <textarea className="min-h-20 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-foreground outline-none focus:border-neon/60" value={audienceNotes} onChange={(event) => setAudienceNotes(event.target.value)} />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => runWorkflow(false)} disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Run dry workflow
            </Button>
            {departmentId === "content" ? (
              <Button type="button" variant="secondary" onClick={() => runWorkflow(true)} disabled={pending}>
                <Sparkles className="h-4 w-4" />
                Create draft package
              </Button>
            ) : null}
          </div>

          <p className="text-xs leading-5 text-muted-foreground">
            {selectedWorkflow?.description} This control uses only manual inputs and the mock provider.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-neon" />
              <CardTitle>Department agents</CardTitle>
            </div>
            <CardDescription>Specialist agents are real typed definitions; execution is still mock-safe.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {agents.map((agent) => (
              <div key={agent.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{agent.name}</div>
                    <div className="mt-1 text-xs leading-5 text-muted-foreground">{agent.role}</div>
                  </div>
                  <Badge variant="info">{agent.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest run output</CardTitle>
            <CardDescription>Results are review-ready intelligence, not live automation.</CardDescription>
          </CardHeader>
          <CardContent>
            {result?.result ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={result.result.status === "blocked" ? "danger" : "warning"}>{result.result.status}</Badge>
                  <Badge variant="info">{result.result.providerStatus.status}</Badge>
                  <Badge variant="safe">{Math.round(result.result.confidence * 100)}% confidence</Badge>
                </div>
                <div className="space-y-2">
                  {result.result.rankedItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="rounded-xl border border-white/10 bg-black/25 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium">{item.title}</span>
                        <span className="font-mono text-xs text-neon">{item.score}</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.rationale}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs leading-5 text-muted-foreground">{result.package?.message ?? result.message}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {result?.error ? <p className="text-sm text-rose-200">{result.error}</p> : <p className="text-sm text-muted-foreground">Run a workflow to generate a ranked intelligence packet.</p>}
                {recentRuns.slice(0, 4).map((run) => (
                  <div key={run.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <span>{run.workflowId}</span>
                      <Badge variant="neutral">{run.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
