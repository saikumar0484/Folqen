# Folqen Autonomous Organization Architecture

Last updated: May 12, 2026

## Purpose

This document defines Folqen as an AI-native autonomous creator organization operating system, not a chatbot and not a simple content automation tool.

Folqen should behave like a small autonomous media company with a real organizational hierarchy, approval gates, memory, audit trails, provider adapters, error recovery, and human-controlled risk boundaries.

The current repository already contains a Next.js App Router application, authentication foundation, protected app shell, provider setup surfaces, Prisma schema foundation, file validation, posting package support, and deployment/checkpoint documentation. This document describes the scalable target architecture that future implementation phases should follow.

Important stack note: the user requested Next.js 15, while the current repository package baseline is Next `16.2.4`. Do not downgrade framework versions without an explicit human decision, because that is a production-impacting dependency change. The architecture below is App Router compatible and can be implemented on the current baseline or adjusted if the human approves a version change.

## Product Shape

Folqen is an autonomous AI creator company OS for an India-based Urban Legends, Mystery, and Folklore brand.

The human interacts mainly through:

- Chat
- Voice input placeholders and future transcription
- Images
- Files
- Conversational commands
- Approval cards
- Operational dashboards

Folqen agents autonomously prepare work, but the system must block risky execution by default. Public publishing, paid tools, production upgrades, account connections, credentials, monetization, browser automation, destructive actions, sensitive topics, copyright uncertainty, and security changes require human approval.

## North-Star Architecture

```text
Human Command Layer
  - Chat, voice, files, images, approvals, dashboards

Product UI Layer
  - Next.js App Router, authenticated shell, route surfaces, command palette

API and Policy Layer
  - Route handlers, Zod validation, auth, RBAC, rate limits, mutation guards

Organization Control Plane
  - Agent hierarchy, task delegation, approval routing, event ingestion

Agent Orchestration Layer
  - LangGraph state machines, CrewAI crews, Langflow prototypes, command router

Workflow and Job Layer
  - n8n workflows, BullMQ queues, Redis locks, retry policies, schedulers

Service Interface Layer
  - LLM, image, video, voice, render, publishing, analytics, storage, memory

Provider Adapter Layer
  - OpenRouter, Gemini, local tools, ComfyUI, FFmpeg, social platforms, n8n

Data and Memory Layer
  - Supabase/Postgres, pgvector, object storage, audit logs, event logs

Infrastructure Layer
  - Docker, Coolify, Vercel or self-hosted Next, worker nodes, backups
```

## Design Principles

- API-first: every major capability should be available through authenticated APIs, not only UI actions.
- Event-driven: long-running work emits events and status changes instead of hiding state inside a single request.
- Approval-gated autonomy: agents can plan and prepare, but risky actions require explicit approval.
- Provider-agnostic: select tools by capabilities and status, not hardcoded names.
- Honest integration state: show `Not connected`, `Configured`, `Live`, `Mock`, or `Needs approval`.
- Recoverable work: every job has logs, retry policy, failure reason, rollback notes, and ownership.
- Modular organization: departments and agents are replaceable units behind orchestration contracts.
- India-aware platform plan: no TikTok dependency; prioritize YouTube, Instagram, Facebook, Snapchat, and Threads.
- Budget-aware MVP: free/local/self-hosted first; paid tools disabled until approved.
- Security by default: secrets stay server-side, sensitive writes are audited, RLS is planned for exposed tables.

## Agent Organization Model

Folqen should model the AI company as departments, roles, agents, and operating procedures.

### Executive Layer

Chief Creator Officer Agent:

- Owns brand direction, weekly content priorities, and approval escalation.
- Reads trend, analytics, and competitor signals.
- Produces content strategy memos and board-level recommendations.

Chief Operations Agent:

- Owns queues, workflow health, retry strategy, and SLA monitoring.
- Converts strategy into executable workflows.
- Coordinates n8n, BullMQ, render workers, and platform adapters.

Chief Safety and Compliance Agent:

- Owns publishing guards, copyright checks, sensitive topic checks, platform policy risk, and audit escalations.
- Can block public publishing even if other agents approve.

Chief Improvement Agent:

- Implements the Self-Improvement Research Agent rules.
- Researches models, tools, workflows, cost reductions, security updates, and prompt improvements.
- Drafts upgrade proposals but never executes upgrades without approval.

### Departments

Strategy Department:

- Trend Research Agent
- Competitor Intelligence Agent
- Content Calendar Planner
- Audience Insight Agent
- Monetization Strategist

Research Department:

- Folklore Research Agent
- Source Quality Agent
- Fact and Claim Reviewer
- Copyright Risk Agent
- India Context Agent

Creative Department:

- Hook Writer Agent
- Script Writer Agent
- Storyboard Agent
- Prompt Engineer Agent
- Caption and Metadata Agent
- Thumbnail Concept Agent

Media Production Department:

- Image Generation Agent
- Video Assembly Agent
- Voice/TTS Agent
- Caption/Subtitles Agent
- FFmpeg Render Agent
- Quality Control Agent

Publishing Department:

- Platform Packaging Agent
- Scheduling Agent
- Manual Posting Package Agent
- Platform Policy Agent
- Publish Readiness Agent

Growth Department:

- Analytics Agent
- Retention Agent
- A/B Testing Agent
- SEO Agent
- Repurposing Agent

Reliability Department:

- Error Recovery Agent
- Retry Agent
- Incident Triage Agent
- Workflow Debugger Agent
- Cost Guard Agent

Memory Department:

- Organizational Memory Agent
- Prompt Version Librarian
- Decision Log Agent
- Asset Indexing Agent
- Knowledge Retrieval Agent

## Agent Execution Contracts

Every agent should expose the same operational contract:

```ts
type FolqenAgent = {
  id: string;
  department: string;
  role: string;
  status: "idle" | "working" | "blocked" | "failed" | "waiting_for_approval";
  capabilities: string[];
  allowedAutonomyLevel: AutonomyLevel;
  requiredApprovals: ApprovalType[];
  inputSchema: unknown;
  outputSchema: unknown;
  memoryScopes: string[];
  tools: string[];
  run: (input: AgentRunInput) => Promise<AgentRunResult>;
};
```

Agent outputs should always include:

- Summary
- Structured result
- Confidence score
- Sources or inputs used
- Risks found
- Required approvals
- Events emitted
- Artifacts created
- Next recommended action

## Orchestration Architecture

Folqen should use different orchestration tools for different jobs instead of forcing everything into one framework.

LangGraph:

- Deterministic state machines for multi-step agent jobs.
- Best for content creation pipelines, review gates, retry paths, and branchable workflows.
- Each graph state should persist to `WorkflowRun`, `AgentTask`, and `EventLog`.

CrewAI:

- Department-style collaborative agents.
- Best for research, creative ideation, critique, and strategy debates.
- Crew outputs become proposals, drafts, or tasks rather than direct risky actions.

Langflow:

- Visual prototyping surface for chains and internal experiments.
- Langflow flows should be imported or reimplemented behind service interfaces before production use.
- Production flows require versioning, tests, and approval.

n8n:

- External workflow engine for integration glue, scheduled triggers, notifications, and platform automation.
- n8n should be called through `WorkflowProvider`, never directly from UI components.
- Webhooks must use shared secrets and audit logs.

BullMQ and Redis:

- Durable queues for long-running work.
- Required for render jobs, retryable external API calls, scheduled content jobs, analytics pulls, and upload processing.
- Redis also supports locks, idempotency keys, rate limit state, and job heartbeats.

LibreChat:

- Optional full-featured chat frontend or reference integration.
- If embedded, it must not bypass Folqen auth, policy checks, audit logs, or provider guards.

AnythingLLM:

- Optional knowledge base and RAG backend for organizational memory.
- If used, it should sit behind `VectorMemoryProvider` and not become the only memory implementation.

## Communication Architecture

Use command, event, and query separation.

Commands:

- User or agent intent to change state.
- Examples: `CreateContentPackage`, `RequestApproval`, `StartRender`, `GeneratePostingPackage`, `RetryWorkflow`.
- Commands are validated by Zod, authorized by RBAC, policy-checked, then logged.

Events:

- Immutable facts about what happened.
- Examples: `agent.command.received`, `content.draft.created`, `approval.requested`, `publish.blocked`, `render.failed`, `workflow.retry.scheduled`.
- Events are written to `EventLog` and optionally pushed to realtime UI updates.

Queries:

- Read models for dashboards, analytics, task status, queue status, approvals, and audit views.
- Queries should not trigger side effects.

Recommended internal event envelope:

```ts
type FolqenEvent = {
  id: string;
  type: string;
  version: number;
  occurredAt: string;
  actorType: "user" | "agent" | "system" | "provider";
  actorId?: string;
  subjectType?: string;
  subjectId?: string;
  correlationId: string;
  causationId?: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  payload: Record<string, unknown>;
};
```

## Backend Architecture

Next.js API and server modules:

- Authentication and session handling
- RBAC checks
- Zod request validation
- Mutation guard and rate limit helpers
- User settings APIs
- Approval APIs
- Agent message APIs
- Provider setup APIs
- Posting package APIs
- File intake APIs
- Health and integration status APIs

Worker services:

- `worker-orchestrator`: consumes agent/workflow jobs and runs LangGraph/CrewAI tasks.
- `worker-media`: handles FFmpeg, ComfyUI, TTS, subtitles, and render packaging.
- `worker-platforms`: handles platform status checks, manual package generation, scheduled drafts, and future posting APIs.
- `worker-analytics`: pulls platform metrics when providers are connected.
- `worker-research`: runs self-improvement scans and competitor/trend research within allowed sources.

Service interfaces:

- `AgentService`
- `WorkflowService`
- `ApprovalService`
- `PolicyService`
- `ProviderRegistryService`
- `MemoryService`
- `FileStorageService`
- `PublishingService`
- `AnalyticsService`
- `NotificationService`
- `AuditService`
- `ErrorRecoveryService`

Each service should have:

- Interface
- Mock adapter
- Provider-backed adapter
- Test fixtures
- Status reporting
- Audit hooks for sensitive behavior

## Frontend Architecture

App shell:

- Sidebar navigation
- Topbar
- Command palette
- Notification center
- Global `MiniAgentChat`
- Mobile drawer
- Toasts
- Confirmation dialogs
- Status and risk badges

Route architecture:

- `/dashboard`: executive operations dashboard.
- `/agent`: full command center chat and agent context.
- `/calendar`: planning and publishing calendar.
- `/pipeline`: workflow and job execution status.
- `/library`: content, assets, scripts, packages, and renders.
- `/approvals`: human decision center.
- `/platforms`: platform setup and connection status.
- `/tools`: local/free/paid tool status and limits.
- `/settings`: safety, autonomy, credentials, provider settings.
- `/analytics`: performance, retention, topic intelligence.
- `/monetization`: eligibility and revenue readiness.
- `/brand`: brand identity and style controls.
- `/errors`: incidents, retries, and recovery.
- `/audit`: immutable action history.
- `/workflows`: n8n/LangGraph/Langflow workflow hub.
- `/files`: private file manager.
- `/notifications`: alerts and work queue.
- `/upgrades`: self-improvement proposals.

UI style:

- Dark mode first.
- Cyber operations center mood.
- Premium SaaS layout.
- Controlled glass surfaces, not excessive transparency.
- Neon green as an accent, not the whole palette.
- Use graphite, black, near-white text, muted cyan for information, amber for warnings, red for critical states, green for safe/live states.
- Keep dense operational surfaces scannable.
- Use charts, timelines, queue panels, task cards, and approval cards.
- Keep cards to practical content units; avoid nested cards.
- Every integration state must be visibly honest.

## Folder Structure

Target enterprise-grade structure:

```text
.
├── docs/
│   ├── ARCHITECTURE.md
│   ├── AUTONOMOUS_ORGANIZATION_ARCHITECTURE.md
│   ├── PROVIDER_GUIDE.md
│   ├── PLUGIN_GUIDE.md
│   ├── UPGRADE_GUIDE.md
│   ├── SECURITY_PLAN.md
│   ├── DEPLOYMENT_PLAN.md
│   ├── CURRENT_STATUS.md
│   ├── NEXT_STEPS.md
│   ├── CHANGELOG.md
│   ├── RISK_LOG.md
│   └── HANDOFF_LOG.md
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── supabase/
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (app)/
│   │   ├── api/
│   │   ├── login/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── app/
│   │   ├── ui/
│   │   ├── charts/
│   │   ├── forms/
│   │   └── agent/
│   ├── lib/
│   │   ├── auth/
│   │   ├── audit/
│   │   ├── approvals/
│   │   ├── agents/
│   │   ├── orchestration/
│   │   ├── workflows/
│   │   ├── providers/
│   │   ├── services/
│   │   ├── security/
│   │   ├── settings/
│   │   ├── files/
│   │   ├── memory/
│   │   ├── analytics/
│   │   ├── publishing/
│   │   ├── notifications/
│   │   ├── errors/
│   │   └── utils/
│   ├── workers/
│   │   ├── orchestrator/
│   │   ├── media/
│   │   ├── analytics/
│   │   ├── platforms/
│   │   └── research/
│   ├── queues/
│   ├── config/
│   └── types/
├── docker/
│   ├── app.Dockerfile
│   ├── worker.Dockerfile
│   └── n8n/
├── docker-compose.yml
├── docker-compose.prod.yml
├── package.json
└── README.md
```

The current repository is not yet fully split into these folders. Future refactors should move toward this shape only when it improves implementation clarity and testability.

## Database Architecture

Use Supabase/Postgres as the system of record. Use Prisma for application models. Use JSON fields for provider-specific metadata where flexibility is needed, but keep core workflow, approval, audit, and identity fields relational.

### Core Identity and Access

- `User`: email, password hash, role, status, timestamps.
- `Session`: server-side session records if session storage is moved from cookie-only to DB-backed.
- `RolePermission`: optional future model for granular permissions.
- `AuditLog`: immutable sensitive action history.

### Organization and Agent Models

- `Department`: strategy, research, creative, media, publishing, growth, reliability, memory.
- `AgentDefinition`: agent role, department, capabilities, status, autonomy scope.
- `AgentRun`: one execution attempt with input, output, logs, status, and cost.
- `AgentMessage`: human/agent/system conversation turns.
- `AgentTask`: unit of work owned by an agent or workflow.
- `AgentMemoryEntry`: structured memories, decisions, reusable facts, prompt learnings.

### Content and Media Models

- `ContentItem`: topic, format, status, review status, safety status, copyright status.
- `ContentVersion`: scripts, hooks, outlines, storyboard versions, captions, metadata.
- `Asset`: uploaded or generated file metadata.
- `Render`: render jobs, outputs, logs, provider used.
- `PostingPackage`: manual posting bundle for disconnected platforms.
- `ContentCalendarItem`: planned posts, channels, times, approval state.

### Workflow and Queue Models

- `WorkflowDefinition`: versioned workflow templates.
- `WorkflowRun`: execution instance with state and logs.
- `WorkflowStepRun`: per-step status and retry details.
- `QueueJobRecord`: mirror of BullMQ job id, attempts, and failure reason.
- `RetryPolicy`: reusable backoff strategy definitions.

### Provider and Tool Models

- `ProviderRegistryItem`: provider id, type, status, version, capabilities, cost model.
- `ProviderCredentialReference`: encrypted credential metadata, never raw secret display.
- `ToolLimit`: budget, quota, usage, reset periods.
- `PlatformConnection`: platform status, auth method, capabilities, policy notes.
- `IntegrationHealthCheck`: last test time, result, safe diagnostic.

### Approval and Policy Models

- `Approval`: pending/approved/rejected/expired human decisions.
- `ApprovalDecision`: decision history and actor.
- `PolicyRule`: versioned guard rules.
- `PolicyEvaluation`: why an action was allowed or blocked.
- `RiskAssessment`: risk category, score, mitigation, owner.

### Analytics and Growth Models

- `AnalyticsRecord`: raw and normalized metrics.
- `ContentPerformanceSnapshot`: views, watch time, CTR, retention, engagement.
- `Experiment`: A/B tests for hooks, titles, thumbnails, formats.
- `CompetitorSignal`: competitor content observations and trend signals.
- `TrendSignal`: topic, source, confidence, freshness, region/platform.

### Self-Improvement Models

- `ResearchFinding`: source, summary, confidence, category.
- `UpgradeProposal`: title, risk, cost, benefit, testing plan, rollback plan.
- `UpgradeRun`: sandbox/test/implementation attempt.
- `PromptVersion`: versioned prompts and active status.
- `Setting`: versioned app settings and feature flags.
- `EventLog`: internal event stream and correlation backbone.

### Supabase Security Requirements

- Enable RLS for tables exposed through Supabase APIs.
- Never expose service-role keys to frontend code.
- Use server-only secret access for provider credentials.
- Prefer private schemas for privileged functions.
- Use security-invoker views where views must respect caller permissions.
- Keep storage private by default.
- Use signed or server-mediated access for private files.
- Store authorization decisions in server-owned role data, not user-editable metadata.

## Provider Architecture

Provider selection must use capabilities.

```ts
type ProviderCapability =
  | "text_generation"
  | "structured_output"
  | "vision"
  | "embeddings"
  | "text_to_image"
  | "image_to_image"
  | "text_to_video"
  | "image_to_video"
  | "voice_generation"
  | "transcription"
  | "caption_generation"
  | "video_render"
  | "workflow_trigger"
  | "platform_upload"
  | "platform_schedule"
  | "analytics_read"
  | "browser_control"
  | "local_execution";
```

Required provider interfaces:

- `LLMProvider`
- `ImageGenerationProvider`
- `VideoGenerationProvider`
- `VoiceGenerationProvider`
- `TranscriptionProvider`
- `CaptionProvider`
- `RenderProvider`
- `WorkflowProvider`
- `PublishingProvider`
- `AnalyticsProvider`
- `StorageProvider`
- `NotificationProvider`
- `AuthProvider`
- `VectorMemoryProvider`
- `BrowserAutomationProvider`

Provider statuses:

- `not_connected`
- `configured`
- `testing`
- `live`
- `failed`
- `disabled`
- `deprecated`
- `needs_attention`

MVP providers:

- OpenRouter LLM: `Not connected`, paid-tool guard required.
- Gemini LLM: `Not connected`, paid/free quota clarity required.
- Local/mock LLM: `Mock`.
- n8n workflow provider: `Not connected` until URL and secret are configured.
- FFmpeg render provider: `Not connected` until worker path/endpoint is configured.
- ComfyUI image workflow provider: `Not connected` until endpoint is configured.
- Google Drive private storage: implemented adapter, not live without credentials.
- Supabase/Postgres: live in previous checkpoint, but verify before real work.
- Social platform APIs: `Not connected`.
- Manual posting package provider: available fallback.

## Publishing Guard

Public publishing is always blocked unless all conditions are true:

```ts
ALLOW_PUBLIC_PUBLISH === true
REQUIRE_HUMAN_APPROVAL === true
approval.status === "approved"
content.safetyStatus === "passed"
content.copyrightStatus === "clear"
content.reviewStatus === "passed"
platformConnection.status === "live"
```

If any condition fails, the publishing provider must return a blocked result explaining every failed condition and creating an audit event.

For disconnected or unavailable platform APIs, Folqen must generate a manual posting package instead of claiming a post was uploaded.

## Paid Tool Guard

Paid tool usage is blocked unless:

```ts
ALLOW_PAID_TOOLS === true
approval.status === "approved"
tool.costModel !== "unknown"
budgetPolicy.allows(tool.estimatedCost)
```

Every paid execution should log estimated cost, actual cost if known, provider, request id, and approval id.

## Workflow Engine

Representative content pipeline:

```text
Command received
  -> classify intent
  -> create workflow run
  -> research trends and sources
  -> generate topic candidates
  -> rank topics by brand fit, risk, and platform potential
  -> generate script and hooks
  -> review safety, copyright, and quality
  -> create storyboard and media prompts
  -> generate or register assets
  -> render draft if provider is configured
  -> create captions, metadata, hashtags, thumbnails
  -> create posting package or schedule private draft
  -> request human approval for risky/public/paid steps
  -> monitor analytics after publish
  -> feed lessons into memory and prompt proposals
```

Each workflow step must record:

- Step name
- Input hash
- Output summary
- Provider used
- Status
- Started/finished timestamps
- Retry count
- Cost estimate
- Failure reason
- Recovery action

## Organizational Memory

Memory should be layered:

- Conversational memory: recent user commands and preferences.
- Brand memory: tone, themes, visual identity, banned topics, channel rules.
- Content memory: past scripts, hooks, thumbnails, performance, sources.
- Operational memory: failed workflows, fixes, provider incidents, retry success.
- Prompt memory: prompt versions, evaluations, winning variants.
- Strategic memory: decisions, assumptions, approvals, roadmap choices.

Storage strategy:

- Postgres relational records for source-of-truth entities.
- pgvector or provider-backed vector store behind `VectorMemoryProvider`.
- File/object storage for source documents, generated media, and posting packages.
- Event log for timeline and replayable operational facts.

## Error Recovery Layer

Every failure should be classified:

- Validation failure
- Auth/permission failure
- Provider not connected
- Rate limit
- Quota/cost block
- External API failure
- Render failure
- Safety/copyright block
- Human approval required
- Internal exception
- Infrastructure outage

Recovery behavior:

- Safe retry for transient provider/network failures.
- Exponential backoff for rate limits.
- Alternate provider fallback when capabilities match and policy allows.
- Manual package fallback for platform publishing.
- Human approval escalation for risky continuation.
- Incident record for repeated or critical failures.
- No scope expansion while verification is failing.

## Analytics Architecture

Analytics inputs:

- Platform APIs when connected.
- Manual import CSV/XLSX.
- User-entered metrics.
- Posting package status.
- Agent-run metadata and costs.

Analytics outputs:

- Views, watch time, CTR, retention, engagement.
- Best topics, hooks, formats, thumbnails, and platforms.
- Workflow cycle time and failure rate.
- Cost per asset and cost per publishable package.
- Provider reliability score.
- Upgrade recommendations.

Analytics should feed:

- Strategy agent topic selection.
- Script and hook generation.
- Thumbnail concept generation.
- Posting time recommendations.
- Self-improvement proposals.

## Approval System

Approval types:

- Public publishing
- Paid tool usage
- Sensitive topic
- Copyright uncertainty
- Platform account connection
- Credential storage
- Browser automation
- Brand identity change
- Monetization/payment action
- Security setting change
- Database migration
- System upgrade
- Prompt upgrade
- Workflow upgrade
- Provider activation

Approval cards should include:

- Requested action
- Reason
- Risk level
- Cost impact
- Privacy/security impact
- Policy impact
- Rollback plan
- Testing plan
- Affected providers/files/services
- Agent recommendation
- Confidence score
- Approve, reject, defer, ask agent, or approve test-only actions

## Deployment Strategy

### Low-Cost MVP Deployment

- Next.js app: Vercel or Coolify-hosted container.
- Database: Supabase/Postgres free tier or self-hosted Postgres.
- Redis: Upstash free tier or self-hosted Redis on the same VPS.
- n8n: self-hosted on Oracle Free Tier or Coolify.
- Media workers: local PC or Oracle worker, disabled when offline.
- Object storage: Google Drive adapter or local private storage first.
- Domain/CDN: Vercel or Cloudflare free tier.

### Production Docker Topology

```text
folqen-web
  - Next.js app
  - API routes
  - SSR/dashboard

folqen-worker-orchestrator
  - LangGraph/CrewAI jobs
  - BullMQ consumers

folqen-worker-media
  - FFmpeg
  - ComfyUI connector
  - TTS/caption jobs

folqen-worker-analytics
  - metric pulls
  - trend imports

postgres
  - production data when self-hosted

redis
  - queues, locks, cache

n8n
  - workflow automation

langflow
  - optional visual chain prototyping

anythingllm
  - optional memory/RAG backend
```

### Coolify Strategy

- One project for Folqen app.
- Separate services for web, workers, Redis, n8n, Langflow, and optional AnythingLLM.
- Use internal service networking for worker/web communication.
- Store secrets in Coolify environment variables.
- Enable health checks for web, workers, n8n, and Redis.
- Configure backups for Postgres and uploaded artifacts.
- Keep public ingress limited to web app and explicitly approved n8n endpoints.

### Release Strategy

- `main`: stable source-of-truth branch.
- Feature branches for risky changes.
- Pull requests for auth, DB, publishing, payment, provider activation, worker execution, and deployment changes.
- Every release requires lint, typecheck, tests, build, and checkpoint docs.
- Production deploys require health check and smoke test.

## Security Architecture

Minimum controls:

- Server-only secrets.
- Password hashing.
- Protected routes.
- Admin/operator/viewer roles.
- Same-origin mutation checks.
- App-marked browser mutations.
- Rate limits for sensitive routes.
- Zod validation at API boundaries.
- MIME and size validation for files.
- Path traversal prevention.
- Private file default.
- Security headers.
- Audit logs for sensitive actions.
- Approval logs for risky actions.
- Masked secrets in UI.
- Confirmation dialogs for dangerous changes.
- Provider status honesty.
- Human approval for paid/public/risky actions.

Future controls:

- DB-backed sessions.
- Stronger CSRF tokens.
- Per-route permission matrix.
- RLS policies for Supabase-exposed data.
- Encrypted credential vault with key rotation.
- Worker-to-web shared secret or mTLS.
- Idempotency keys for external provider calls.
- Job signing for worker commands.
- Structured incident response.

## Phased Roadmap

Phase A: Architecture Alignment

- Add this architecture document.
- Keep existing checkpoint docs updated.
- Identify stack mismatch decisions such as Next.js 15 versus current Next 16.
- Map current code to target services.

Phase B: Control Plane Foundation

- Formalize agent hierarchy models.
- Add command router and event envelope.
- Expand `EventLog` semantics.
- Add policy evaluation records.
- Add approval types and decision history.

Phase C: Queue and Worker Foundation

- Add Redis and BullMQ.
- Add worker process entrypoints.
- Add job records and idempotency.
- Add retry policies and heartbeat checks.
- Keep all providers mocked or not connected until configured.

Phase D: Memory Foundation

- Add memory service interface.
- Add brand memory and decision memory.
- Add source document indexing path.
- Add vector provider placeholder.
- Add retrieval into agent command context.

Phase E: Agent Orchestration

- Add LangGraph workflow skeletons.
- Add CrewAI research/strategy crew skeletons where suitable.
- Add deterministic safety gates between steps.
- Persist every run, artifact, and failure.

Phase F: Content Company Workflows

- Trend research workflow.
- Competitor analysis workflow.
- Topic selection workflow.
- Script/hook/caption/metadata workflow.
- Thumbnail prompt workflow.
- Posting package workflow.
- Analytics learning workflow.

Phase G: Media and Local Tools

- FFmpeg worker connection test.
- ComfyUI worker connection test.
- TTS/transcription provider placeholders.
- Render job pipeline.
- File storage hardening.

Phase H: Platform Operations

- Manual posting packages for all platforms.
- YouTube private upload only after credentials and approval.
- Instagram/Facebook/Snapchat/Threads API adapters only when setup is safe and policy-compliant.
- Analytics imports.

Phase I: Self-Improvement System

- Research finding ingestion.
- Upgrade proposal creation.
- Risk/cost/benefit scoring.
- Approval-gated testing branch plans.
- Upgrade run tracking and rollback records.

Phase J: Production Hardening

- Full security pass.
- RLS and storage access policies.
- Worker isolation.
- Observability dashboards.
- Backups and restore drills.
- Incident and rollback playbooks.

Phase K: Enterprise Readiness

- Multi-workspace architecture.
- Granular permissions.
- SSO-ready auth provider abstraction.
- Per-provider cost accounting.
- Workflow marketplace/plugin system.
- Agent performance evaluation harness.

## Current Gaps Against Target

- Current app has provider setup surfaces but not full provider-backed automation.
- Current schema has many MVP models but not full organization, queue, memory, policy evaluation, and decision-history depth.
- Current UI is operational but should evolve into a richer cyber operations center.
- Current workflows are mostly mocked or manual package based.
- n8n, ComfyUI, FFmpeg, OpenRouter, Gemini, LibreChat, AnythingLLM, Redis, BullMQ, LangGraph, CrewAI, and Langflow are not live in the app unless future phases configure them.
- Social platform integrations are `Not connected`; manual posting packages remain the honest fallback.
- Public publishing and paid tools remain blocked by default.

## Human Decisions Needed

- Whether to align package baseline to Next.js 15 or keep the current Next `16.2.4`.
- Which deployment target is primary for the next production phase: Vercel plus workers, or Coolify-first.
- Whether Redis/BullMQ should be added immediately or after provider configuration.
- Which LLM provider should be enabled first: OpenRouter, Gemini, OpenAI, local, or mock-only continuation.
- Whether Google Drive remains private object storage or Supabase Storage should be added later.
- Which real platform should be connected first, if any.
- Whether to approve any paid tool usage.

## Non-Negotiables

- Do not fake connected integrations.
- Do not publish publicly without all publishing guard checks.
- Do not use paid tools without approval.
- Do not expose secrets to the frontend.
- Do not execute self-improvement upgrades automatically.
- Do not perform risky migrations without checkpoint and approval.
- Keep checkpoint docs current enough for another Codex session to continue.
