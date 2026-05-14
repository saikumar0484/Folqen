import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageSquare, Sparkles, Wand2 } from "lucide-react";

const highlights = [
  "Research trending ideas with guided prompts",
  "Generate hooks and short scripts in minutes",
  "Prepare thumbnail directions and metadata",
  "Reveal a publish-ready draft package",
];

const flow = [
  { title: "Research", text: "Start with one idea and let Folqen surface angles worth creating." },
  { title: "Script", text: "Turn that angle into clean hook options and short-form story drafts." },
  { title: "Thumbnail", text: "Generate a thumbnail direction that matches your story and audience." },
  { title: "Draft Package", text: "Collect title, description, tags, script, and assets in one review-ready package." },
];

const prompts = [
  "Create a horror storytelling shorts channel.",
  "Give me five mystery hooks for tonight's video.",
  "Draft a high-retention short script with a cliffhanger ending.",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080d14]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neon text-black">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <div className="font-display text-lg font-semibold tracking-[-0.02em]">Folqen</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Creator OS</div>
            </div>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {["How it works", "Workflow", "Pricing", "FAQ"].map((item) => (
              <span key={item} className="rounded-lg px-3 py-2 text-sm text-muted-foreground">
                {item}
              </span>
            ))}
          </div>
          <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-neon px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110">
            Open App
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(58%_45%_at_22%_0%,rgba(158,255,47,.16),transparent_68%),radial-gradient(48%_40%_at_82%_8%,rgba(129,224,137,.1),transparent_72%)]" />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-16 sm:px-6 md:pt-24 lg:grid-cols-[1.06fr_0.94fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5">
              <span className="pulse-dot" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Conversational AI creator workspace</span>
            </div>
            <h1 className="mt-6 max-w-[16ch] font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Turn ideas into publish-ready content with one calm workflow.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
              Folqen helps creators research, script, and package better content through guided conversation and clean workflow steps.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-neon px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110">
                Start your workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/join-beta" className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold transition hover:bg-white/[0.08]">
                Join creator beta
              </Link>
            </div>
          </div>

          <div className="panel relative overflow-hidden rounded-3xl p-6">
            <div className="absolute right-[-14%] top-[-20%] h-56 w-56 rounded-full bg-neon/[0.12] blur-3xl" />
            <div className="relative z-[1]">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon">What creators get</div>
              <div className="mt-4 space-y-2">
                {highlights.map((item) => (
                  <div key={item} className="panel-soft flex items-center gap-2 rounded-xl p-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-neon" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] md:text-5xl">From idea to package, step by step.</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">Folqen keeps the flow simple so creators can stay in momentum.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {flow.map((item, index) => (
            <article key={item.title} className="panel rounded-2xl p-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon">Step {index + 1}</div>
              <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel-soft py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <article className="panel rounded-3xl p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MessageSquare className="h-4 w-4 text-neon" />
                Conversational-first experience
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Tell Folqen what you want to build, answer a few smart prompts, and get creator-ready outputs without dashboard overload.
              </p>
              <div className="mt-4 space-y-2">
                {prompts.map((prompt) => (
                  <div key={prompt} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-muted-foreground">
                    &ldquo;{prompt}&rdquo;
                  </div>
                ))}
              </div>
            </article>

            <article className="panel rounded-3xl p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Wand2 className="h-4 w-4 text-neon" />
                Built for creator momentum
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Folqen keeps your workspace calm with guided onboarding, clear empty states, and draft-focused outputs you can act on quickly.
              </p>
              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
                Early beta features continue to expand. Your core research, script, and draft workflow is ready today.
              </div>
            </article>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="panel rounded-2xl p-6">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h3 className="font-display text-3xl font-semibold tracking-[-0.03em]">
                <span className="title-gradient">Folqen</span> helps creators ship better stories faster.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">Start your guided workflow and turn ideas into publish-ready drafts.</p>
            </div>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-neon px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110">
              Open Folqen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
