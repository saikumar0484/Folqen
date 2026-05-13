# Changelog

## May 13, 2026 - Final Production Cleanup Audit

### Changed

- Moved the prior repository audit report from `docs/REPOSITORY_AUDIT_2026-05-13.md` to `archive/final-cleanup/docs/REPOSITORY_AUDIT_2026-05-13.md` as historical cleanup evidence.

### Removed

- Deleted the previously reviewed `archive/review-required/` component archive after a final reference check confirmed no active imports, route usage, runtime dependency, deployment dependency, or governance dependency.

### Safety

- Kept all root control docs, checkpoint docs, deployment docs, provider/plugin/upgrade docs, and launch/testing docs that are referenced by README, AGENTS, handoff, checkpoint, implementation, or future-proofing flows.
- No runtime, orchestration, governance, API, queue, Prisma, deployment, browser operations, media, AI runtime, auth, or active dashboard file was changed.

## May 13, 2026 - Repository Audit and Bloat Reduction

### Added

- Added `docs/REPOSITORY_AUDIT_2026-05-13.md` with dependency/reference analysis before deletion.
- Added `/archive/review-required/` for low-risk unimported component review instead of deletion.

### Removed

- Removed the generated `docs/prototypes/ai-studio-generated/**` scaffold after audit proof showed no active imports or runtime references.
- Removed unused npm packages `@hookform/resolvers` and `@radix-ui/react-dialog`.

### Changed

- Moved unimported legacy app components into `archive/review-required/src/components/app/`.
- Simplified TypeScript and ESLint excludes to ignore `archive/**` instead of stale prototype/root-scaffold paths.

### Safety

- No active route, API, runtime, governance, deployment, auth, observability, queue, Prisma, or dashboard file was deleted.
- No live provider, publishing, rendering, browser automation, queue worker, or workflow execution flag was enabled.

### Verification

- `eslint .`: passed.
- `tsc --noEmit`: passed.
- `tsx --test "src/**/*.test.ts"`: passed, 151 tests.
- `prisma generate`: passed.
- `next build`: passed on Next.js `16.2.6`; protected routes and APIs remained in build output.
- Local preview-demo auth smoke: `/dashboard`, `/audit`, `/browser-operations`, `/infrastructure`, `/api/auth/me`, `/api/deployment/preview`, and `/api/browser-ops/overview` returned `200` after login.

## May 13, 2026 - Preview Demo Auth for Safe Dashboard Access

### Added

- Added a preview-only demo auth path for Vercel safe preview deployments without `DATABASE_URL`.
- Added `PREVIEW_DEMO_AUTH`, `PREVIEW_DEMO_EMAIL`, and `PREVIEW_DEMO_PASSWORD` preview env controls.
- Preview demo auth only works when preview runtime, safe mode, and forced dry-run are active and all dangerous execution flags remain disabled.

### Safety

- No production auth bypass was added. The demo path is gated to safe preview mode and still issues a signed HTTP-only Folqen session.
- Publishing, paid tools, browser automation, live AI, render execution, queue workers, and live thumbnail rendering must stay disabled for preview demo auth to work.
- No production database or provider secret was added.

### Verification

- `eslint .`: passed.
- `tsc --noEmit`: passed.
- `tsx --test "src/**/*.test.ts"`: passed, 151 tests.
- `prisma generate && next build`: passed on Next.js `16.2.6`.
- Initial Vercel preview redeploy and authenticated `/dashboard` preview smoke passed; final preview redeploy is pending for the diagnostics-readiness adjustment.

## May 13, 2026 - Browser Operations Department and Safe Preview Deployment

### Added

- Added `playwright-core` as the future Browser Operations controller dependency without installing browser binaries or enabling live browser execution.
- Added `src/lib/browser-ops/*` with dry-run browser session management, workflow simulation, action validation, domain allow/block policy, secret masking, screenshot audit placeholders, queue metadata, audit logging, quarantine controls, recovery controls, and tests.
- Added protected Browser Operations APIs: `GET /api/browser-ops/overview`, `POST /api/browser-ops/session`, `POST /api/browser-ops/workflow`, and `POST /api/browser-ops/control`.
- Added `/browser-operations` with governed session monitoring, dry-run workflow console, screenshot preview panel, browser traces, policy cards, quarantine controls, and explicit safety labels.
- Added `src/lib/preview-deployment/*`, `GET /api/deployment/preview`, `deploy/.env.preview.example`, and `docs/SAFE_PREVIEW_DEPLOYMENT.md` for preview-safe runtime diagnostics.
- Added `docs/BROWSER_OPERATIONS_ARCHITECTURE.md`.
- Updated preview/deployment env flags, Vercel config, route map, sidebar, command center routing, deployment governance diagnostics, orchestration queue registry, and proxy preview headers.

### Safety

- Browser Operations is dry-run only: no Playwright browser process is launched, no website is contacted, no account session/cookie is used, no scraping occurs, and no file upload is executed.
- Preview deployment mode is visualization-only and keeps publishing, providers, rendering, browser automation, queue workers, autonomous retries, platform execution, and workflow mutation disabled.
- Preview docs explicitly forbid production/provider/platform/render secrets in preview unless a future phase approves them.

### Verification

- Focused `tsx --test "src/lib/browser-ops/**/*.test.ts" "src/lib/preview-deployment/**/*.test.ts"`: passed, 9 tests.
- `tsc --noEmit`: passed.
- `eslint .`: passed.
- `tsx --test "src/**/*.test.ts"`: passed, 147 tests.
- `prisma generate && next build`: passed on Next.js `16.2.6`; Browser Operations and preview deployment routes are included in build output.
- Local HTTP smoke: `/login` returned `200`, `/api/health` returned `200`, anonymous `/api/browser-ops/overview` returned `401`, and anonymous `/api/deployment/preview` returned `401`.
- Protected route smoke: anonymous `/browser-operations` and `/infrastructure` redirected to `/login`.
- `npm audit --audit-level=moderate`: still reports the known nested Next/PostCSS moderate advisory; no unsafe forced fix was applied.

## May 13, 2026 - First Governed Live Thumbnail Rendering

### Added

- Added `src/lib/media/live-thumbnail-rendering.ts` for the first live-capable creative production path: Content Department thumbnail rendering only through the controlled `local_worker` provider.
- Added protected `GET/POST /api/media/live-thumbnail-render` and `POST /api/media/live-thumbnail-render/control`.
- Added mandatory gates for approved `media_render`/`thumbnail_render` approval ID verification, `ALLOW_CONTROLLED_MEDIA_EXECUTION`, `ALLOW_LIVE_THUMBNAIL_RENDERING`, activation stages, local worker endpoint/secret, render kill switches, quarantine, quotas, timeout, GPU-minute budget, validation, and scoring.
- Added worker response schema validation, thumbnail asset validation, render scoring, queue metadata, observability traces, provider trace IDs, failed asset isolation, rollback-to-dry-run, queue drain, quarantine, and failed render recovery planning.
- Added live thumbnail dashboard controls to `/content-studio`: provider/queue/budget/rollback diagnostics, thumbnail preview area, live run action, rollback control, quarantine control, recent run cards, and honest safety labels.
- Added env placeholders for `ALLOW_LIVE_THUMBNAIL_RENDERING`, `LIVE_THUMBNAIL_RENDER_STAGE`, `THUMBNAIL_RENDER_PROVIDER`, and `THUMBNAIL_RENDER_SANDBOX_FALLBACK`.
- Updated deployment governance, media provider status, media architecture docs, and route map for the governed live thumbnail capability.

### Safety

- No real worker endpoint or secret was configured.
- No real render was executed.
- No direct ComfyUI request, FFmpeg process, video generation, platform API, public publishing, autonomous retry, unrestricted GPU access, or workflow mutation was enabled.
- Live thumbnail rendering remains unavailable unless every approval, env, provider, budget, validation, kill-switch, and quarantine gate passes.

### Verification

- `eslint .`: passed.
- `tsc --noEmit`: passed.
- `tsx --test "src/**/*.test.ts"`: passed, 138 tests.
- `prisma generate && next build`: passed on Next.js `16.2.6`; `/api/media/live-thumbnail-render` and `/api/media/live-thumbnail-render/control` are included in the build output.
- Local HTTP smoke: `/login` returned `200`, `/api/health` returned `200`, and anonymous live-thumbnail render/control endpoints returned `401`.
- `npm audit --audit-level=moderate`: still reports the known nested Next/PostCSS moderate advisory; no unsafe forced fix was applied.

## May 13, 2026 - Production Environment & Deployment Governance System

### Added

- Added `src/lib/deployment-governance/*` with typed deployment readiness, environment validation, startup integrity, secret governance, Docker/VPS readiness, rollback readiness, and observability diagnostics.
- Added protected `GET /api/deployment/readiness` for authenticated deployment governance diagnostics.
- Added `/infrastructure` deployment governance panel with runtime profile, startup mode, masked secret checks, blocker summaries, Docker profiles, VPS/Coolify guidance, runtime diagnostics, and rollback indicators.
- Added safe startup env defaults: `FOLQEN_RUNTIME_PROFILE`, `REQUIRE_STARTUP_VALIDATION`, `STARTUP_DRY_RUN_MODE`, `STARTUP_ROLLBACK_MODE`, `STARTUP_QUARANTINE_MODE`, and `STARTUP_KILL_SWITCH`.
- Added production deployment scaffolding: `.dockerignore`, `Dockerfile.production`, `docker-compose.production.yml`, `deploy/.env.production.example`, and `deploy/backups/.gitkeep`.
- Added `docs/PRODUCTION_DEPLOYMENT_GOVERNANCE.md` covering Docker, Coolify, Oracle VPS, Hetzner VPS, reverse proxy, backups, restore rehearsal, rollback, quarantine, and approval triggers.

### Safety

- No real secrets were added.
- No production deploy was performed.
- No provider, queue worker, publishing, rendering, platform, n8n, paid tool, autonomous retry, or workflow mutation path was enabled.
- Deployment diagnostics mask configured secrets and the readiness endpoint is authenticated.

### Verification

- `eslint .`: passed.
- `tsc --noEmit`: passed.
- `tsx --test "src/**/*.test.ts"`: passed, 134 tests.
- `prisma generate && next build`: passed on Next.js `16.2.6`; `/api/deployment/readiness` is included in the build output.
- Local HTTP smoke: `/login` returned `200`, `/api/health` returned `200`, and anonymous `/api/deployment/readiness` returned `401`.
- `npm audit --audit-level=moderate`: still reports the known nested Next/PostCSS moderate advisory; no unsafe forced fix was applied because npm suggests a breaking downgrade.

## May 13, 2026 - Production Governance & Trace Verification Hardening

### Added

- Expanded the operations trace read model with approval lifecycle summaries, approval verification indicators, rollback eligibility, operational correlations, trace integrity checks, production diagnostics, and pagination metadata.
- Added protected `GET /api/operations/diagnostics` for read-only deployment/auth/database/queue/provider/governance diagnostics plus trace integrity status.
- Added protected `GET /api/governance/approvals/read-model` for read-only approval lifecycle and verification data.
- Upgraded `/audit` with approval timeline cards, trace integrity validation, production diagnostics, operational correlation graph, searchable/filterable trace explorer, and paginated trace loading.
- Updated the route map so `/audit` is marked as a configured operational reliability surface instead of a mock audit placeholder.
- Added tests for sensitive text redaction, approval lifecycle read models, and trace integrity detection for orphan workflows, approval mismatches, and queue failures.

### Safety

- This is still read-only governance hardening. No provider activation, live AI execution, publishing, rendering, queue mutation, workflow mutation, autonomous retry, platform access, n8n execution, or paid execution was enabled.
- Diagnostics expose only status and evidence labels, never secret values.
- Trace summaries redact secret-like text and metadata rendering still exposes only safe key names.
- The new diagnostics and approval read-model APIs require authenticated access.

### Verification

- Direct local `eslint .`: passed.
- Direct local `tsc --noEmit`: passed.
- Direct local `tsx --test "src/**/*.test.ts"`: passed, 129 tests.
- Direct local `prisma generate` plus `next build`: passed on Next.js `16.2.6`; `/api/operations/diagnostics` and `/api/governance/approvals/read-model` are included in the build output.
- Unauthenticated checks for `/api/operations/diagnostics` and `/api/governance/approvals/read-model` returned `401`.
- Local browser smoke loaded `/login` with no console errors. Authenticated `/audit` browser smoke still cannot be completed in this local environment because no `.env` with `AUTH_SECRET` and `DATABASE_URL` is present.
- `npm audit --audit-level=moderate` still reports the known nested Next/PostCSS moderate advisory; no unsafe forced fix was applied.

## May 13, 2026 - Governed Operations Trace Center

### Added

- Added `src/lib/operations-trace/*` as a read-only operational trace read model over existing AuditLog, EventLog, WorkflowRun, ErrorLog, Approval, Render, Asset, and BullMQ queue health signals.
- Added protected `GET /api/operations/traces`, returning normalized traces, safety posture, queue snapshots, summary counts, and explicit `Mock` / `Not connected` / `Needs approval` / `Configured` / `Blocked` labels.
- Rebuilt `/audit` around `OperationsTracePanel`, giving Folqen a unified trace center for audit logs, events, workflow runs, approvals, incidents, render packets, assets, queues, and safety controls.
- Added unit tests for trace status mapping, metadata key filtering, and safe fallback behavior.

### Safety

- The trace center is read-only and does not trigger providers, workflows, rendering, publishing, queue mutation, platform access, paid execution, or automation.
- Raw metadata values are not rendered in the UI; only filtered metadata key names are surfaced, with secret/token/password/API-key-like keys removed.
- If the database is unavailable, the dashboard returns an honest fallback instead of pretending live operational history exists.

### Verification

- Direct local `eslint .`: passed.
- Direct local `tsc --noEmit`: passed.
- Direct local `tsx --test "src/**/*.test.ts"`: passed, 127 tests.
- Direct local `prisma generate` plus `next build`: passed on Next.js `16.2.6`; `/api/operations/traces` and `/audit` are included in the build output.
- Local browser smoke loaded `/login` with no console errors. Authenticated `/audit` browser smoke could not be completed in this local environment because no `.env` with `AUTH_SECRET` and `DATABASE_URL` is present.
- `npm audit --audit-level=moderate` still reports the known nested Next/PostCSS moderate advisory; no unsafe forced fix was applied.

## May 13, 2026 - Controlled Media Execution & Asset Rendering System

### Added

- Added governed media execution flags to `.env.example` and env validation: `ALLOW_CONTROLLED_MEDIA_EXECUTION`, `LIVE_MEDIA_ACTIVATION_STAGE`, render kill switches, render quotas, concurrency limits, timeout limits, and GPU-minute budget ceilings.
- Added `src/lib/media/controlled-rendering.ts` with approved controlled workflows for thumbnail rendering, structured image generation, subtitle rendering, asset validation, render quality scoring, asset reflection, creative asset registry integration, and render recovery.
- Added `POST /api/media/controlled-render` and `POST /api/media/controlled-render/shutdown` for approval-gated render packets, queue metadata, render governance, scoring, validation, observability, rollback, and emergency shutdown.
- Extended the media dashboard with controlled render governance snapshots and recent controlled render packets.
- Added `ControlledMediaExecutionPanel` to `/content-studio` with approval ID input, render budget status, safety locks, scoring cards, blocked-reason display, and emergency shutdown controls.

### Safety

- Controlled rendering remains blocked by default unless media execution flags, activation stage, provider configuration, quotas, provider health, governance, approval verification, and kill switches all pass.
- No real ComfyUI request, FFmpeg command, GPU job, unrestricted video generation, binary write, public publishing, autonomous retry, fallback rendering, prompt mutation, workflow mutation, or platform execution was enabled.
- All render outputs are controlled execution packets and metadata-only asset records until a future explicitly approved worker/provider slice.
- Unsafe, malformed, low-quality, duplicate-risk, or failed-render recovery packets are marked for review or rejected.

### Verification

- Direct local `eslint .`: passed.
- Direct local `tsc --noEmit`: passed.
- Direct local `tsx --test "src/**/*.test.ts"`: passed, 124 tests.
- Direct local `prisma generate` plus `next build`: passed on Next.js `16.2.6`; `/api/media/controlled-render` and `/api/media/controlled-render/shutdown` are included in the build output.
- Local dev smoke for `/login`: passed in the in-app browser with no browser console errors.
- `npm audit --audit-level=moderate` still reports the known nested Next/PostCSS moderate advisory; no unsafe forced fix was applied.

## May 13, 2026 - Governed Analytics Intelligence & Feedback Loop System

### Added

- Added `src/lib/live-execution/analytics-operations.ts` with approved Analytics workflow registry, structured Gemini output schema, memory-aware analytics prompt contract, duplicate/quality warning hooks, and feedback-loop scoring.
- Added `GET/POST /api/live-execution/analytics/workflows` for governed Analytics-only workflows: content performance analysis, hook performance intelligence, audience retention analysis, platform performance, workflow performance analysis, strategic optimization recommendation, reflection-based analytics, and analytics quality scoring.
- Extended controlled live execution results with `analyticsWorkflowKind`, `gemini_analytics_operational_intelligence`, and analytics quality/optimization metadata.
- Added memory-aware Analytics retrieval from analytics, workflow, strategic, organizational, prompt memory, previous live workflow runs, and existing `AnalyticsRecord` snapshots.
- Added `LiveAnalyticsOperationsPanel` to `/analytics` for live Analytics dashboard controls, mock/internal signal inputs, future-hook status labels, execution trace preview, recommendation panels, and confidence/quality display.

### Safety

- The expansion forces Gemini + Analytics Department + `structured_generation` + `structured_output` only.
- Every workflow remains blocked unless the existing live activation gates pass: approval, persisted activation, credential, budget, quota, governance, provider health, sandbox promotion, and kill switches.
- No publishing, rendering, scheduling, platform account access, platform analytics APIs, media generation, autonomous retries, fallback providers, autonomous optimization execution, prompt mutation, or workflow mutation was enabled.
- Low-quality, low-confidence, duplicate-heavy, malformed, or unsafe analytics outputs are rejected as failed live executions.

### Verification

- Direct local `eslint .`: passed.
- Direct local `tsc --noEmit`: passed.
- Direct local `tsx --test "src/**/*.test.ts"`: passed, 120 tests.
- Direct local `prisma generate` plus `next build`: passed on Next.js `16.2.6`; `/api/live-execution/analytics/workflows` is included in the build output.
- Local dev smoke for `/login`: passed in the in-app browser with no browser console errors.
- `npm audit --audit-level=moderate` still reports the known nested Next/PostCSS moderate advisory; no unsafe forced fix was applied.

## May 13, 2026 - Governed Live Content Intelligence System

### Added

- Added `src/lib/live-execution/content-operations.ts` with approved Content workflow registry, structured Gemini output schema, platform-aware prompt contract, duplicate/safety warning hooks, and content quality scoring.
- Added `GET/POST /api/live-execution/content/workflows` for governed Content-only workflows: hook generation, script generation, caption generation, metadata optimization, thumbnail strategy, platform adaptation, content reflection, and content quality scoring.
- Extended controlled live execution results with `contentWorkflowKind`, `gemini_content_operational_intelligence`, and content quality metadata.
- Added memory-aware retrieval from prompt, analytics, strategic, workflow, and organizational memory plus previous live Content workflow runs before Gemini execution.
- Added `LiveContentOperationsPanel` to `/content-studio` for live Content dashboard controls, platform targets, workflow inputs, execution trace preview, draft previews, and confidence/quality display.

### Safety

- The expansion forces Gemini + Content Department + `structured_generation` + `structured_output` only.
- Every workflow remains blocked unless the existing live activation gates pass: approval, persisted activation, credential, budget, quota, governance, provider health, sandbox promotion, and kill switches.
- No publishing, rendering, scheduling, ComfyUI, FFmpeg, media generation, platform APIs, autonomous retries, fallback providers, self-improvement mutation, or workflow mutation was enabled.
- Low-quality, low-safety, duplicate-heavy, malformed, or unsafe outputs are rejected as failed live executions.

### Verification

- Direct local `eslint .`: passed.
- Direct local `tsc --noEmit`: passed.
- Direct local `tsx --test "src/**/*.test.ts"`: passed, 118 tests.
- Direct local `prisma generate` plus `next build`: passed on Next.js `16.2.6`; `/api/live-execution/content/workflows` is included in the build output.
- Local dev smoke for `/login`: passed with HTTP 200, and in-app browser verification loaded Folqen with no browser console errors.
- `npm audit --audit-level=moderate` still reports the known nested Next/PostCSS moderate advisory; no unsafe forced fix was applied.

## May 13, 2026 - Governed Live Research Department Expansion

### Added

- Added `src/lib/live-execution/research-operations.ts` with approved Research workflow registry, structured Gemini output schema, memory-aware prompt contract, duplicate/safety warning hooks, and research quality scoring.
- Added `GET/POST /api/live-execution/research/workflows` for governed Research-only workflows: trend analysis, competitor insight, topic intelligence, audience insight, strategic recommendation, research reflection, memory-aware retrieval, and research scoring.
- Extended controlled live execution results with `researchWorkflowKind`, `gemini_research_operational_intelligence`, and research quality metadata.
- Added memory-aware retrieval from existing memory/search services and previous live Research workflow runs before Gemini execution.
- Added `LiveResearchOperationsPanel` to `/research-intelligence` for live Research dashboard controls, memory-aware workflow inputs, execution trace preview, and confidence/quality display.

### Safety

- The expansion still forces Gemini + Research Department + `structured_generation` + planning only.
- Every workflow remains blocked unless the existing live activation gates pass: approval, persisted activation, credential, budget, quota, governance, provider health, sandbox promotion, and kill switches.
- No publishing, rendering, scheduling, platform APIs, media generation, autonomous retries, fallback providers, self-improvement mutation, or workflow mutation was enabled.
- Low-quality, low-safety, or duplicate-heavy outputs are rejected as failed live executions.

### Verification

- Direct local `eslint .`: passed.
- Direct local `tsc --noEmit`: passed.
- Direct local `tsx --test "src/**/*.test.ts"`: passed, 116 tests.
- Direct local `prisma generate` plus `next build`: passed on Next.js `16.2.6`; `/api/live-execution/research/workflows` is included in the build output.
- Local dev smoke for `/login`: passed with HTTP 200, and in-app browser verification loaded Folqen with no browser console errors.
- `npm audit --audit-level=moderate` still reports the known nested Next/PostCSS moderate advisory; no unsafe forced fix was applied.

## May 13, 2026 - First Real Live Gemini Research Ideation Capability

### Added

- Added `src/lib/live-execution/research-ideation.ts` with the Gemini Research ideation prompt contract, response JSON schema, and Zod validation for trend insights, topic suggestions, recommendations, risks, follow-up research, and safety flags.
- Added real Gemini structured-output execution support to the guarded live adapter using `generationConfig.responseMimeType="application/json"` and a response JSON schema.
- Added protected `POST /api/live-execution/research/ideation`, forcing Gemini + Research Department + structured content ideation only.
- Added persisted activation state through existing `Setting` records and approval verification against real approved `Approval` rows before any live call can run.
- Added live execution persistence through existing `WorkflowRun`, `AnalyticsRecord`, `ErrorLog`, `AuditLog`, and `EventLog` records.
- Updated the Tools AI Gateway panel with an approved activation ID field and live Research ideation output preview.

### Safety

- Providers are still off by default. Gemini live execution remains blocked unless env flags, server credential, persisted activation, approved activation ID, sandbox promotion, budget, quota, governance, provider health, and kill-switch checks all pass.
- No publishing, rendering, media generation, platform execution, autonomous retry, fallback routing, self-improvement mutation, scraping, or paid-provider expansion was enabled.
- Live Research ideation uses one queue attempt only and no fallback providers.
- Client-provided approval status is no longer trusted for live execution; the server verifies the approval record.

### Verification

- Direct local `tsc --noEmit`: passed.
- Direct local `tsx --test "src/lib/live-execution/**/*.test.ts"`: passed, 10 focused live execution tests.
- Direct local `eslint .`: passed.
- Direct local `tsx --test "src/**/*.test.ts"`: passed, 114 tests.
- Direct local `prisma generate` plus `next build`: passed on Next.js `16.2.6`; `/api/live-execution/research/ideation` is included in the build output.
- Local dev smoke for `/login`: passed with HTTP 200.
- `npm audit --audit-level=moderate` still reports the known nested Next/PostCSS moderate advisory; no unsafe forced fix was applied.

## May 13, 2026 - Controlled Live Execution Activation Layer

### Added

- Added `src/lib/live-execution/*` with staged activation, first-target config, runtime quotas, readiness gates, Gemini-only live adapter, activation requests, sandbox promotion evaluation, controlled live execution, emergency stop, provider disable/quarantine/rollback, dashboard read model, access helpers, and tests.
- Added protected `/api/live-execution/overview`, `/api/live-execution/activation/request`, `/api/live-execution/promote`, `/api/live-execution/execute`, `/api/live-execution/emergency-stop`, and `/api/live-execution/provider/action`.
- Added live activation controls to `/tools`: activation stages, first-target status, readiness reasons, gated live test, emergency stop, budget monitor, rollback state, and recent controlled run traces.
- Added env placeholders and validation for `ALLOW_LIVE_AI_EXECUTION`, `LIVE_AI_ACTIVATION_STAGE`, `AI_RUNTIME_KILL_SWITCH`, and `AI_RUNTIME_EMERGENCY_STOP`.
- Added `docs/CONTROLLED_LIVE_EXECUTION_ARCHITECTURE.md`.

### Safety

- Providers remain off by default.
- The only implemented live adapter is Gemini for Research Department structured content ideation.
- Live execution is blocked unless the env flag, activation stage, credential, approval ID, sandbox pass, quota, budget, governance, and kill-switch gates all pass.
- No schema migration, production deployment, credential change, real provider call, paid execution, public publishing, rendering, n8n execution, or platform account access was performed.

### Verification

- Direct local `tsc --noEmit`: passed.
- Direct local `tsx --test "src/lib/live-execution/**/*.test.ts"`: passed, 8 focused live activation tests.
- Direct local `eslint .`: passed.
- Direct local `tsx --test "src/**/*.test.ts"`: passed, 112 tests.
- Direct local `prisma generate` plus `next build`: passed on Next.js `16.2.6`.
- `npm audit --audit-level=moderate` still reports the known nested Next/PostCSS moderate advisory; no unsafe forced fix was applied.
- Local in-app browser smoke for `/login`: passed with no browser console errors.

## May 13, 2026 - AI Provider Gateway and Execution Runtime

### Added

- Added `src/lib/ai-gateway/*` with provider profiles, provider routing, fallback chains, token/cost estimation, budget and quota gates, response validation, LangGraph dry-run runtime flow, execution service, retry planning, dashboard read model, access helpers, and tests.
- Added mock-safe provider infrastructure for Folqen Mock Runtime, OpenRouter, Gemini, Claude, OpenAI-compatible APIs, and local/Ollama-ready endpoints.
- Added `folqen.ai.runtime` and `folqen.ai.retry` to the BullMQ orchestration queue registry.
- Added protected `/api/ai-gateway/overview`, `/api/ai-gateway/providers`, `/api/ai-gateway/execute`, and `/api/ai-gateway/retry`.
- Added an AI Provider Gateway panel to `/tools` with provider health, runtime simulation, execution traces, queue health, response validation, token/cost monitoring, and explicit status labels.
- Added `docs/AI_PROVIDER_GATEWAY_ARCHITECTURE.md`.

### Safety

- No schema migration was added; runtime persistence uses existing `WorkflowRun`, `AnalyticsRecord`, `EventLog`, and `AuditLog` where available.
- No OpenRouter, Gemini, Claude, OpenAI-compatible, Ollama/local, paid provider, credential, live model, or network provider call was enabled.
- Provider credentials alone do not enable execution. Future live adapters must pass governance approval, budget checks, rate/concurrency limits, response validation, and audit logging immediately before every request.

### Verification

- Direct local `tsc --noEmit`: passed.
- Direct local `tsx --test "src/lib/ai-gateway/**/*.test.ts"`: passed, 7 focused AI gateway tests.
- Direct local `eslint .`: passed.
- Direct local `tsx --test "src/**/*.test.ts"`: passed, 104 tests.
- Direct local `prisma generate` plus `next build`: passed on Next.js `16.2.6`.
- `npm audit --audit-level=moderate` still reports the known nested Next/PostCSS moderate advisory; no unsafe forced fix was applied.
- Local in-app browser smoke for `/login`: passed with no browser console errors.

## May 12, 2026 - Governance Approval and Safety Control layer

### Added

- Added `src/lib/governance/*` with execution policy engine, governance action registry, role/permission matrix, approval workflow service, sandbox execution simulation, cost governance, provider governance, dashboard read model, access helpers, and tests.
- Added `folqen.governance` and `folqen.sandbox` to the existing BullMQ orchestration queue registry.
- Added protected `/api/governance/overview`, `/api/governance/policy/evaluate`, `/api/governance/approvals/request`, `/api/governance/approvals/action`, and `/api/governance/sandbox`.
- Added approve/reject/escalate/retry/revoke governance action support without enabling live execution.
- Added a Governance Department panel to `/approvals` with policy simulator, approval request flow, sandbox testing, approval queue, provider governance, cost controls, compliance monitor, and role matrix.
- Added `docs/GOVERNANCE_SAFETY_ARCHITECTURE.md`.

### Safety

- No schema migration was added; governance uses existing `Approval`, `AuditLog`, `EventLog`, and queue metadata.
- No automatic provider activation, public publishing, paid tool execution, n8n workflow execution, account access, live queue worker execution, or media rendering was enabled.
- Approval records are not treated as sufficient for live execution; future adapters must still call policy checks immediately before execution.

### Verification

- Direct local `eslint .`: passed.
- Direct local `tsc --noEmit`: passed.
- Direct local `tsx --test "src/**/*.test.ts"`: passed, 97 tests.
- Direct local `prisma generate` plus `next build`: passed on Next.js `16.2.6`.
- `npm audit --audit-level=moderate`: still reports the known nested PostCSS moderate advisory under Next; `npm audit fix --force` would install a breaking Next path and was not run.

## May 12, 2026 - Platform Operations and Publishing Infrastructure layer

### Added

- Added `src/lib/platform-ops/*` with platform registry, publishing workflow registry, provider guards, LangGraph dry-run distribution flow, platform operations service, dashboard read model, access helpers, and tests.
- Added YouTube, Instagram, Threads, TikTok placeholder, LinkedIn, and X/Twitter platform operation infrastructure while keeping TikTok blocked as an India dependency.
- Added `folqen.publishing`, `folqen.scheduling`, and `folqen.publishing.retry` to the existing BullMQ orchestration queue registry.
- Added protected `/api/platform-ops/overview`, `/api/platform-ops/deployments`, `/api/platform-ops/adapt`, `/api/platform-ops/schedule`, `/api/platform-ops/distribute`, `/api/platform-ops/retry`, and `/api/platform-ops/analytics/collect`.
- Added a Platform Operations Department panel to `/platforms` with workflow runner, provider status, distribution tracking, deployment registry, failed retry planning, analytics ingestion planning, and monetization/policy watch.
- Added `docs/PLATFORM_OPERATIONS_ARCHITECTURE.md`.

### Safety

- No schema migration was added; platform operations persist through existing `WorkflowRun`, `AgentTask`, `EventLog`, `AuditLog`, and `AnalyticsRecord` models.
- No real platform account access, credential usage, n8n execution, browser automation, scraping, scheduling, analytics API read, public posting, paid API call, or monetization account action was enabled.
- TikTok and X/Twitter are handled as typed platform-operations registry values and JSON metadata only because the current Prisma `PlatformName` enum does not include them.

### Verification

- Direct local `eslint .`: passed.
- Direct local `tsc --noEmit`: passed.
- Direct local `tsx --test "src/**/*.test.ts"`: passed, 88 tests.
- Direct local `prisma generate` plus `next build`: passed on Next.js `16.2.6`.
- `npm audit --audit-level=moderate`: still reports the known nested PostCSS moderate advisory under Next; `npm audit fix --force` would install a breaking Next path and was not run.

## May 12, 2026 - Media Generation and Asset Pipeline layer

### Added

- Added the Media Generation & Asset Pipeline backend with thumbnail, shorts visual, script-to-scene, asset adaptation, rendering, subtitle, and optimization dry-run workflows.
- Added ComfyUI, FFmpeg, local worker, and mock media provider status guards; live execution remains blocked.
- Added `folqen.media` to the existing BullMQ orchestration queue registry.
- Added protected `/api/media/overview`, `/api/media/assets`, `/api/media/generate`, `/api/media/render`, and `/api/media/retry`.
- Added Content Studio media controls for workflow previews, provider readiness, asset registry, render queue, render logs, and failed render retry planning.
- Added `docs/MEDIA_PIPELINE_ARCHITECTURE.md`.

### Safety

- No schema migration was added; media registry/version/render history use existing `Asset` and `Render` metadata.
- No live ComfyUI request, GPU job, FFmpeg process, local worker job, binary storage write, paid provider call, or public publishing was enabled.
- Media outputs are dry-run plans and approval-gated metadata only.

### Verification

- Direct local `eslint .`: passed.
- Direct local `tsc --noEmit`: passed.
- Direct local `tsx --test "src/**/*.test.ts"`: passed, 80 tests.
- Direct local `prisma generate` plus `next build`: passed on Next.js `16.2.6`.
- `npm audit --audit-level=moderate`: still reports the known nested PostCSS moderate advisory under Next; `npm audit fix --force` would install a breaking Next path and was not run.

## May 12, 2026 - Organizational Memory and Reflection Intelligence layer

### Added

- Added pgvector-ready Prisma models and Supabase migration SQL for `MemoryEntry`, `MemoryReflection`, and `ExperimentRecord`.
- Added `docs/MEMORY_REFLECTION_ARCHITECTURE.md` covering memory categories, services, reflection flow, experiment tracking, prompt versioning, provider safety, APIs, and UI integration.
- Added `src/lib/memory/*` with typed memory services, provider status guards, deterministic mock semantic retrieval, LangGraph dry-run reflection flow, experiment tracking, prompt versioning, dashboard read model, and tests.
- Added protected `/api/memory/overview`, `/api/memory/search`, `/api/memory/ingest`, `/api/memory/reflect`, `/api/memory/experiments`, and `/api/memory/prompts/version`.
- Added a live mock-safe Organizational Memory panel to `/organizational-memory` for retrieval, ingestion, reflection, experiments, and recommendations.

### Safety

- No live Supabase migration was applied.
- No live embeddings provider, paid AI provider, workflow mutation, prompt promotion, public publishing, n8n execution, or destructive memory action was enabled.
- OpenAI/Gemini embedding providers are status-aware placeholders only; default memory retrieval remains `Mock`.

### Verification

- Direct local `eslint .`: passed.
- Direct local `tsc --noEmit`: passed.
- Direct local `tsx --test "src/**/*.test.ts"`: passed, 72 tests.
- Direct local `prisma generate` plus `next build`: passed on Next.js `16.2.6`.
- `npm audit --audit-level=moderate`: still reports the known nested PostCSS moderate advisory under Next; `npm audit fix --force` would install a breaking Next path and was not run.

## May 12, 2026 - Research and Content intelligence layer

### Added

- Added the first operational intelligence backend for the Research Department and Content Department.
- Added 11 typed specialist agents, covering trend research, competitor analysis, viral opportunity, audience insight, platform intelligence, topic selection, hooks, scripts, thumbnails, captions, and metadata.
- Added 8 LangGraph dry-run intelligence workflows with deterministic mock-safe outputs, queue integration, approval checkpoints, analytics/event persistence, and organizational memory hooks.
- Added mock-safe AI provider abstraction for Mock, OpenRouter, and Gemini; OpenRouter/Gemini remain blocked/not connected by default.
- Added protected `/api/intelligence/*` routes for departments, runs, research workflows, content workflows, and draft package creation.
- Wired `/research-intelligence` and `/content-studio` to live mock-safe department summaries and run controls while preserving the command-center UI.

### Safety

- No schema migration was added.
- No public scraping, RSS ingestion, social API call, paid AI call, media render, platform posting, or public publishing was enabled.
- Content package generation creates review-gated drafts only when the database is available; otherwise it returns metadata-only mock-safe output.

### Verification

- Direct local `eslint .`: passed.
- Direct local `tsc --noEmit`: passed.
- Direct local `tsx --test "src/**/*.test.ts"`: passed, 63 tests.
- Direct local `prisma generate` plus `next build`: passed on Next.js `16.2.6`.
- `npm audit --audit-level=moderate`: still reports the known nested PostCSS moderate advisory under Next; `npm audit fix --force` would install a breaking Next path and was not run.

## May 12, 2026 - Multi-agent orchestration infrastructure

### Added

- Added the Folqen orchestration backend with typed agent registry, required departments, hierarchy layers, lifecycle state, permissions, KPIs, workloads, and communication channels.
- Added LangGraph dry-run workflow planning, CrewAI-compatible hierarchy coordination, organizational memory hooks, incident recovery planning, monitoring hooks, in-memory/database event bus, Redis lazy connection, BullMQ queue adapters, and a worker entrypoint.
- Added protected orchestration API routes for registry, events, monitoring, task delegation, workflow runs, and incidents.
- Added Redis to Docker Compose and orchestration env defaults for mock-safe execution.
- Added `docs/ORCHESTRATION_ARCHITECTURE.md` and updated route/checklist docs.

### Safety

- Orchestration defaults to `ORCHESTRATION_EXECUTION_MODE=mock`.
- Redis/BullMQ are lazy-loaded and return mock job IDs unless live mode is explicitly configured.
- The worker exits unless Redis live mode and `ORCHESTRATION_WORKER_ENABLED=true` are both enabled.
- No real publishing, paid API call, browser automation, n8n execution, media rendering, or platform posting was enabled.

### Verification

- Direct local `eslint .`: passed.
- Direct local `tsc --noEmit`: passed.
- Direct local `tsx --test "src/**/*.test.ts"`: passed, 56 tests.
- Direct local `prisma generate` plus `next build`: passed on Next.js `16.2.6`.
- `npm audit --audit-level=moderate`: still reports the known nested PostCSS moderate advisory under Next; `npm audit fix --force` would install a breaking Next path and was not run.

## May 12, 2026 - Operational command center frontend

### Added

- Added the Folqen operational command center frontend module with typed mock view models, reusable command-center components, Framer Motion page transitions, shadcn-style `Button`, `Card`, and `Badge` primitives, and a Zustand store for command palette/sidebar/page UI state.
- Added new protected command-center routes: `/agents`, `/departments`, `/research-intelligence`, `/content-studio`, `/organizational-memory`, `/automations`, `/incident-center`, and `/infrastructure`.
- Rebuilt `/dashboard`, `/workflows`, and `/analytics` around the new AI organization command center renderer.
- Added a command-center overview section to `/settings` while preserving the existing live settings, connection wizard, provider setup panels, and password-change flow.
- Added command-center tests confirming all 12 requested operational pages expose mock-safe data and keep risky execution visibly blocked.

### Changed

- Updated the protected sidebar into a collapsible command-center navigation with groups for Command Center, Creator Ops, and Control.
- Updated the topbar search trigger and command palette to search/open agents, workflows, incidents, memory, infrastructure, and existing Folqen workspaces.
- Added `zustand` and patched Next.js / `eslint-config-next` from `16.2.4` to `16.2.6` to remove the high-severity Next audit advisory while staying on Next 16.

### Verification

- Direct local `eslint .`: passed.
- Direct local `tsc --noEmit`: passed.
- Direct local `tsx --test "src/**/*.test.ts"`: passed, 52 tests.
- Direct local `prisma generate` plus `next build`: passed on Next.js `16.2.6`.
- React server-render smoke rendered all 12 command-center views with expected titles.
- `npm audit --audit-level=moderate`: still reports the known nested PostCSS moderate advisory under Next; npm only offers `npm audit fix --force`, which would install a breaking Next version path and was not run.

## May 12, 2026 - Autonomous organization architecture

### Added

- Added `docs/AUTONOMOUS_ORGANIZATION_ARCHITECTURE.md` with the target Folqen design as an autonomous AI creator organization operating system.
- Covered the agent hierarchy, workflow orchestration, communication architecture, database model direction, provider/service breakdown, frontend/backend architecture, deployment strategy, security guards, error recovery, analytics, approvals, and phased roadmap.

### Changed

- Updated `docs/ARCHITECTURE.md` to point future Codex runs to the full autonomous organization architecture document.
- Documented the current stack mismatch decision: the user requested Next.js 15, while the repository currently runs Next.js `16.2.4`; do not downgrade without explicit human approval.

### Verification

- Direct local `eslint .`: passed.
- Direct local `tsc --noEmit`: passed.
- Direct local `tsx --test "src/**/*.test.ts"`: passed, 50 tests.
- Direct local `prisma generate` plus `next build`: passed.
- The shell `npm` command was not available on PATH in this session, so verification used the checked-in `node_modules/.bin` executables.

## May 7, 2026 - Platform-tab connection wizard

### Added

- Added the secure Connection Wizard directly to the `/platforms` page.
- Limited the `/platforms` wizard to social providers: YouTube, Instagram, Facebook, Snapchat, and Threads.

### Changed

- Made `ConnectionWizard` reusable with filtered provider lists, custom initial provider, title, and description.

### Verification

- Direct-Node `eslint .`: passed.
- Direct-Node `tsc --noEmit`: passed.
- Direct-Node `tsx --test "src/**/*.test.ts"`: passed, 50 tests.
- Direct-Node `prisma generate` plus `next build`: passed.
- `vercel deploy --prod --yes`: passed and production deployment is `dpl_ALmjdGauRufNMLbwekdEvWQtb3jC`.
- Production smoke test confirmed marked login returned 200, `/platforms` returned 200, the page contained `Connect your social platforms`, `YouTube`, and `Never enter social media passwords`, and health returned 200.

## May 7, 2026 - In-app connection wizard

### Added

- Added `/settings` Connection Wizard for Google Drive, OpenAI, n8n, YouTube, Instagram, Facebook, Snapchat, and Threads setup details.
- Added encrypted credential vault helpers and credential-vault tests.
- Added admin-only `POST /api/connections/intake` for encrypted provider credential intake.
- Added connection definitions for required provider fields and safety notes.

### Changed

- Google Drive upload and n8n connection test paths can read saved encrypted credentials from Supabase when env values are not present.
- Preserved an inactive generated root scaffold under `docs/prototypes/ai-studio-generated/root-scaffold/` so the real app builds from `src/app`.
- Restored conflicted config/docs/schema files to the active Folqen branch content and regenerated `package-lock.json`.

### Verification

- `npm install`: passed and regenerated a valid lockfile.
- Direct-Node `eslint .`: passed.
- Direct-Node `tsc --noEmit`: passed.
- Direct-Node `tsx --test "src/**/*.test.ts"`: passed, 50 tests.
- Direct-Node `prisma generate` plus `next build`: passed.
- `vercel deploy --prod --yes`: passed and production deployment is `dpl_BAMpFrvAqbL3Kjup1zgmbrLsYrFi`.
- Production smoke test confirmed marked login returned 200, `/settings` returned 200 and contained `Connection wizard`, anonymous connection intake returned 401, and `/api/health` returned 200.

## May 7, 2026 - Two-day launch readiness

### Added

- Added `docs/2_DAY_LAUNCH_PLAN.md` for the requested two-day launch sprint.
- Added launch readiness logic and tests in `src/lib/launch-readiness.ts`.
- Added a Day-3 channel launch readiness section to the dashboard.

### Changed

- README and checkpoint docs now clarify the practical day-3 scope: protected planning, manual posting packages, approvals, audit, and carefully tested provider setup if secrets are available.

### Verification

- Direct-Node `eslint .`: passed.
- Direct-Node `tsc --noEmit`: passed.
- Direct-Node `tsx --test "src/**/*.test.ts"`: passed, 47 tests.
- Direct-Node `prisma generate` plus `next build`: passed.
- `vercel deploy --prod --yes`: passed and production deployment is `dpl_BFZXN75c5GikDQHHLMcVLFmCPAYc`.
- Production smoke test confirmed marked login returned 200, authenticated `/dashboard` returned 200, the dashboard contained `Day-3 channel launch readiness`, and `/api/health` returned 200.

## May 7, 2026 - App-marked mutation hardening

### Added

- Added `src/lib/security/mutation-headers.ts` with a shared Folqen UI mutation marker.
- Added `src/lib/client/mutation-fetch.ts` so client actions consistently send the app marker.
- Added request-guard tests for missing app mutation markers.

### Changed

- Sensitive mutation guard logic now requires same-origin validation, the Folqen UI marker, and rate limiting.
- Updated login, logout, settings, password change, approvals, provider approvals, file upload, posting packages, and agent actions to use the shared mutation fetch helper.

### Verification

- Direct-Node `eslint .`: passed.
- Direct-Node `tsc --noEmit`: passed.
- Direct-Node `tsx --test "src/**/*.test.ts"`: passed, 45 tests.
- Direct-Node `prisma generate` plus `next build`: passed.
- `vercel deploy --prod --yes`: passed and production deployment is `dpl_2RTVV3b99t492Fmz7QEKDzN7ztby`.
- Production Node smoke test confirmed marked login returned 200, authenticated `/dashboard` returned 200, and unmarked login returned 403.
- Production `/api/health` returned 200 with database `live`.

## May 7, 2026 - Visible hardening, mutation safety, and speed fix

### Added

- Added `vercel.json` with Vercel Functions pinned to Seoul (`icn1`) so server/database calls run close to the Supabase Seoul project instead of the default Washington, DC region.
- Added mobile sidebar drawer behavior for authenticated routes.
- Added global toast notifications and wired them into settings, password change, approvals, provider approvals, file registration, posting packages, copy actions, and agent actions.
- Improved the command palette so it searches and navigates to real Folqen routes while keeping action statuses visible.
- Added copy controls for posting package descriptions and checklists.
- Added same-origin and rate-limit helpers for sensitive mutation routes.
- Added tests for same-origin and rate-limit behavior.

### Safety

- No provider secrets, OAuth credentials, OpenAI key, n8n secret, media worker secret, or platform credentials were added.
- n8n connection testing now requires an authenticated admin instead of being an unauthenticated endpoint.
- Admin password rotation remains available through `/settings`, but no password was changed because no new password was provided in this session.
- Public publishing, paid tools, browser automation, platform OAuth, real AI calls, real n8n workflows, and media rendering remain blocked.

### Verification

- Direct-Node `eslint .`: passed.
- Direct-Node `tsc --noEmit`: passed.
- Direct-Node `tsx --test "src/**/*.test.ts"`: passed, 43 tests.
- Direct-Node `prisma generate` plus `next build`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app` to deployment `dpl_Hiv9rAEboJVTmRG2bJ4CWRf9Mp6G`.
- `vercel inspect`: confirmed app functions are deployed in `icn1`.
- `GET https://folqen.vercel.app/api/health`: returned database status `live`.
- Timing check from this machine after deploy: `/api/health` total time improved from about `1.47s` before the region fix to about `0.56s`; authenticated `/dashboard` measured about `0.09s`.

## May 7, 2026 - Cross-account checkpoint after Drive adapter

### Changed

- Added a documentation-only save point after the Google Drive adapter and Vercel database health recovery were committed and pushed.
- Confirmed the next Codex account should resume from branch `build/phase-0-foundation` at or after commit `1a78e1b`.

### Verification

- `git status --short --branch`: clean.
- Latest commit before this checkpoint: `1a78e1b Add Google Drive storage adapter`.
- `GET https://folqen.vercel.app/api/health`: returned database status `live`.
- No source code, schema, secrets, provider credentials, Supabase data, or production settings were changed for this checkpoint.

## May 7, 2026 - Google Drive private storage adapter

### Added

- Added a server-only Google Drive storage adapter using Google's OAuth token refresh and Drive resumable upload flow.
- Updated `POST /api/files/upload` so configured Drive env stores validated files in the private Drive folder and records `google-drive://` paths.
- Kept the honest metadata-only fallback when Drive env values are missing.
- Added Drive storage tests for missing env, token refresh/upload flow, and no-secret failure messages.
- Added safe database health diagnostics that classify connection failures without exposing the database URL or password.
- Updated README continuation notes for the Drive adapter fallback and Supabase pooler status.

### Fixed

- Rotated the encrypted Vercel production `DATABASE_URL` from the stale/failing value to the verified Supabase transaction pooler connection.
- Confirmed the linked Supabase project remains `ACTIVE_HEALTHY` and that the local transaction pooler check succeeds before updating Vercel.

### Safety

- No Google Drive secret was committed or printed.
- No database password or connection string was committed or printed.
- No live Drive upload was attempted because Drive OAuth env values are still missing.
- The upload route still records private metadata only when Drive is `Not connected`.
- Public sharing remains disabled; the adapter does not create public links.

### Verification

- Direct-Node `eslint .`: passed.
- Direct-Node `tsc --noEmit`: passed.
- Direct-Node `tsx --test "src/**/*.test.ts"`: passed, 39 tests.
- Direct-Node `prisma generate` plus `next build`: passed.
- Local Prisma `SELECT 1` against Supabase transaction pooler: passed.
- `vercel env rm DATABASE_URL production --yes`: passed.
- `vercel env add DATABASE_URL production --sensitive`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app` to deployment `dpl_GGJ5SVVnLnqVXJRXWvx6H9q2m7bN`.
- `GET https://folqen.vercel.app/api/health`: returned database status `live`; Google Drive/OpenAI/n8n/media remained `not_connected`.
- Anonymous `POST https://folqen.vercel.app/api/files/upload`: returned 401.
- Official implementation references: Google Drive upload guide and Google OAuth web-server refresh-token guide.
- Official database reference: Supabase recommends pooler/transaction mode for temporary serverless connections.

## May 7, 2026 - Provider approval API test coverage

### Added

- Added route-independent provider approval handler logic so the API can be tested without real cookies or Supabase writes.
- Added authenticated provider approval tests for anonymous users, viewers, admin success, duplicate pending approvals, invalid request types, and no-secret approval payloads.

### Safety

- No real account cleanup, provider secret, Google Drive write, OpenAI call, n8n workflow, media render, or database schema change was performed.
- Admin password rotation and viewer account deletion/rotation remain blocked until the human provides a new password and approves the account action.

### Verification

- `npm install`: passed through the temporary Node runtime.
- Direct-Node `eslint .`: passed.
- Direct-Node `tsc --noEmit`: passed.
- Direct-Node `tsx --test "src/**/*.test.ts"`: passed, 34 tests.
- Direct-Node `prisma generate` plus `next build`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- `GET https://folqen.vercel.app/api/health`: returned database status `live`.
- Anonymous `POST /api/provider-approvals/request`: returned 401.

## May 7, 2026 - Cross-account save checkpoint

### Changed

- Created an explicit continuation checkpoint after provider setup approval requests were pushed and deployed.
- Confirmed the next Codex account should resume from `build/phase-0-foundation`.
- Re-stated that real Google Drive, OpenAI, n8n, media worker, platform, and publishing work still require secrets and approval gates.

### Verification

- `git status --short --branch`: clean before checkpoint docs.
- Latest feature commit before this checkpoint: `15ec121 Add provider setup approval requests`.
- No feature code, database schema, Vercel env, Supabase data, or production credential was changed in this checkpoint.

## May 7, 2026 - Provider approval requests

### Added

- Added approval request definitions for Google Drive storage, OpenAI paid-agent calls, n8n workflow access, and media worker setup.
- Added authenticated admin-only `POST /api/provider-approvals/request`.
- Added Settings page buttons that create provider setup approval records without storing secrets.
- Added audit logging for provider setup approval requests.
- Added tests confirming provider approval requests do not include secrets and keep risky actions blocked.

### Safety

- Approval requests create database rows only.
- No Google Drive OAuth, OpenAI call, n8n workflow, media render, file upload, platform action, or public publishing is executed.
- Duplicate pending approval requests are reused instead of creating repeated pending rows.

### Verification

- Direct-Node `eslint .`: passed.
- Direct-Node `tsc --noEmit`: passed.
- Direct-Node `tsx --test "src/**/*.test.ts"`: passed, 29 tests.
- Direct-Node `prisma generate` plus `next build`: passed.

## May 7, 2026 - Provider setup surfaces

### Added

- Added Google Drive as the planned cloud storage provider with setup placeholders and runtime `Not connected` status.
- Added OpenAI model selection preferences, including a default model dropdown and custom model ID option.
- Added provider setup panels in Settings for Google Drive, OpenAI, n8n, and media tools.
- Added n8n workflow builder embed surface in `/workflows`; it stays disabled until a trusted self-hosted n8n URL is configured.
- Added runtime status rows for OpenAI, Google Drive, n8n, FFmpeg, ComfyUI, TTS, and the local/Oracle worker.
- Added provider config tests for default blocked/not-connected behavior.

### Safety

- No Google Drive, OpenAI, n8n, FFmpeg, ComfyUI, TTS, or worker secret was committed.
- Real OpenAI calls remain blocked until an API key is configured and a paid-tool approval flow is added.
- n8n embedding and webhook execution remain `Not connected` until the instance URL, webhook URL, and shared secret are configured.
- File registration remains metadata-only until Drive-backed binary storage is implemented.

### Verification

- Direct-Node `eslint .`: passed.
- Direct-Node `tsc --noEmit`: passed.
- Direct-Node `tsx --test "src/**/*.test.ts"`: passed, 27 tests.
- Direct-Node `prisma generate` plus `next build`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- `GET https://folqen.vercel.app/api/health`: returned database status `live` and provider statuses as `not_connected`.
- Authenticated production `/settings`, `/tools`, and `/workflows` returned 200 and showed provider setup surfaces.
- Authenticated production `POST /api/settings`: saved `openAiModel` and `storageProvider` preferences without storing secrets.

## May 7, 2026 - File registration and safe draft creation

### Added

- Added authenticated `POST /api/files/upload` for strict file validation and private Supabase `UploadedFile` records.
- Added Files page upload form with allowed file picker, tags, validation feedback, and metadata-only storage honesty.
- Added optional small text preview capture for text-like uploads.
- Added Library copy controls for posting package captions and hashtags.
- Added authenticated `POST /api/agent/content-package` to create draft content, task, approval, and audit records from a topic using the mock agent.
- Added draft-content role permission helper and tests.

### Safety

- Upload registration does not claim binary object storage; `binaryStored` remains false until Supabase Storage is configured.
- Draft package creation uses no live AI provider, paid tool, renderer, workflow, browser automation, platform upload, or public publishing.
- Anonymous upload and draft creation return 401.

### Verification

- Direct-Node `eslint .`: passed.
- Direct-Node `tsc --noEmit`: passed.
- Direct-Node `tsx --test "src/**/*.test.ts"`: passed, 25 tests.
- Direct-Node `prisma generate` plus `next build`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- `GET https://folqen.vercel.app/api/health`: returned database status `live`.
- Anonymous upload and draft creation checks returned 401.
- Authenticated production file registration returned 200 and `binaryStored: false`.
- Authenticated production draft creation returned 200 and created a `DRAFT` content record.

## May 7, 2026 - Posting package detail and download

### Added

- Added authenticated `GET /api/posting-packages/[assetId]/download`.
- Added manual package metadata validation and JSON download formatting helpers.
- Added Library package detail cards with caption, hashtags, checklist preview, and download action.
- Added tests that confirm downloaded packages remain manual-only and do not claim publishing.

### Safety

- Downloading a package creates only an audit log and returns JSON to the logged-in user.
- No platform upload, public publishing, paid tool use, browser automation, or new credential was enabled.
- Anonymous package downloads return 401.

### Verification

- Direct-Node `eslint .`: passed.
- Direct-Node `tsc --noEmit`: passed.
- Direct-Node `tsx --test "src/**/*.test.ts"`: passed, 23 tests.
- Direct-Node `prisma generate` plus `next build`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- `GET https://folqen.vercel.app/api/health`: returned database status `live`.
- Unauthenticated `GET /api/posting-packages/not-real/download`: returned 401.
- Authenticated production package create/download smoke test returned 200 and confirmed manual-only JSON.

## May 7, 2026 - Session save point

### Changed

- Created an explicit end-of-session checkpoint for continuing this chat/session safely.
- Confirmed the latest deployed state includes manual posting packages, role-aware approval controls, route-specific authenticated pages, upload validation foundations, and mock service interfaces.

### Verification

- `git status`: clean before save-point docs.
- `GET https://folqen.vercel.app/api/health`: returned database status `live`.
- No feature code or production configuration was changed in this save-point entry.

## May 7, 2026 - Manual posting packages and role-aware controls

### Added

- Added manual posting package generation for not-connected platforms.
- Added `POST /api/posting-packages/manual`, which creates a `posting_package` asset and audit log without uploading or publishing.
- Added a Library page action to create a manual package for the first target platform on a content item.
- Added role-aware approval UI states so viewers see disabled actions with an explicit role message.
- Added permission tests for admin/operator/viewer behavior.
- Updated README continuation notes for the current state.

### Safety

- Manual package generation does not publish content, connect platform APIs, or spend money.
- Only admins and operators can create posting packages or review approvals.
- Viewers remain read-only for approval and posting-package actions.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 21 tests.
- `npm run build`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- `GET https://folqen.vercel.app/api/health`: returned database status `live`.
- Unauthenticated `POST /api/posting-packages/manual`: returned 401 login required.

## May 7, 2026 - Service interface foundation

### Added

- Added service interface types for agent, workflow, render, publishing, analytics, storage, and notifications.
- Added mock service implementations that keep external providers, storage writes, workflow execution, public publishing, and live analytics blocked by default.
- Added tests for blocked public publishing, manual posting package mode, storage validation without writes, and blocked workflow execution.

### Safety

- No real provider, n8n, render, storage, analytics, platform, or publishing integration was enabled.
- Service methods return `mock` or `not_connected` states until real configuration and approval gates are added.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 15 tests.
- `npm run build`: passed.

## May 7, 2026 - File upload validation foundation

### Added

- Added upload candidate validation for allowed MIME types, matching extensions, safe file names, path traversal prevention, positive file size, and a 100 MB MVP limit.
- Added focused tests for supported files, path traversal, MIME/extension mismatch, oversize files, and unsupported file types.

### Safety

- No upload endpoint, file storage write, or public file access was enabled.
- This is a validation foundation only; actual uploads still require role checks, privacy defaults, storage path isolation, confirmations where needed, and audit logs.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 11 tests.
- `npm run build`: passed.

## May 7, 2026 - Route-specific calendar monetization brand and files pages

### Added

- Added server-side data loading for calendar, monetization, brand, and files pages.
- Replaced `/calendar` placeholder with Supabase-backed content schedule and approval-blocker views.
- Replaced `/monetization` placeholder with safe revenue-readiness and analytics signal views while payment access remains off.
- Replaced `/brand` placeholder with brand direction, safety boundaries, and content record views.
- Replaced `/files` placeholder with read-only uploaded-file and asset inventory views.

### Safety

- File uploads are still disabled until strict validation, storage, role checks, confirmations, and audit logs are implemented.
- Payment/monetization actions remain disabled and require human approval.
- Calendar auto-scheduling and public posting remain disabled.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed after correcting the settings helper import.
- `npm run test`: passed, 6 guard tests.
- `npm run build`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- `GET https://folqen.vercel.app/api/health`: returned database status `live`.
- Unauthenticated `GET /files` and `GET /calendar`: returned 307 login redirects.

## May 7, 2026 - Database-backed operations pages

### Added

- Added shared server-side operations data loading for notifications, analytics, errors, workflows, and upgrades.
- Replaced `/notifications` placeholder with Supabase-backed notification records and read/risk states.
- Replaced `/analytics` placeholder with Supabase-backed analytics records while keeping live platform analytics marked as not connected.
- Replaced `/errors` placeholder with Supabase-backed error records and recovery guidance.
- Replaced `/workflows` placeholder with Supabase-backed workflow/provider status while keeping n8n execution gated.
- Replaced `/upgrades` placeholder with Supabase-backed upgrade proposals, findings, scores, test plans, and rollback plans.

### Safety

- No workflows, upgrades, external analytics, platform publishing, paid tools, or browser automation were enabled.
- All operations pages are read-only until role-checked actions, confirmations, and audit logs are added.
- Upgrade execution remains blocked by default and requires human approval.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 6 guard tests.
- `npm run build`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- `GET https://folqen.vercel.app/api/health`: returned database status `live`.
- Unauthenticated `GET /notifications` and `GET /upgrades`: returned 307 login redirects.

## May 7, 2026 - Database-backed platforms and tools pages

### Added

- Added server-side platform data loading from Supabase `PlatformConnection` records.
- Added a route-specific `/platforms` screen with India-first platform tiers, connection status, manual posting fallback, and approval reminders.
- Added server-side tool data loading from Supabase `ProviderRegistryItem`, `ToolLimit`, and runtime integration status checks.
- Added a route-specific `/tools` screen with provider status, tool limits, runtime connection status, cost guard, and local-first setup notes.

### Safety

- No OAuth, platform credentials, paid tools, rendering, or workflow execution were enabled.
- Every platform/tool that is not configured remains clearly labeled `Not connected` or equivalent.
- Public publishing, paid tools, browser automation, and platform posting remain blocked.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 6 guard tests.
- `npm run build`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- `GET https://folqen.vercel.app/api/health`: returned database status `live`.
- Unauthenticated `GET /platforms` and `GET /tools`: returned 307 login redirects.

## May 7, 2026 - Database-backed pipeline and library pages

### Added

- Added server-side pipeline data loading from Supabase `AgentTask`, `WorkflowRun`, `Approval`, and `ErrorLog` records.
- Added a route-specific `/pipeline` screen with live task progress, approval/error attention queue, workflow run state, and publishing guard reminders.
- Added server-side library data loading from Supabase `ContentItem`, `Asset`, `UploadedFile`, and `Render` records.
- Added a route-specific `/library` screen with content package status, review/safety/copyright checks, asset/file/render sections, and manual posting package honesty.

### Safety

- No database schema changes or migrations were made.
- Public publishing, paid tools, browser automation, n8n, ComfyUI, FFmpeg, and platform integrations remain blocked or `Not connected`.
- Pipeline controls remain read-only until service adapters and role-checked actions are implemented.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 6 guard tests.
- `npm run build`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- `GET https://folqen.vercel.app/api/health`: returned database status `live`.
- Unauthenticated `GET /pipeline` and `GET /library`: returned 307 login redirects.

## May 6, 2026 - Sidebar overlap hotfix

### Fixed

- Fixed the authenticated app sidebar so the `Approval gates active` safety card no longer overlaps the lower navigation items on desktop-height screens.
- Converted the sidebar into a vertical flex layout with a scrollable route list and a fixed-in-flow safety card.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 6 guard tests.
- `npm run build`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- `GET https://folqen.vercel.app/api/health`: returned database status `live`.

## May 6, 2026 - End-of-session handoff checkpoint

### Changed

- Refreshed README continuation notes for another Codex account.
- Clarified the current live state: Supabase, login, dashboard, settings, approvals, audit, and persistent mock agent chat are working.
- Updated stale risk/handoff wording so tomorrow's continuation starts from the correct source of truth.

### Verification

- Repository status checked before handoff.
- Production health endpoint still reports database `live`.
- No code or production configuration changes were made in this checkpoint.

## May 6, 2026 - Test viewer and live dashboard data

### Added

- Created a low-privilege `VIEWER` test account in Supabase for dashboard testing.
- Added server-side dashboard data loading from Supabase.
- Updated `/dashboard` to show real counts, active jobs, pending approvals, platform statuses, tool limits, and recent audit activity.

### Safety

- Test account is viewer-only and cannot change settings or approve/reject items.
- Test password is not committed to the repository docs.
- Dashboard still shows platform/tool integrations as `Not connected` unless truly configured.

### Verification

- Test viewer production login returned 200.
- Test viewer production `/dashboard` returned 200.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 6 guard tests.
- `npm run build`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- Live dashboard contained `Live database` and `Now powered by Supabase records`.
- `GET /api/health`: returned database status `live`.

## May 6, 2026 - Real backend controls phase

### Added

- Admin password-change API and settings-page form.
- Database-backed settings page and safe settings update API.
- Approval center backed by Supabase records with approve/reject API and audit logging.
- Audit trail page backed by Supabase `AuditLog` records.
- Persistent agent chat page and message API using Supabase `AgentMessage` records.
- Shared audit helper and role permission helpers.

### Safety

- Settings updates keep public publishing, paid tools, and browser automation locked off.
- Approval decisions do not publish content or execute paid tools.
- Agent replies remain clearly marked as mock until a real AI provider is configured.
- Password changes and approval decisions create audit entries.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed after tightening Prisma JSON metadata typing.
- `npm run test`: passed, 6 guard tests.
- `npm run build`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- Production login returned 200.
- Production `/settings`, `/approvals`, `/audit`, and `/agent` returned 200 with expected page text.
- Production settings save returned 200 using safe values.
- Production agent message save returned 200 and returned persisted messages.

## May 6, 2026 - Landing gradient text hotfix

### Fixed

- Fixed neon gradient text rendering as a solid green rectangle on the live landing page in Chrome.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 6 guard tests.
- `npm run build`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- Headless Chrome screenshot of the live homepage confirmed the headline renders as text, not a block.
- `GET /api/health`: returned database status `live`.

## May 6, 2026 - Supabase production database live

### Added

- Applied the Prisma schema to Supabase project `eobvgajgyvydqydlfken` through `supabase db query --linked`.
- Enabled row level security on all 22 public Folqen tables.
- Seeded the Supabase database with the admin user, safety settings, platform statuses, content, approval, analytics, notification, and upgrade proposal data.
- Added Vercel production `DATABASE_URL` as a sensitive env var without committing or printing the value.

### Changed

- Updated `npm run build` to run `prisma generate && next build` so Vercel deployments generate a fresh Prisma Client.
- Redeployed production at `https://folqen.vercel.app`.

### Verification

- `npm install`: passed in the fresh worktree after setting the temporary Node runtime on PATH.
- `supabase projects list`: passed; linked project is `Folqen`.
- Supabase table count check: passed; 22 public tables created.
- RLS verification: passed; all 22 public tables report RLS enabled.
- `npm run db:generate`: passed.
- `npm run db:seed`: passed against the Supabase session pooler.
- Seed verification: passed; admin user, 10 platforms, safety settings, approval, and upgrade proposal exist.
- `vercel env add DATABASE_URL production --sensitive`: passed.
- First Vercel redeploy exposed a Prisma stale-client issue.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 6 guard tests.
- `npm run build`: passed and generated Prisma Client before Next build.
- Second `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- `GET /api/health`: returned database status `live`.
- `POST /api/auth/login`: returned 200 for the seeded admin account.
- Authenticated `GET /dashboard`: returned 200 and contained the dashboard/logout UI.

## May 6, 2026 - Safe Supabase checkpoint

### Added

- Documented the fresh Supabase project connection as a safe continuation checkpoint.
- Recorded the linked Supabase project reference `eobvgajgyvydqydlfken` and Seoul region.
- Added next-step guidance to apply schema through `supabase db query --linked` instead of the failing direct database host path.

### Verification

- `supabase projects list`: passed and showed linked project `Folqen`.
- `supabase db query "select current_database() as database_name, current_user as user_name;" --linked -o json`: passed.
- Prisma schema SQL generation to a temporary local file: passed.

### Not Changed

- No Supabase schema was applied.
- No seed data was inserted.
- No Vercel `DATABASE_URL` was added.
- No production redeploy was started from this partial Supabase step.

## May 6, 2026 - Authentication foundation

### Added

- Custom login page at `/login`.
- Auth APIs for login, logout, and current user.
- Signed HTTP-only session cookie helpers.
- Current-user lookup helper backed by Prisma.
- Protected app route proxy in `src/proxy.ts`.
- Authenticated app layout guard for dashboard routes.
- Topbar user display and logout button.
- `bcryptjs` password hashing.
- Seed script now hashes `admin@example.com` / `ChangeMe123!`.
- Preserved generated prototype files under `docs/prototypes/ai-studio-generated/`.

### Changed

- Excluded `docs/prototypes/**` from active TypeScript compilation.
- Added production Vercel `AUTH_SECRET` without printing or committing the value.

### Verification

- `npm install bcryptjs`: passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 6 tests.
- `prisma validate`: passed with local development `DATABASE_URL`.
- `npm run build`: passed.
- `vercel deploy --prod --yes`: passed.
- `GET https://folqen.vercel.app`: returned 200.
- `GET https://folqen.vercel.app/login`: returned 200.
- `GET https://folqen.vercel.app/dashboard` without session: returned 307 redirect to login.

## May 6, 2026 - Deployment and real-data foundation

### Added

- Deployment plan for Vercel + free PostgreSQL + Oracle Free Tier n8n worker.
- Vercel production deployment at `https://folqen.vercel.app`.
- `.vercelignore` to keep env files out of CLI deployment uploads.
- Real-data testing plan with safe testing order and recovery notes.
- Database scripts for Prisma generate, push, seed, and studio.
- Prisma seed script with realistic mock records for safety settings, content, approvals, platform statuses, provider registry items, analytics, notifications, and upgrade proposal data.
- Lazy Prisma client and database status helper.
- Integration status API at `GET /api/integrations/status`.
- n8n webhook test API at `POST /api/integrations/n8n/test`.
- Expanded health API with dynamic integration status.
- Additional env placeholders for app base URL, Oracle n8n, and local worker secrets.

### Changed

- Upgraded Next.js to `16.2.4`, React to `19.2.5`, React DOM to `19.2.5`, and matching Next ESLint config/types.
- Updated ESLint to use Next's flat config exports.
- Added Node engine requirement `>=20.9.0`.
- Updated README with the selected deployment architecture.
- Linked Vercel project `rayalasai874-4182s-projects/folqen`.
- Added non-secret production env values for `APP_BASE_URL` and `NEXTAUTH_URL`.

### Verification

- `npm install next@latest react@latest react-dom@latest eslint-config-next@latest @types/react@latest @types/react-dom@latest`: passed.
- `npx prisma generate`: passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 6 tests.
- `prisma validate`: passed with local development `DATABASE_URL`.
- `npm run build`: passed on Next.js `16.2.4`.
- `npm audit --omit=dev`: still reports 2 moderate Next/PostCSS advisories; no unsafe forced downgrade applied.
- `vercel link --yes --project folqen --scope rayalasai874-4182s-projects`: passed.
- `vercel deploy --prod --yes`: passed.
- `GET https://folqen.vercel.app`: returned 200.
- `GET https://folqen.vercel.app/api/health`: returned `status: ok`, Vercel configured, database/n8n not connected.

## May 5, 2026 - Phase 1 verification and Phase 2 shell start

### Added

- npm lockfile and verified dependency install.
- Prisma schema foundation with required MVP models and enums.
- Environment validation in `src/lib/env.ts`.
- Safety guards and focused tests in `src/lib/security`.
- Provider registry type foundation in `src/lib/providers.ts`.
- App route registry in `src/lib/app-routes.ts`.
- App shell with sidebar, topbar, command palette, notifications, mini agent chat, reusable cards, badges, empty/loading states, and confirmation dialog.
- Placeholder pages for all required MVP routes.
- Expanded README setup instructions.
- Architecture, security, route map, provider, plugin, upgrade, and failure recovery docs.
- Security headers in `next.config.ts`.
- Expanded health route response with safety and integration status.

### Changed

- Merged the newer `main` AGENTS.md update into `build/phase-0-foundation`.
- Replaced deprecated `next lint` script with `eslint .`.
- Removed unused homepage icon import.
- Kept neon green dark cyber/glass UI direction.

### Verification

- `npm install`: passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 6 tests.
- `prisma validate`: passed with local development `DATABASE_URL`.
- `npm run build`: passed, 23 app routes generated.
- Dev server HTTP checks passed for `/`, `/dashboard`, and `/platforms`.

### Limitations

- In-app browser screenshot verification was unavailable due missing `agent-browser` CLI and browser-use Node runtime access denial.
- `npm audit` reports two moderate Next/PostCSS advisories; no safe automatic fix was applied.

## May 6, 2026 - Template alignment and dashboard next phase

### Added

- Re-inspected the uploaded `display-perfect-mirror-main.zip` template.
- Ported more template structure into the Folqen landing page: sticky glass header, expanded feature sections, how-it-works, product preview, empty states, use cases, build-ready section, CTA, FAQ, and footer.
- Added missing template-inspired theme tokens for card, popover, accent, secondary, destructive, chart, sidebar, input, and ring colors.
- Started the next Phase 2 UI step with a dedicated dashboard screen showing active jobs, approvals, platform status, tool limits, activity, and safe next steps.

### Changed

- Updated README with design template direction and another-account continuation notes.
- Removed remaining negative tracking utility from page header and landing hero.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 6 tests.
- `prisma validate`: passed with local development `DATABASE_URL`.
- `npm run build`: passed, 23 app routes generated.
