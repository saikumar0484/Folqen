"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { BrainCircuit, FlaskConical, GitCompareArrows, Search, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mutationFetch } from "@/lib/client/mutation-fetch";
import type { MemoryDashboard, MemoryEntryView, ReflectionResult } from "@/lib/memory/types";
import { cn } from "@/lib/utils";

type MemoryIntelligencePanelProps = {
  dashboard: MemoryDashboard;
};

type ClientResult = {
  title: string;
  body: string;
  status: "Mock" | "Needs approval" | "Blocked" | "Configured";
};

const categories = ["strategic", "workflow", "prompt", "analytics", "organizational"] as const;
type CategoryOption = (typeof categories)[number];

function statusClass(status: string) {
  if (status === "Blocked") return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  if (status === "Needs approval") return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  if (status === "Configured") return "border-neon/25 bg-neon/10 text-neon";
  return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{children}</label>;
}

export function MemoryIntelligencePanel({ dashboard }: MemoryIntelligencePanelProps) {
  const [query, setQuery] = useState("haunted fort hook retention workflow failures");
  const [category, setCategory] = useState<CategoryOption>("strategic");
  const [title, setTitle] = useState("Hook experiment learning");
  const [summary, setSummary] = useState("Cold-open questions are being treated as a stronger Shorts hook pattern.");
  const [content, setContent] = useState("When the script opens with a direct question, the first reveal can land earlier and the viewer has a clearer mystery to resolve.");
  const [reflectionObjective, setReflectionObjective] = useState("Review recent folklore content operations and propose safer retention improvements.");
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<ClientResult | null>(null);
  const [searchResults, setSearchResults] = useState<MemoryEntryView[]>(dashboard.recentMemories);
  const [reflections, setReflections] = useState<ReflectionResult[]>(dashboard.recentReflections);

  const categorySummary = useMemo(() => dashboard.categories.map((item) => `${item.label}: ${item.count}`).join(" / "), [dashboard.categories]);

  async function runSearch() {
    setLoading("search");
    setResult(null);
    const response = await fetch(`/api/memory/search?q=${encodeURIComponent(query)}&limit=6`, { cache: "no-store" });
    const payload = await response.json();
    setLoading(null);

    if (!response.ok) {
      setResult({ title: "Search blocked", body: payload.error ?? "Memory search failed.", status: "Blocked" });
      return;
    }

    setSearchResults(payload.result.items);
    setResult({ title: "Mock semantic search completed", body: payload.result.message, status: "Mock" });
  }

  async function ingest() {
    setLoading("ingest");
    setResult(null);
    const response = await mutationFetch("/api/memory/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        title,
        summary,
        content,
        tags: ["folklore", "hook", "retention"],
        sourceType: "manual_operator_note",
      }),
    });
    const payload = await response.json();
    setLoading(null);

    if (!response.ok) {
      setResult({ title: "Memory capture blocked", body: payload.error ?? "Memory ingestion failed.", status: "Blocked" });
      return;
    }

    setSearchResults((items) => [payload.result.memory, ...items].slice(0, 6));
    setResult({ title: "Memory captured", body: payload.result.message, status: "Mock" });
  }

  async function reflect() {
    setLoading("reflect");
    setResult(null);
    const response = await mutationFetch("/api/memory/reflect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objective: reflectionObjective,
        reflectionKind: "strategy_reflection",
        categories: ["strategic", "workflow", "analytics"],
      }),
    });
    const payload = await response.json();
    setLoading(null);

    if (!response.ok) {
      setResult({ title: "Reflection blocked", body: payload.error ?? "Reflection failed.", status: "Blocked" });
      return;
    }

    setReflections((items) => [payload.result, ...items].slice(0, 5));
    setResult({ title: "Dry-run reflection complete", body: payload.message, status: "Needs approval" });
  }

  async function createExperiment() {
    setLoading("experiment");
    setResult(null);
    const response = await mutationFetch("/api/memory/experiments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        experimentType: "hook_comparison",
        name: "Folklore opening hook comparison",
        hypothesis: "Question-led hooks should outperform direct narration for Indian mystery shorts.",
        metricFocus: "retention",
        variants: [
          { key: "question", label: "Question hook", description: "What if this fort was never abandoned?", metrics: { retention: 0.74, ctr: 0.66 } },
          { key: "statement", label: "Statement hook", description: "This fort has one unexplained legend.", metrics: { retention: 0.62, ctr: 0.6 } },
        ],
      }),
    });
    const payload = await response.json();
    setLoading(null);

    if (!response.ok) {
      setResult({ title: "Experiment blocked", body: payload.error ?? "Experiment tracking failed.", status: "Blocked" });
      return;
    }

    setResult({ title: "Experiment tracked", body: payload.result.recommendation, status: "Needs approval" });
  }

  return (
    <section className="space-y-4">
      <Card className="border-neon/20 bg-black/30">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-neon" />
                Reflection Intelligence System
              </CardTitle>
              <CardDescription>Memory ingestion, retrieval, reflection, experiments, and prompt evolution are mock-safe and approval-gated.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="info">{dashboard.providerStatus.status}</Badge>
              <Badge variant="safe">pgvector-ready</Badge>
              <Badge variant="warning">No live embeddings</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-sm text-muted-foreground">Memory categories</div>
            <div className="mt-2 text-sm leading-6 text-foreground">{categorySummary}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-sm text-muted-foreground">Semantic retrieval</div>
            <div className="mt-2 font-display text-xl font-semibold">{dashboard.semanticSearch.mode}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-sm text-muted-foreground">Strategy mutation</div>
            <div className="mt-2 font-display text-xl font-semibold text-amber-100">Approval only</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-4 w-4 text-neon" />
              Knowledge retrieval
            </CardTitle>
            <CardDescription>Inspect contextual memory before agents use it in future decisions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <FieldLabel>Search query</FieldLabel>
              <textarea value={query} onChange={(event) => setQuery(event.target.value)} className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/35 p-3 text-sm outline-none focus:border-neon/60" />
            </div>
            <Button type="button" onClick={runSearch} disabled={loading === "search"}>
              <Search className="h-4 w-4" />
              {loading === "search" ? "Searching" : "Run mock retrieval"}
            </Button>
            <div className="space-y-2">
              {searchResults.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">No memory entries yet. Capture a memory note to seed retrieval.</div>
              ) : (
                searchResults.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge variant="info">{item.category}</Badge>
                      <span className="font-mono text-xs text-neon">{Math.round((item.retrievalScore ?? item.confidence) * 100)}%</span>
                    </div>
                    <div className="mt-3 font-medium">{item.title}</div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-neon" />
              Memory ingestion
            </CardTitle>
            <CardDescription>Capture operational learnings without live embedding calls or destructive actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>Category</FieldLabel>
                <select value={category} onChange={(event) => setCategory(event.target.value as CategoryOption)} className="h-11 w-full rounded-2xl border border-white/10 bg-black/35 px-3 text-sm outline-none focus:border-neon/60">
                  {categories.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <FieldLabel>Title</FieldLabel>
                <input value={title} onChange={(event) => setTitle(event.target.value)} className="h-11 w-full rounded-2xl border border-white/10 bg-black/35 px-3 text-sm outline-none focus:border-neon/60" />
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel>Summary</FieldLabel>
              <input value={summary} onChange={(event) => setSummary(event.target.value)} className="h-11 w-full rounded-2xl border border-white/10 bg-black/35 px-3 text-sm outline-none focus:border-neon/60" />
            </div>
            <div className="space-y-2">
              <FieldLabel>Content</FieldLabel>
              <textarea value={content} onChange={(event) => setContent(event.target.value)} className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/35 p-3 text-sm outline-none focus:border-neon/60" />
            </div>
            <Button type="button" onClick={ingest} disabled={loading === "ingest"}>
              <ShieldCheck className="h-4 w-4" />
              {loading === "ingest" ? "Capturing" : "Capture memory"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCompareArrows className="h-4 w-4 text-neon" />
              Reflection engine
            </CardTitle>
            <CardDescription>Generate optimization recommendations without changing workflows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea value={reflectionObjective} onChange={(event) => setReflectionObjective(event.target.value)} className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/35 p-3 text-sm outline-none focus:border-neon/60" />
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={reflect} disabled={loading === "reflect"}>
                <BrainCircuit className="h-4 w-4" />
                {loading === "reflect" ? "Reflecting" : "Run dry reflection"}
              </Button>
              <Button type="button" variant="secondary" onClick={createExperiment} disabled={loading === "experiment"}>
                <FlaskConical className="h-4 w-4" />
                Track hook experiment
              </Button>
            </div>
            {result ? (
              <div className={cn("rounded-2xl border p-4", statusClass(result.status))}>
                <div className="font-medium">{result.title}</div>
                <p className="mt-1 text-sm leading-6 opacity-85">{result.body}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent reflections</CardTitle>
            <CardDescription>Reflection outputs are proposals, not automatic strategy changes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reflections.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">No reflections yet. Run a dry reflection to generate the first strategy report.</div>
            ) : (
              reflections.map((reflection) => (
                <div key={reflection.reflectionId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="warning">Needs approval</Badge>
                    <span className="font-mono text-xs text-neon">{Math.round(reflection.qualityScore * 100)} quality</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{reflection.recommendations[0]}</p>
                  <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{reflection.mutationStatus}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
