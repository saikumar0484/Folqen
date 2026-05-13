# Risk Log

## Current Risks

### Final cleanup can remove historical evidence if over-applied

- Risk: Repository cleanup can accidentally remove root control docs, checkpoint docs, deployment guides, future-proofing guides, or archived audit evidence that future Codex sessions need for continuity.
- Prevention: The final cleanup pass was limited to the user-named suspicious targets. Root control docs and operational docs were kept when referenced by README, AGENTS, handoff, checkpoint, implementation, future-proofing, deployment, launch, or testing flows. Only the already-reviewed `archive/review-required/` component archive was deleted, and the prior audit report was moved to `archive/final-cleanup/docs/REPOSITORY_AUDIT_2026-05-13.md`.
- Verification: Reference checks confirmed no active imports of `DashboardScreen`, `LoadingSkeleton`, or `RoutePage`, and TypeScript/ESLint already exclude `archive/**`.
- Rollback: Restore `archive/review-required/` from git history if a future design comparison is needed; move the historical audit report back from `archive/final-cleanup/docs/` only if active docs need it in `docs/`.
- Human approval trigger: Any request to delete root instruction docs, checkpoint docs, deployment docs, env templates, runtime code, APIs, queues, Prisma, governance, browser operations, media, or AI runtime files.

### Preview demo auth can be mistaken for production authentication

- Risk: A safe preview deployment without `DATABASE_URL` can use demo auth for dashboard visualization, which could be mistaken for production-grade user management.
- Prevention: Demo auth is gated behind `PREVIEW_DEMO_AUTH=true`, preview runtime, `PREVIEW_SAFE_MODE=true`, `PREVIEW_FORCE_DRY_RUN=true`, and disabled publishing, paid tools, browser automation, live AI, rendering, live thumbnail rendering, and queue workers.
- Verification: Tests assert preview demo auth blocks when forced dry-run is off, runtime is not preview, or dangerous execution flags are enabled.
- Rollback: Set `PREVIEW_DEMO_AUTH=false`, redeploy preview, and configure a preview-only `DATABASE_URL` with seeded users for real authenticated testing.
- Human approval trigger: Any request to use demo auth in production, remove the preview-only gates, expose privileged mutations beyond dry-run visualization, or enable live execution while demo auth is available.

### Browser Operations can be mistaken for unrestricted browser automation

- Risk: A Browser Operations dashboard, Playwright controller label, action traces, and screenshot previews may make operators think Folqen can browse, click, type, upload files, scrape, or operate accounts.
- Prevention: `ALLOW_BROWSER_AUTOMATION=false` remains the required default. Browser Operations uses `playwright-core` as a future controller dependency only; `POST /api/browser-ops/workflow` returns dry-run traces, simulated screenshot audits, mock queue metadata, and explicit evidence that no browser process launched and no website was contacted.
- Verification: Browser Operations tests assert dry-run-only provider status, allowed-domain simulation, blocked non-allowlisted domains, approval requirements, secret masking, upload blocking, quarantine, and rollback controls.
- Rollback: Hide `/browser-operations`, disable `/api/browser-ops/*`, set `BROWSER_OPERATIONS_KILL_SWITCH=true`, keep `ALLOW_BROWSER_AUTOMATION=false`, and revert `src/lib/browser-ops`, Browser Operations UI, and route map additions.
- Human approval trigger: Any request to launch Playwright, browse live websites, use cookies, use account sessions, upload files, scrape/extract live site data, connect platform accounts, or enable browser automation flags.

### Preview deployment can be misread as production readiness

- Risk: A Vercel preview URL may look production-like and could be shared or promoted while only intended for UI preview, workflow visualization, and dry-run operational testing.
- Prevention: `PREVIEW_SAFE_MODE=true` and `PREVIEW_FORCE_DRY_RUN=true` are documented for preview. `/infrastructure` now includes preview readiness diagnostics, `/api/deployment/preview` is read-only, and preview middleware marks protected responses with dry-run/noindex headers.
- Verification: Preview tests assert safe preview flags pass and unsafe publishing/provider/render/browser/worker activation flags block preview readiness.
- Rollback: Set `PREVIEW_FORCE_DRY_RUN=true`, `ALLOW_PUBLIC_PUBLISH=false`, `ALLOW_PAID_TOOLS=false`, `ALLOW_BROWSER_AUTOMATION=false`, `ORCHESTRATION_EXECUTION_MODE=mock`, `ORCHESTRATION_WORKER_ENABLED=false`, all live AI/media stages to `0`, then redeploy preview.
- Human approval trigger: Any promotion from preview to production, adding production secrets to preview, enabling queue workers, enabling live provider execution, enabling rendering, enabling browser automation, or sharing preview for external/public use.

### First governed live thumbnail rendering can consume local worker resources if enabled carelessly

- Risk: Folqen now contains a live-capable thumbnail rendering path for the Content Department through one controlled `local_worker` provider. If live thumbnail flags, worker URL, shared secret, approval IDs, and quotas are configured carelessly, the app could call a real worker and consume GPU/CPU time.
- Prevention: `POST /api/media/live-thumbnail-render` is blocked unless controlled media execution, live thumbnail rendering, media activation stage, thumbnail activation stage, server-side approval verification, local worker configuration, budget/quota checks, governance checks, provider health, validation/scoring, and kill-switch checks all pass. The route supports thumbnails only and rejects non-`16:9` requests.
- Verification: Focused media tests cover default blocking, approved live worker completion, non-thumbnail rejection, rollback, quarantine, and no autonomous retry behavior. Full lint, typecheck, tests, Prisma generate, build, anonymous API smoke, and audit were run.
- Rollback: Set `ALLOW_LIVE_THUMBNAIL_RENDERING=false`, set `LIVE_THUMBNAIL_RENDER_STAGE=0`, set `ALLOW_CONTROLLED_MEDIA_EXECUTION=false`, set `MEDIA_RENDER_KILL_SWITCH=true`, remove `LOCAL_WORKER_BASE_URL`/`LOCAL_WORKER_SHARED_SECRET`, use `/api/media/live-thumbnail-render/control` with `rollback_to_dry_run` or `quarantine`, and drain media queue metadata.
- Human approval trigger: Any real local worker setup, worker shared secret creation, render approval ID use, quota increase, thumbnail activation stage promotion, real asset storage enablement, or request to run a live thumbnail render.

### Live thumbnail asset previews can be mistaken for public-ready creative

- Risk: A successful live thumbnail render may display an asset URL and score in Content Studio, which could be mistaken for approval to use the asset publicly.
- Prevention: The live thumbnail capability stores a draft asset/render record only after validation and keeps publishing, scheduling, platform APIs, video generation, ComfyUI direct execution, FFmpeg execution, autonomous retries, and workflow mutation blocked. UI copy keeps the capability scoped to governed thumbnail production.
- Verification: Tests assert live thumbnail results remain department/workflow constrained and rollback/quarantine controls do not retry. Public publishing guards remain unchanged.
- Rollback: Quarantine the render provider, mark the asset as failed/quarantined, and require manual content safety/copyright/editorial approval before any downstream use.
- Human approval trigger: Any request to use a rendered thumbnail in public publishing, attach it to a posting package for deployment, enable platform upload, or bypass content safety/copyright review.

### Production diagnostics could be misread as activation readiness

- Risk: Deployment, auth, database, queue, provider, and governance diagnostics may look like Folqen is safe to execute live workflows when they are only operational readiness signals.
- Prevention: `/audit` labels diagnostics as read-only and safe-action guidance. Provider diagnostics return `Needs approval` or `Not connected` instead of live-ready permission, and no mutation buttons were added.
- Verification: The diagnostics routes are protected, build output includes them as dynamic server routes, unauthenticated checks return `401`, and tests verify trace integrity without enabling execution.
- Rollback: Hide the diagnostics panel or disable `GET /api/operations/diagnostics` if operators confuse diagnostics with execution controls.
- Human approval trigger: Any change that lets diagnostics activate providers, release kill switches, mutate queues, approve actions, render media, publish content, or spend money.

### Trace integrity checks can create false positives

- Risk: Current integrity checks operate on a bounded read window and may flag missing audit/event/error links when the linked record exists outside the query window or in future normalized tables.
- Prevention: Issues are shown as review prompts only, not automatic rollback/retry/mutation instructions. The UI says integrity issues are diagnostics, and no autonomous retry or workflow mutation is attached.
- Verification: Unit tests cover orphan workflow, queue mismatch, and approval mismatch detection. Full lint, typecheck, tests, build, and browser smoke passed.
- Rollback: Increase query windows, tune issue rules, or temporarily hide noisy integrity checks while preserving raw read-only trace access.
- Human approval trigger: Any request to auto-resolve, auto-retry, auto-rollback, auto-escalate, or auto-mutate workflows based on integrity findings.

### Approval lifecycle read models may not be complete enough for legal/compliance use

- Risk: Approval timelines are derived from current Approval, AuditLog, WorkflowRun, and ErrorLog rows. They are useful operationally but are not a legally hardened immutable ledger.
- Prevention: Labels remain operational and read-only; raw decision execution still depends on existing approval APIs and audit logs. Future compliance-grade ledgers require reviewed schema/RLS work.
- Verification: Tests cover lifecycle construction, verification status, rollback eligibility, and metadata redaction.
- Rollback: Revert `GET /api/governance/approvals/read-model` and the approval lifecycle panel if the read model causes confusion.
- Human approval trigger: Adding compliance/legal export, immutable ledger claims, raw metadata export, or schema/RLS migrations for approval history.

### Operations trace data can expose sensitive operational metadata

- Risk: A unified trace center could accidentally reveal secrets, tokens, raw payloads, prompt contents, provider details, or user-sensitive operational context if it renders metadata directly.
- Prevention: `/audit` now renders only normalized read-model fields and filtered metadata key names. Secret-like key names such as token, password, API key, credential, and authorization are removed, and raw metadata values remain server-side.
- Verification: Operations trace tests cover safe metadata key filtering, fallback behavior, and explicit read-only labels. Full verification must include lint, typecheck, tests, Prisma generate, build, browser smoke, and audit.
- Rollback: Revert `src/lib/operations-trace/*`, `GET /api/operations/traces`, `OperationsTracePanel`, and the `/audit` page integration if any sensitive data appears in the UI.
- Human approval trigger: Any request to show raw audit metadata, prompt bodies, provider payloads, secrets, credentials, access tokens, full trace payloads, or account data in the frontend.

### Read-only trace center can be mistaken for execution control

- Risk: Queue, render, approval, workflow, and safety posture panels may look like controls even though the trace center only observes state.
- Prevention: The panel labels itself `Read-only`, exposes no mutation buttons, and notes that it does not trigger workflows, providers, rendering, publishing, queue mutation, or platform execution.
- Verification: The route has no POST handler; tests assert fallback dashboard mode is `read_only`, and production build includes only the protected GET route.
- Rollback: Hide `/audit` operations trace sections or return to a simple audit-list page if users confuse it with a control surface.
- Human approval trigger: Adding any action button to `/audit` that mutates approvals, retries jobs, drains queues, activates providers, renders media, or publishes content.

### Controlled media execution can be mistaken for real rendering

- Risk: Controlled render packets, asset scoring, and queue metadata may look like Folqen generated real thumbnails, images, subtitles, or rendered files.
- Prevention: `POST /api/media/controlled-render` requires approval, media activation flags, quota checks, provider configuration, governance checks, provider health, kill-switch checks, and sandbox fallback. Responses and logs state that no GPU job, ComfyUI request, FFmpeg command, binary write, publishing call, autonomous retry, or workflow mutation occurred.
- Verification: Focused media tests assert controlled workflows exist, default controlled rendering blocks without approval/env/provider setup, unsafe asset packets are rejected, and emergency shutdown rolls rendering back to safe mode. Full verification must include lint, typecheck, tests, Prisma generate, build, browser smoke, and audit.
- Rollback: Engage `/api/media/controlled-render/shutdown`, set `ALLOW_CONTROLLED_MEDIA_EXECUTION=false`, set `MEDIA_RENDER_KILL_SWITCH=true`, drain the media queue, and revert `src/lib/media/controlled-rendering.ts`, `/api/media/controlled-render`, and `ControlledMediaExecutionPanel`.
- Human approval trigger: Any attempt to execute real ComfyUI, spawn FFmpeg, run a GPU job, write binary rendered assets, enable local/Oracle media workers, increase quotas materially, or use generated assets in public publishing.

### Render governance depends on future worker enforcement

- Risk: Current render governance creates strict control metadata and queue plans, but no live worker exists to enforce those checks at execution time.
- Prevention: The current slice does not execute live providers. Future workers must call the same governance, quota, approval, provider health, and kill-switch checks immediately before each render job and between any retry-like recovery steps.
- Verification: No live worker flag or provider call is enabled; tests cover shutdown and one-attempt/no-autonomous-retry policy.
- Rollback: Keep `ORCHESTRATION_EXECUTION_MODE=mock`, `ORCHESTRATION_WORKER_ENABLED=false`, and `ALLOW_CONTROLLED_MEDIA_EXECUTION=false` until worker enforcement is implemented and approved.
- Human approval trigger: Enabling live BullMQ workers, local worker endpoints, ComfyUI endpoints for execution, FFmpeg process execution, GPU routing, or render retries beyond one manual packet.

### Governed live Analytics workflows can be mistaken for autonomous optimization

- Risk: Performance reports, strategic optimization recommendations, and feedback-loop scores may look like Folqen is allowed to mutate prompts, workflows, schedules, or platform strategy automatically.
- Prevention: `POST /api/live-execution/analytics/workflows` forces Gemini + Analytics + structured output, requires the same activation/approval/budget/governance/kill-switch gates, uses one queue attempt, has no fallback providers, and requires `noAutonomousOptimization`, `noPromptMutation`, `noWorkflowMutation`, `noPlatformApiAccess`, and `needsHumanReview` safety flags.
- Verification: Focused tests assert Analytics workflows remain blocked without real approval verification, keep autonomous retries disabled, and require structured safety fields. Full verification must include lint, typecheck, tests, Prisma generate, build, browser smoke, and audit.
- Rollback: Disable the Analytics workflow endpoint, engage emergency stop, set `ALLOW_LIVE_AI_EXECUTION=false`, quarantine Gemini, and revert `src/lib/live-execution/analytics-operations.ts`, `/api/live-execution/analytics/workflows`, and `LiveAnalyticsOperationsPanel`.
- Human approval trigger: Any attempt to let Analytics recommendations mutate prompts, workflows, publishing plans, budgets, queue settings, schedules, platform accounts, or optimization rules automatically.

### Mock and future-hook analytics can be over-trusted

- Risk: Analytics workflows support mock ingestion and future YouTube/Instagram hook labels, but no live platform analytics API is connected. Users may over-trust directional signals as real account data.
- Prevention: API/UI data-source labels show `Mock` or `Not connected`; prompts forbid claiming live YouTube, Instagram, platform API, scraping, publishing, or account access; outputs require limitations and evidence/confidence scoring.
- Verification: Parser tests require limitations, data-source labels, confidence scoring, and no-platform-API safety flags.
- Rollback: Restrict Analytics workflows to internal execution metrics only until real platform analytics connectors are explicitly approved and implemented.
- Human approval trigger: Connecting real YouTube/Instagram analytics APIs, ingesting platform account data, applying platform credentials, or using analytics output for production scheduling/publishing decisions.

### Governed live Content workflows can look publish-ready

- Risk: Hook, script, caption, metadata, thumbnail strategy, and platform adaptation outputs can look ready to post even though they are draft intelligence.
- Prevention: `POST /api/live-execution/content/workflows` forces Gemini + Content + structured output, requires the same activation/approval/budget/governance/kill-switch gates, uses one queue attempt, has no fallback providers, and requires `noPublishing`, `noMediaGeneration`, `noPlatformExecution`, and `noWorkflowMutation` safety flags.
- Verification: Focused tests assert Content workflows remain blocked without real approval verification, keep autonomous retries disabled, and require structured safety fields. Full verification must include lint, typecheck, tests, Prisma generate, and build.
- Rollback: Disable the Content workflow endpoint, engage emergency stop, set `ALLOW_LIVE_AI_EXECUTION=false`, quarantine Gemini, and revert `src/lib/live-execution/content-operations.ts`, `/api/live-execution/content/workflows`, and `LiveContentOperationsPanel`.
- Human approval trigger: Any attempt to turn Content outputs into public publishing, real scheduling, media generation, rendering, platform API calls, workflow mutation, or posting-package deployment without a new approval-gated slice.

### Memory-aware Content can overfit stale creative patterns

- Risk: Content workflows retrieve prompt, analytics, strategy, workflow, organizational, and previous-run memory, but memory may be sparse, stale, mock-semantic, or biased toward earlier hook/script experiments.
- Prevention: Outputs include duplicate signals, originality score, platform-fit score, evidence score, memory utilization, and human/source review flags. Low-quality or duplicate-heavy content is rejected instead of promoted.
- Verification: Parser and scoring tests cover memory-aware Content output shape, score thresholds, and safety flags.
- Rollback: Treat memory retrieval as optional context, clear activation state, or remove memory context from the Content prompt builder until better retrieval is available.
- Human approval trigger: Enabling live embeddings, applying memory migrations in production, using memory output to automatically evolve prompts/scripts, or promoting Content drafts without review.

### Expanded live Research workflows can look like autonomous strategy execution

- Risk: Trend analysis, competitor insight, topic intelligence, audience insight, strategic recommendation, reflection, memory retrieval, and scoring may look like Folqen is autonomously changing strategy or executing workflows.
- Prevention: `POST /api/live-execution/research/workflows` only produces structured Research intelligence. It forces Gemini + Research + planning, requires the same activation/approval/budget/governance/kill-switch gates, uses one queue attempt, has no fallback providers, and records `noWorkflowMutation=true`.
- Verification: Focused tests assert expanded workflows remain blocked without real approval verification and keep autonomous retries disabled. Full verification must include lint, typecheck, tests, Prisma generate, and build.
- Rollback: Disable the Research workflow endpoint, engage emergency stop, set `ALLOW_LIVE_AI_EXECUTION=false`, quarantine Gemini, and revert `src/lib/live-execution/research-operations.ts`, `/api/live-execution/research/workflows`, and `LiveResearchOperationsPanel`.
- Human approval trigger: Any attempt to let Research recommendations mutate prompts, workflows, schedules, content packages, publishing queues, or provider settings automatically.

### Memory-aware Research can repeat or over-trust stale memory

- Risk: The workflow retrieves organizational/workflow/strategic/analytics memory and previous runs, but memory may be incomplete, stale, mock-semantic, or biased toward earlier experiments.
- Prevention: Outputs include duplicate signals, novelty score, evidence score, memory utilization, and human/source review flags. Low-quality or duplicate-heavy output is rejected instead of promoted.
- Verification: Parser and scoring tests cover memory-aware output shape, score thresholds, and safety flags.
- Rollback: Treat memory retrieval as optional context, clear the activation state, or remove memory context from the prompt builder until better retrieval is available.
- Human approval trigger: Enabling live embeddings, applying memory migrations in production, or using memory output to automatically evolve strategy.

### First real Gemini live Research ideation can spend quota if production gates are enabled incorrectly

- Risk: Folqen now contains a real Gemini REST execution path for Research Department content ideation. If environment flags, credentials, approvals, or activation state are changed carelessly, the app could send prompts to Gemini and consume API quota.
- Prevention: The live path is restricted to `POST /api/live-execution/research/ideation`, provider `gemini`, department `research`, workflow `structured_generation`, task `planning`, one queue attempt, no fallback providers, no autonomous retries, and server-side approval verification against a real approved `Approval` row. It also requires persisted activation state, server credential, `ALLOW_LIVE_AI_EXECUTION=true`, `LIVE_AI_ACTIVATION_STAGE >= 1`, sandbox promotion, quota/budget checks, governance checks, provider health, and kill switches off.
- Verification: Focused live-execution tests assert structured Research ideation output validation, blocked default execution, no autonomous retries, and rejection of client-claimed approval when database verification is unavailable. Full lint, typecheck, 114 tests, Prisma generate, and Next build passed.
- Rollback: Set `ALLOW_LIVE_AI_EXECUTION=false`, set `LIVE_AI_ACTIVATION_STAGE=0`, set `AI_RUNTIME_KILL_SWITCH=true`, remove Gemini secret env, use `/api/live-execution/emergency-stop`, disable/quarantine Gemini through `/api/live-execution/provider/action`, and revert `src/lib/live-execution/research-ideation.ts`, the Gemini structured-output adapter changes, `/api/live-execution/research/ideation`, and the Tools panel activation ID field if needed.
- Human approval trigger: Any real Gemini key setup, any approved activation ID creation/use, any production env change enabling live execution, any Stage 1 promotion, any budget/quota increase, or any request to run a real provider call.

### Live Gemini outputs remain draft intelligence, not publish-ready facts

- Risk: Gemini may produce plausible but unverified trend insights, folklore claims, or topic suggestions. Treating output as fact or directly using it for public content could create factual, copyright, or safety issues.
- Prevention: The structured schema requires `noPublishing=true`, `needsHumanReview=true`, and `sourceVerificationRequired=true`; output is Research ideation only and never triggers publishing, rendering, metadata deployment, platform execution, or content mutation.
- Verification: Zod parser tests require the safety flags and the service persists live results as workflow intelligence with validation/audit metadata.
- Rollback: Mark the run failed, engage emergency stop if needed, and require manual editorial/source review before any downstream Content Department use.
- Human approval trigger: Any attempt to turn live Research ideation output into generated scripts, media, metadata, scheduling, posting packages, or public publishing without a new approval-gated slice.

### Controlled live execution can spend money or leak prompts if gates are weakened

- Risk: The new activation layer contains a real Gemini adapter, so weakening readiness checks could send prompts to a live provider or spend quota unexpectedly.
- Prevention: Live execution is blocked unless `ALLOW_LIVE_AI_EXECUTION=true`, activation stage is at least `1`, Gemini credentials exist, approved activation ID is supplied, sandbox promotion passed, quotas/budgets pass, governance permits execution, and kill switches are off.
- Verification: Focused live-execution tests assert default readiness blocks, non-target providers/departments block, promotion blocks without env/credentials, and controlled execution does not call providers by default.
- Rollback: Engage emergency stop, disable/quarantine Gemini, set `AI_RUNTIME_KILL_SWITCH=true`, set `ALLOW_LIVE_AI_EXECUTION=false`, set `LIVE_AI_ACTIVATION_STAGE=0`, and revert `src/lib/live-execution`, `/api/live-execution`, and the Tools activation panel if needed.
- Human approval trigger: Any real Gemini credential setup, any stage promotion above Stage 0, any production env change enabling live AI execution, or any request to run a real provider call.

### Activation state is currently lightweight and should be persisted before production live use

- Risk: Current activation registry uses in-memory/read-model state with existing audit/approval/event metadata; a server restart could reset activation state.
- Prevention: This is acceptable while live execution remains blocked by env defaults. Before real activation, persist activation records through existing `Setting` or a reviewed migration with RLS.
- Verification: Check that default env flags are false and that live requests still block after restart unless all gates are configured.
- Rollback: Keep Stage 0 mock-only and do not provide live provider credentials until persisted state exists.
- Human approval trigger: Adding activation tables/migrations, writing production activation settings, or using activation state for real provider execution.

### Emergency controls must remain faster than execution expansion

- Risk: Future workers or queues could keep processing after a provider should be disabled.
- Prevention: Emergency stop updates provider state, queues rollback metadata, forces dry-run state, and documents kill-switch env flags. Future live workers must check kill-switch state before each job and between retries.
- Verification: Tests cover emergency stop and provider rollback actions. Future Redis live-mode tests must verify queue draining/cancellation semantics before any live rollout.
- Rollback: Engage emergency stop and force queue workers off through existing orchestration env flags.
- Human approval trigger: Enabling live Redis workers, queue draining against production, or any automatic retry after a live provider failure.

### AI Provider Gateway live execution must stay blocked

- Risk: Provider gateway infrastructure could be mistaken for permission to call OpenRouter, Gemini, Claude, OpenAI-compatible endpoints, or local/Ollama models.
- Prevention: Providers default to `Mock`, `Not connected`, `Configured`, or `Blocked`; `liveExecutionEnabled` remains `false` for every adapter; APIs force `dryRun` and `sandbox`; the UI labels live provider execution as blocked.
- Verification: AI gateway tests assert all providers have live execution disabled and that the runtime queues mock-safe jobs only. Full verification must include lint, typecheck, tests, build, and reviewing `/tools` status labels.
- Rollback: Revert `src/lib/ai-gateway/*`, `/api/ai-gateway/*`, the `/tools` panel integration, and the `folqen.ai.*` queue names if runtime behavior becomes unsafe.
- Human approval trigger: Any change that sends prompts to a provider, reads provider credentials for execution, enables a local model call, changes `liveExecutionEnabled` to `true`, raises concurrency above zero for non-mock providers, or permits fallback routing to bypass governance.

### AI provider budget and retry controls are planning-only

- Risk: Future retries or fallback chains could accidentally spend money or retry indefinitely if real providers are enabled without strict budget enforcement.
- Prevention: Current retries are mock queue plans only, paid providers are blocked, department/monthly budgets are estimated before execution, retry policy is capped, and governance remains required.
- Verification: Tests cover budget blocking above department budget and dry-run retry output. Future live work must add integration tests that simulate quota exhaustion, fallback failure, timeout, and approval denial.
- Rollback: Disable `/api/ai-gateway/execute` and `/api/ai-gateway/retry` routes or force provider selection to `mock` if any uncontrolled execution path appears.
- Human approval trigger: Any live retry, live fallback provider, paid quota increase, budget threshold change, or provider-specific rate/concurrency setting.

### AI response validation is not a substitute for editorial review

- Risk: Mock validation can catch malformed/unsafe markers, but it does not prove factual accuracy, copyright safety, or platform policy compliance.
- Prevention: Validation returns warnings/failures only; content remains draft-only and public use still requires human review, safety review, copyright clearance, and publishing guards.
- Verification: Tests cover unsafe and malformed output detection. Future live model output must add source-grounding checks, editorial review state, and platform-specific policy checks.
- Rollback: Treat validation failures as blocking, and require manual review for all provider-generated artifacts.
- Human approval trigger: Any change that uses AI gateway output directly in public content, metadata, publishing, rendering, or account automation.

### Governance approvals mistaken for live execution permission

- Risk: A future service or user may treat an approval record as enough to execute publishing, provider calls, workflow automation, account access, or media rendering.
- Prevention: `docs/GOVERNANCE_SAFETY_ARCHITECTURE.md` states approval existence is not sufficient; future adapters must also check environment flags, role permissions, policy engine, content safety, cost limits, provider capability, and audit controls immediately before execution.
- Verification: Governance tests assert public publishing, paid tools, provider execution, and provider activation remain blocked by default, while sandbox execution stays dry-run.
- Rollback: Revert `src/lib/governance`, `/api/governance`, Approval Center governance panel, queue additions, and governance docs if the control model needs redesign.
- Human approval trigger: Any attempt to let approvals activate providers, publish, run live workflows, access accounts, spend money, render media, or bypass policy checks.

### Governance policy model is read-model heavy

- Risk: Role matrix, provider governance, cost quotas, and compliance controls are typed read models rather than normalized compliance tables.
- Prevention: This avoids risky schema migration while creating a stable service contract; future normalized tables require reviewed migration and RLS.
- Verification: No schema migration was added; typecheck and governance tests passed with existing models.
- Rollback: Remove governance read-model additions without database rollback.
- Human approval trigger: Adding governance tables, RLS policies, provider access grants, or production compliance workflows.

### Platform operations mistaken for real publishing

- Risk: The Platform Operations Department can look like a real publishing console, so a user may think posts were scheduled, uploaded, or published.
- Prevention: API responses, provider statuses, UI badges, logs, and docs label the layer as `Mock`, `Not connected`, `Needs approval`, or `Blocked`; all deployment plans state no account, credential, browser automation, scraping, or platform API call occurred.
- Verification: Focused platform-ops typecheck and tests verified live publishing remains disabled and queue jobs are mock metadata by default.
- Rollback: Revert the `src/lib/platform-ops`, `/api/platform-ops`, Platforms panel, queue additions, and platform operations docs if any UI copy appears to claim real posting.
- Human approval trigger: OAuth setup, platform credentials, public publishing, scheduling against real accounts, analytics API reads, browser automation, scraping, monetization access, or any paid platform API usage.

### Requested TikTok infrastructure conflicts with India-first rules

- Risk: The user requested TikTok infrastructure, but Folqen's standing India rules say not to depend on TikTok.
- Prevention: TikTok is represented as a requested placeholder platform only, with manual fallback, blocked policy status, and no database enum migration.
- Verification: Tests assert TikTok distribution returns a blocked result and logs that it is not part of the India-first dependency plan.
- Rollback: Remove TikTok from the Platform Operations registry if the product decision changes back to strictly India-primary platforms only.
- Human approval trigger: Any attempt to make TikTok a real connected/live platform or strategic dependency.

### Platform enum mismatch for X/Twitter and TikTok

- Risk: Current Prisma `PlatformName` does not include `TIKTOK` or `X_TWITTER`, so writing those as enum values would break persistence.
- Prevention: Platform Operations uses an independent typed registry and stores unsupported platform data inside JSON output/metadata only; no schema migration was added.
- Verification: Typecheck and focused platform-ops tests passed with metadata-only platform operations.
- Rollback: If future schema work is approved, add enum values through reviewed migration; otherwise keep unsupported platforms as JSON-only placeholders.
- Human approval trigger: Any production database migration that changes platform enums or connected platform records.

### Media generation pipelines can be mistaken for live rendering

- Risk: The Content Studio media panel, workflow registry, asset registry, render queue, and retry logs can look like real ComfyUI/FFmpeg rendering even though the layer is dry-run only.
- Prevention: Provider statuses explicitly show `Mock`, `Not connected`, `Configured`, or `Blocked`; every media response says no GPU, ComfyUI, FFmpeg, worker, storage write, or public publishing occurred.
- Verification: Media tests cover all media types, all seven workflows, provider blocking, queue metadata, asset versioning, render retry recovery, dashboard observability, and mutation access checks.
- Rollback: Revert `src/lib/media`, `/api/media`, the Content Studio media panel, the `folqen.media` queue addition, and media docs if the pipeline design needs to be revised.
- Human approval trigger: Any live ComfyUI request, GPU execution, FFmpeg process spawn, worker job, paid media provider call, binary storage write, automatic publishing, or production render queue activation.

### Media persistence uses existing Asset and Render metadata

- Risk: Avoiding a migration keeps this slice safe, but media versioning, render lineage, and optimization history are stored as JSON metadata rather than normalized tables.
- Prevention: Metadata includes source, run id, workflow kind, version, tags, validation, dry-run status, and provider status so future media tables can backfill from existing rows.
- Verification: Typecheck and focused media tests passed with existing models only.
- Rollback: Delete mock media `Asset`/`Render` rows if test data becomes noisy; no schema rollback is required.
- Human approval trigger: Adding dedicated media tables, storage buckets, RLS policies, migrations, public asset URLs, or destructive asset cleanup.

### Memory and reflection outputs can be mistaken for live embeddings or autonomous learning

- Risk: Organizational memory retrieval and reflection can look like a live vector/AI learning system even though live embedding providers are blocked.
- Prevention: APIs and UI label execution as `Mock` or `Needs approval`; provider status states no live embeddings are called; strategy evolution is recommendation-only.
- Verification: Memory tests cover categories, provider blocking, ingestion, retrieval, reflection, experiments, prompt versioning, dashboard status, and access checks. Full verification passed with 72 tests.
- Rollback: Revert `src/lib/memory`, `/api/memory`, `/organizational-memory` panel additions, Prisma memory models, and the Supabase migration SQL if the memory layer needs redesign.
- Human approval trigger: Any live embedding provider call, paid AI call, destructive memory action, automatic workflow mutation, automatic prompt promotion, or production migration application.

### pgvector migration is committed but not applied

- Risk: The app schema and generated Prisma client now know about memory tables, but the live Supabase database will not have those tables until the reviewed migration is applied.
- Prevention: Service code catches unavailable memory tables and falls back to mock/in-memory metadata. The migration SQL is explicit and RLS-enabled, and production application is left as a future approval-gated step.
- Verification: `prisma generate`, typecheck, tests, and production build passed without applying the migration.
- Rollback: Remove the memory Prisma models and migration SQL before any live migration is applied.
- Human approval trigger: Applying `supabase/migrations/20260512154500_add_memory_reflection_system.sql`, adding RLS policies/grants, or enabling Data API access for memory tables.

### Intelligence workflows can be mistaken for live research or paid AI

- Risk: The Research and Content Department workflows produce convincing trend, competitor, hook, script, thumbnail, caption, and metadata outputs, so users may assume Folqen scraped the web, called OpenRouter/Gemini, or generated publish-ready content.
- Prevention: The UI and API label execution as `Mock`; provider statuses are `Mock`, `Not connected`, or `Blocked`; outputs state that no public scraping, paid AI, rendering, or publishing occurred.
- Verification: Intelligence tests cover all 11 agents, all 8 workflows, default provider blocking, queue metadata, memory hooks, approval checkpoints, and content package no-publishing/no-paid-execution behavior.
- Rollback: Revert `src/lib/intelligence`, `/api/intelligence`, and the Research/Content page panel additions if the layer needs to be redesigned.
- Human approval trigger: Any live public source ingestion, scraping, OpenRouter/Gemini execution, paid tool call, content rendering, platform posting, or public publishing.

### Intelligence persistence uses existing tables and JSON payloads

- Risk: Using existing `WorkflowRun`, `AgentTask`, `EventLog`, `AnalyticsRecord`, `ContentItem`, and `Asset` metadata avoids migration risk but can make future analytics less normalized.
- Prevention: Outputs include typed payloads and workflow ids so future migrations can backfill normalized tables if needed.
- Verification: No schema migration was added; lint, typecheck, tests, and build must pass after the slice.
- Rollback: Delete intelligence-created run/content rows if needed; no schema rollback is required.
- Human approval trigger: Adding dedicated intelligence tables, migrations, grants, RLS policies, or Supabase API exposure changes.

### Orchestration infrastructure can be mistaken for live autonomous execution

- Risk: The new agent registry, LangGraph dry-run, CrewAI-compatible plan, event bus, Redis/BullMQ adapters, APIs, and worker entrypoint may look like fully live autonomous execution.
- Prevention: Defaults keep `ORCHESTRATION_EXECUTION_MODE=mock` and `ORCHESTRATION_WORKER_ENABLED=false`; queues return mock job IDs unless Redis live mode is explicitly configured; worker code acknowledges jobs only and does not call external providers.
- Verification: Lint, typecheck, 56 tests, Prisma generate, and Next build passed. Tests confirm task delegation, workflow planning, and queue health stay mock-safe without Redis.
- Rollback: Revert the orchestration files, API routes, package additions, env additions, and Docker Redis service if the architecture direction is rejected.
- Human approval trigger: Any change that enables live external providers, public publishing, paid API execution, browser automation, n8n workflow execution, media rendering, production worker execution, or platform posting.

### Redis/BullMQ live mode needs careful operational setup

- Risk: Enabling Redis live mode without clear worker controls could create duplicate processing or retry loops.
- Prevention: Live mode requires explicit `REDIS_URL`, `ORCHESTRATION_EXECUTION_MODE=live`, and `ORCHESTRATION_WORKER_ENABLED=true`; default mode is mock; BullMQ attempts/backoff are bounded.
- Verification: Build and tests passed in mock mode; local live queue movement is still a future test task.
- Rollback: Clear `REDIS_URL` or set `ORCHESTRATION_EXECUTION_MODE=mock` and `ORCHESTRATION_WORKER_ENABLED=false`.
- Human approval trigger: Production Redis, production worker deployment, provider execution, retry policy changes, or worker scaling.

### Command center frontend can be mistaken for live automation

- Risk: The new command center presents agents, departments, workflows, analytics, incidents, queues, and infrastructure with rich mock telemetry. Users may assume autonomous execution, Redis/BullMQ, n8n, workers, API providers, or platform posting are live.
- Prevention: The UI uses visible `Mock`, `Not connected`, `Needs approval`, `Configured`, and `Live` states and keeps manual/package fallbacks explicit.
- Verification: Command-center tests assert all requested pages expose mock-safe data and include not-connected provider states; lint, typecheck, 52 tests, build, and React render smoke passed.
- Rollback: Revert the command-center route/component changes and return `/dashboard`, `/workflows`, and `/analytics` to the previous database-backed screens if the UI direction is rejected.
- Human approval trigger: Any change that turns mock command-center controls into live provider execution, public publishing, paid usage, browser automation, worker execution, or platform posting.

### Dependency patch reduced high audit risk but moderate PostCSS advisory remains

- Risk: `npm audit` reported high Next.js advisories on `16.2.4`; patching to `16.2.6` removed the high severity report, but the nested PostCSS moderate advisory remains under Next and npm only offers `npm audit fix --force`.
- Prevention: Applied a patch-level Next.js and `eslint-config-next` update to `16.2.6`; did not run the force fix because it would install a breaking Next path.
- Verification: `eslint`, `tsc`, 52 tests, `prisma generate`, and `next build` passed on Next.js `16.2.6`; `npm audit --audit-level=moderate` now reports only the moderate nested PostCSS issue.
- Rollback: Revert the dependency patch if it creates runtime issues, though that would reintroduce the high Next audit range.
- Human approval trigger: Any major framework upgrade/downgrade or forced audit fix.

### Autonomous company scope can become unsafe automation

- Risk: The expanded Folqen vision includes autonomous research, generation, scheduling, posting, optimization, retries, and self-improvement. If implemented without hard gates, the system could publish publicly, spend money, connect accounts, or modify itself too aggressively.
- Prevention: Added `docs/AUTONOMOUS_ORGANIZATION_ARCHITECTURE.md` with explicit approval-gated autonomy, provider status honesty, event logging, publishing guards, paid-tool guards, self-improvement execution blocks, and manual posting package fallback.
- Verification: Documentation-only architecture phase passed lint, typecheck, 50 tests, Prisma generate, and Next build through local binaries.
- Rollback: Revert the new architecture document and `docs/ARCHITECTURE.md` pointer if the target vision is rejected, while leaving code and production state unchanged.
- Human approval trigger: Any move from mock/manual architecture into live provider execution, public publishing, paid tools, real social OAuth, browser automation, production upgrades, or schema migrations.

### Requested Next.js 15 conflicts with current Next.js 16 baseline

- Risk: The human's architecture request listed Next.js 15, but the repository now uses Next.js `16.2.6` and has verified builds on that baseline. A downgrade could create dependency, ESLint, React, or deployment churn.
- Prevention: The architecture/checkpoint docs call out the mismatch and instruct future work not to downgrade without explicit human approval.
- Verification: Current Next.js `16.2.6` production build passed after the command-center update.
- Rollback: If the human explicitly chooses Next.js 15, create a branch, downgrade dependencies deliberately, run full verification, and update checkpoint docs.
- Human approval trigger: Any framework version downgrade or major dependency baseline change.

### In-app credential intake must not become unsafe account takeover

- Risk: Users may paste raw social media passwords or assume saved credentials automatically connect/publish.
- Prevention: The Connection Wizard explicitly asks for OAuth/API/setup details, not social passwords. Saving details does not publish, spend credits, run workflows, or enable OAuth posting.
- Verification: Credential vault tests passed; connection intake is admin-only and anonymous production intake returned 401.
- Rollback: Remove the Connection Wizard and `/api/connections/intake` route if credential handling is deemed too risky for the MVP.
- Human approval trigger: Any real OAuth connection, paid API call, n8n workflow execution, public publishing, media rendering, or browser automation.

### Credential vault depends on server secret stability

- Risk: Credentials saved through the wizard are encrypted with `CREDENTIAL_ENCRYPTION_KEY` if set, otherwise `AUTH_SECRET`. Rotating that key without migration can make saved credentials unreadable.
- Prevention: Prefer setting a dedicated `CREDENTIAL_ENCRYPTION_KEY` before serious production credential storage. Keep key rotation documented and deliberate.
- Verification: Vault encrypt/decrypt tests passed and no plaintext secrets are returned in API responses.
- Rollback: Re-enter credentials through `/settings` if the vault key changes and old entries cannot decrypt.
- Human approval trigger: Key rotation, credential deletion, provider connection, or production secret change.

### Two-day launch target can be misunderstood as full automation

- Risk: The user may expect fully automated public publishing, media generation, OAuth platform posting, and real n8n/OpenAI execution within 2 days.
- Prevention: Added `docs/2_DAY_LAUNCH_PLAN.md` and a dashboard readiness section that clearly labels `Ready`, `Needs human`, `Needs secret`, and `Later`.
- Verification: Launch readiness tests passed and confirm blocked integrations remain honest without secrets.
- Rollback: Remove the dashboard launch readiness section if it confuses the app UX, but keep the docs for handoff clarity.
- Human approval trigger: Any request to enable public publishing, paid OpenAI calls, workflow execution, media rendering, OAuth connections, or browser automation.

### App-marked mutation requests are stricter than before

- Risk: Direct API calls or scripts that do not send the Folqen UI mutation marker now receive `403`, even if they are otherwise same-origin.
- Prevention: All current client-side mutation calls were updated to use the shared mutation fetch helper.
- Verification: Test suite passed with 45 tests; production Node smoke test confirmed marked login returned 200, dashboard returned 200, and login without the marker returned 403.
- Rollback: Relax `validateFolqenMutationHeader` or remove the header check from `getMutationSafetyError` if a legitimate app flow is blocked.
- Human approval trigger: Any request to permit external automation clients, browser automation, cross-site mutation calls, or workflow-triggered mutations.

### Function region is now tied to Supabase Seoul

- Risk: If the database is moved to another Supabase region later, DB-backed pages may become slow again.
- Prevention: Vercel Functions now run in Seoul (`icn1`) to stay close to the current Supabase project.
- Verification: `vercel inspect` confirmed functions in `icn1`; health timing improved from about `1.47s` to about `0.56s`, and authenticated dashboard timing measured about `0.09s`.
- Rollback: Change `vercel.json` `regions` to the region closest to the new database and redeploy.
- Human approval trigger: Moving/recreating Supabase, changing Vercel regions, or changing production database architecture.

### New mutation guards may block unusual clients

- Risk: Same-origin checks and per-user rate limits could block cross-site requests or rapid repeated clicks that previously reached mutation handlers.
- Prevention: Guards were added after authentication/role checks for most routes so anonymous behavior still returns `401`; limits are intentionally generous for normal UI use.
- Verification: Request guard tests passed, full test suite passed with 43 tests, and production deployment must verify anonymous mutation protection after deploy.
- Rollback: Remove `getMutationSafetyError` calls from affected routes or relax limits if a legitimate workflow is blocked.
- Human approval trigger: Any request to permit cross-site mutation calls, automation clients, browser automation, or external workflow execution.

### Admin password still needs human action

- Risk: The default seeded admin password remains a production security risk until the human changes it.
- Prevention: Password-change UI/API exists, now with toast feedback and rate limiting; Codex did not invent or print a new password.
- Verification: Password-change route builds and remains admin-only; no account change was performed in this slice.
- Rollback: If a future password rotation causes lockout, use a safe Supabase/server-side recovery flow with human approval.
- Human approval trigger: New admin password or any direct account credential change.

### Cross-account continuation after storage checkpoint

- Risk: A future Codex account may miss that the Google Drive adapter is code-complete but not live-configured.
- Prevention: Checkpoint docs now call out commit `1a78e1b`, live database health, and remaining credential requirements.
- Verification: `git status --short --branch` was clean before checkpoint docs, and production `/api/health` returned database `live`.
- Rollback: Re-read GitHub branch `build/phase-0-foundation` and continue from the latest pushed checkpoint commit.
- Human approval trigger: None for this documentation-only checkpoint; credentials and account changes still require approval.

### Vercel database URL can go stale after Supabase credential changes

- Risk: If the Supabase database password or pooler endpoint changes, production health can fail even when Supabase CLI queries still work.
- Prevention: Vercel `DATABASE_URL` was rotated to the verified Supabase transaction pooler endpoint and stored only as a sensitive env var.
- Verification: Local Prisma `SELECT 1` against the transaction pooler passed, production redeploy passed, and `GET https://folqen.vercel.app/api/health` returned database status `live`.
- Rollback: Re-add the last known-good Vercel `DATABASE_URL` through `vercel env add --sensitive` and redeploy production.
- Human approval trigger: Any future database password reset, project recreation, Vercel env rotation, or production database migration.

### Google Drive adapter is implemented but not live

- Risk: Users may assume binary files are now stored in Drive even when OAuth env values are missing.
- Prevention: Upload route keeps `database_metadata_only` fallback unless all Drive env values are configured; health/status still shows Google Drive `not_connected`.
- Verification: Drive adapter tests passed for missing env, resumable upload flow, and no-secret failure messages. No live Drive upload was attempted.
- Rollback: Remove Google Drive env values to force metadata-only mode; no public links are created by the adapter.
- Human approval trigger: Adding Google OAuth secrets, refresh token, private folder id, or testing a live binary upload.

### Account safety cleanup requires human input

- Risk: Rotating the seeded admin password requires a new secret, and deleting/rotating the temporary viewer account is a destructive account action.
- Prevention: Do not guess or print a new admin password, and do not delete users without explicit human approval.
- Verification: Account cleanup was not performed in the provider approval API test slice; the live app health remains database `live`.
- Rollback: If a future password rotation locks the user out, rotate the admin password directly through a safe Supabase/server-side recovery flow.
- Human approval trigger: New admin password, test viewer deletion, test viewer password rotation, or any real account access change.

### Cross-account continuation may miss latest pushed state

- Risk: A future Codex account may rely on chat history or a stale local folder instead of the pushed GitHub branch.
- Prevention: This checkpoint records the latest feature commit, branch, live URL, verification state, and next steps in repository docs.
- Verification: `git status --short --branch` was clean before checkpoint docs; checkpoint changes are documentation-only.
- Rollback: Re-read GitHub branch `build/phase-0-foundation` and ignore unsynced local folders if they disagree.
- Human approval trigger: None; this is documentation only.

### Provider approval requests are not provider connections

- Risk: Users may assume approving a provider setup request connects Google Drive, OpenAI, n8n, or media tools automatically.
- Prevention: The request API only creates `Approval` and `AuditLog` rows and explicitly records `secretsIncluded: false`; setup panels still show missing secrets and `Not connected`.
- Verification: Tests confirm approval payloads include no secrets and keep public publishing, paid tools, and browser automation blocked.
- Rollback: Delete the created pending approval rows if they were created accidentally; no external provider is affected.
- Human approval trigger: Adding real secrets, calling OpenAI, writing Drive files, executing n8n workflows, rendering media, or connecting platform accounts.

### Provider setup surfaces are not live integrations

- Risk: Users may think the new Google Drive, OpenAI, n8n, and media setup panels mean those services are already connected.
- Prevention: Runtime status keeps these services labeled `Not connected` unless the required env values are present; setup panels explain which secrets are still missing.
- Verification: Production health returned database `live` while Google Drive, OpenAI, n8n, FFmpeg, ComfyUI, TTS, and worker statuses remained `not_connected`.
- Rollback: Remove the provider setup panels and status rows if they cause confusion; no external account was connected.
- Human approval trigger: Any credential entry, OAuth flow, paid OpenAI call, n8n workflow execution, binary file storage, or media rendering action.

### OpenAI is a paid-tool provider

- Risk: A real OpenAI agent could spend API credits if enabled without a clear approval gate.
- Prevention: Folqen currently saves only a model preference; no API key is committed, no real OpenAI request is made, and paid tools remain disabled by default.
- Verification: Provider config tests confirm OpenAI is `not_connected` without `OPENAI_API_KEY`; production status reports OpenAI as `not_connected`.
- Rollback: Clear `OPENAI_API_KEY` from Vercel/local env to force OpenAI back to `Not connected`.
- Human approval trigger: Adding an OpenAI API key, enabling paid-tool approval, or executing any real AI generation call.

### n8n embedded builder depends on self-hosted security settings

- Risk: The embedded n8n interface may fail if the Oracle n8n server blocks iframe embedding, or it may expose workflows if n8n is not protected by login.
- Prevention: The iframe is hidden unless `ORACLE_N8N_INSTANCE_URL` is configured; Folqen still requires webhook URL/secret separately for execution tests.
- Verification: Production `/workflows` shows setup guidance while n8n remains `Not connected`.
- Rollback: Remove `ORACLE_N8N_INSTANCE_URL` from env to hide the embedded builder.
- Human approval trigger: Configuring n8n iframe access, adding webhook secrets, or executing workflows that affect real services.

### Session continuation depends on checkpoint docs

- Risk: A later Codex account may rely on chat memory instead of the repo state.
- Prevention: Current status, next steps, changelog, risk log, and handoff log were updated with the May 7 save point.
- Verification: Production health returned database `live`; repo was clean before save-point doc edits.
- Rollback: Re-read the latest pushed checkpoint docs and GitHub branch if chat memory is unclear.
- Human approval trigger: None; this is documentation only.

### Manual posting packages are not public publishing

- Risk: A user may mistake package generation for platform upload/public posting.
- Prevention: Packages are saved as `posting_package` assets with `manual://` paths and audit logs; the UI, download file, and API copy state that no upload or public publishing happened.
- Verification: Posting package tests confirm manual mode, Not connected API wording, and manual-only download JSON. Full test suite passed with 23 tests, and production anonymous download returned 401.
- Rollback: Delete generated `posting_package` asset rows if needed; no platform account is affected.
- Human approval trigger: Any platform upload, OAuth connection, public publishing, scheduled posting, or credential use.

### Role-aware UI is partial

- Risk: Some future pages may expose action buttons before role-aware states are added.
- Prevention: Permission helpers now cover system settings, approval review, and posting package creation; approval UI uses role-aware disabling.
- Verification: Permission tests cover admin/operator/viewer behavior and passed.
- Rollback: Revert role-aware UI changes if they cause runtime issues; server-side API role checks remain authoritative.
- Human approval trigger: Any new action API that changes data, files, providers, credentials, publishing, or paid-tool behavior.

### Service interfaces are mock-only

- Risk: Future code may assume service interfaces perform real AI, workflow, render, analytics, storage, or publishing actions.
- Prevention: Mock services return `mock` or `not_connected` and tests confirm public publishing, workflow execution, and storage writes remain blocked.
- Verification: `npm run test` now includes service interface safety tests and passed with 15 total tests.
- Rollback: Revert `src/lib/services/*` if the abstraction causes build or runtime issues; no provider or database behavior was changed.
- Human approval trigger: Any real provider adapter, external API call, workflow execution, storage write, paid tool call, or public publishing action.

### File upload registration is metadata-only until Supabase Storage is configured

- Risk: Users may think uploaded binary files are stored permanently, but the current safe MVP only stores validated private metadata and optional small text previews.
- Prevention: The Files UI and API response say binary storage is still Not connected; `binaryStored` is false and audit logs record `database_metadata_only`.
- Verification: File validation tests passed, anonymous upload returned 401, authenticated upload returned 200 with `binaryStored: false`.
- Rollback: Delete `UploadedFile` rows created by upload smoke tests if needed; no object storage bucket or platform account is affected.
- Human approval trigger: Configuring Supabase Storage, adding service keys, changing storage policies, or persisting binary file bytes.

### Files page accepts validated registration only

- Risk: Users may expect registered files to be downloadable binary assets.
- Prevention: The page states Supabase Storage is Not connected and that the MVP records metadata only.
- Verification: `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` passed after adding the registration flow.
- Rollback: Revert the foundation pages data-loader and screen commit if a route causes runtime issues.
- Human approval trigger: Any storage implementation that writes binary files, changes Supabase Storage policy, or exposes files publicly.

### Monetization page is read-only

- Risk: Users may expect payment or monetization actions.
- Prevention: Payment access remains off, and the route only displays readiness/analytics signals.
- Verification: `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` passed.
- Rollback: Revert the monetization screen if it causes confusion or runtime issues.
- Human approval trigger: Any payment, ads, sponsorship commitment, revenue API, or monetization account connection.

### Operations pages are read-only

- Risk: Users may expect notifications, analytics, errors, workflows, or upgrades pages to mark records read, resolve errors, execute workflows, or apply upgrades.
- Prevention: The pages only read Supabase records and display safety guidance. Write/execution actions remain out of scope until role checks, confirmations, service adapters, and audit logs exist.
- Verification: `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` passed after adding the pages.
- Rollback: Revert the operations data-loader and page commits if a route causes runtime issues.
- Human approval trigger: Any workflow execution, upgrade execution, external analytics connection, notification delivery channel, destructive error cleanup, paid provider call, or production code/security change.

### Platforms and tools pages are status-only

- Risk: Users may expect platform connection cards or tool cards to connect accounts, run providers, render media, or publish content.
- Prevention: The pages read Supabase/runtime status only and keep all setup/execution actions out of scope until credentials, role checks, approvals, and service adapters exist.
- Verification: `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` passed after adding the pages.
- Rollback: Revert the platforms/tools page and data-loader commits if a route causes runtime issues.
- Human approval trigger: Any OAuth setup, platform credential entry, paid provider enablement, n8n workflow trigger, render execution, or public publishing feature.

### Pipeline and library pages are read-only

- Risk: Users may expect the new live-data pages to execute retries, downloads, uploads, archive/delete, renders, or posting packages.
- Prevention: The pages show existing Supabase records and keep write actions out of scope until service adapters, upload validation, role checks, confirmations, and audit logs are implemented.
- Verification: `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` passed after adding the pages.
- Rollback: Revert the pipeline/library page and data-loader commits if a route causes runtime issues.
- Human approval trigger: Any destructive archive/delete, real render, upload handling, public publishing, paid provider call, or n8n workflow trigger.

### Temporary viewer test account exists

- Risk: A shared test account can remain active longer than needed.
- Prevention: It has role `VIEWER`, cannot change settings, and cannot approve/reject items.
- Verification: Production login and dashboard access were tested; privileged APIs remain role-gated.
- Rollback: Delete or rotate the test account from Supabase after dashboard testing.
- Human approval trigger: Keeping, deleting, or changing role/password for the test account.

### Supabase direct database hostname is unreliable from this Windows environment

- Risk: Direct Prisma commands against `db.eobvgajgyvydqydlfken.supabase.co:5432` fail DNS resolution locally, and a prior pooler `db push` attempt hung.
- Prevention: Use `supabase db query --linked` through the Supabase Management API for schema SQL application; keep SQL files temporary and out of git.
- Verification: `supabase db query --linked` successfully returned current database and user from the linked project.
- Rollback: If schema application fails partway, inspect Supabase tables through `supabase db query --linked`, document the failed SQL statement, and ask before destructive cleanup.
- Human approval trigger: Any destructive database operation, reset, drop, migration against production-like data, or credential rotation.

### Supabase database password was shared in chat

- Risk: The DB password is now visible in conversation history even though it was not committed to git.
- Prevention: Do not print it again, do not write it to repository files, and add the final connection string only through Vercel/local secret flows.
- Verification: `git status` and `git diff` must show no committed secret files or connection strings.
- Rollback: Rotate the Supabase database password after the app is connected, or sooner if there is any concern the chat history is exposed.
- Human approval trigger: Password rotation, Vercel secret replacement, or any credential-bearing operation.

### Default seeded admin password must be changed

- Risk: The seeded admin account uses the documented first-run password.
- Prevention: Use the implemented password-change flow in `/settings` and treat the seeded password as temporary first-login-only access.
- Verification: Production login works and the password-change API/page exist.
- Rollback: Rotate the user password directly in Supabase or reseed with a new hash if needed.
- Human approval trigger: Password rotation policy, account recovery decisions, or inviting additional real users.

### Repository cleanup can remove useful design context if done blindly

- Risk: Cleanup may remove old prototype/design files or legacy components that still contain useful design context for future UI work.
- Prevention: A repository audit report was created before deletion. Only generated prototype scaffold files were deleted, while unimported active-tree components were moved to `archive/review-required/` instead of deleted.
- Verification: Run lint, typecheck, tests, Prisma generate, and build after cleanup.
- Rollback: Restore deleted prototype files from git history if a future design comparison is needed; restore archived components from `archive/review-required/` if they become useful again.
- Human approval trigger: Any future deletion of architecture docs, governance/runtime systems, active routes, active services, deployment files, Prisma files, or archived review-required components.

### Real deployment requires secret handling

- Risk: Vercel, database, and n8n secrets could be leaked if added to files or terminal logs.
- Prevention: Keep only placeholders in `.env.example`; add real values through Vercel/local env secret flows only; `.vercelignore` excludes env files from CLI deployment uploads.
- Verification: Check git diff before commits; verify `.env` and `.env.*` remain ignored except `.env.example`.
- Rollback: Rotate exposed credentials immediately if any secret is accidentally printed or committed.
- Human approval trigger: Any real credential, Vercel production env change, database connection string, or n8n shared secret.

### Database push/seed can affect real data

- Risk: `npm run db:push` and `npm run db:seed` can modify the target database.
- Prevention: Confirm `DATABASE_URL` target before running database commands; use free/dev database first.
- Verification: Run `prisma validate`, then inspect provider project before pushing schema.
- Rollback: Use provider backups/snapshots where available; otherwise recreate the free dev database and rerun seed.
- Human approval trigger: Any production-like database migration, schema push, or seed against a real database.

### n8n webhook test triggers a real workflow

- Risk: `POST /api/integrations/n8n/test` sends a real event to the configured Oracle n8n webhook.
- Prevention: The payload is only `connection_test` and includes disabled publishing/paid-tool flags.
- Verification: Confirm n8n workflow checks `x-folqen-secret` and only logs/acknowledges test events.
- Rollback: Remove `N8N_WEBHOOK_URL` and `N8N_WEBHOOK_SECRET` env values to return Folqen to `Not connected`.
- Human approval trigger: Any n8n workflow that publishes, spends money, edits accounts, or runs browser automation.

### Template port is a design adaptation, not a framework replacement

- Risk: The uploaded template uses Vite/TanStack/Tailwind v4 patterns, while Folqen is a Next.js/Tailwind v3 app.
- Prevention: Port visual structure and CSS tokens, not incompatible framework files.
- Verification: Run lint, typecheck, tests, and build after every template-related change.
- Rollback: Revert only the adapted landing/dashboard changes if they break the app.
- Human approval trigger: None unless the user wants a full framework migration, which is not recommended now.

### Next/PostCSS npm audit advisories

- Risk: `npm audit` reports two moderate vulnerabilities through Next's bundled PostCSS dependency even after upgrading to Next `16.2.4`.
- Prevention: Do not run `npm audit fix --force` because npm proposes a breaking downgrade to `next@9.3.3`.
- Verification: Track future compatible Next patches and rerun `npm audit`.
- Rollback: No code rollback needed; current build passes.
- Human approval trigger: Upgrade only when compatible and verified.

### Browser visual verification unavailable

- Risk: HTTP checks passed, but screenshot-level browser verification could not run in this desktop session.
- Prevention: Keep UI simple, build verified, and use route text checks.
- Verification: Run browser verification again when `agent-browser`, browser-use runtime, Playwright, or another approved browser tool is available.
- Rollback: None needed.
- Human approval trigger: None unless visual testing reveals design issues later.

### Future database migrations can affect real data

- Risk: Supabase is now live and seeded, so future schema changes can affect real data.
- Prevention: Avoid destructive resets, inspect migration SQL, and use small reviewed schema changes.
- Verification: Run lint, typecheck, tests, build, and targeted Supabase checks after changes.
- Rollback: Use Supabase backups/snapshots where available or write explicit rollback SQL for small changes.
- Human approval trigger: Any destructive migration, reset, drop, or production auth/security change.

### Live integrations not connected

- Risk: Users may assume platform/tool actions are live.
- Prevention: UI labels all provider/tool/platform states as `Not connected` or `Mock`.
- Verification: Check route copy and health response.
- Rollback: Revert any integration that claims live status before setup.
- Human approval trigger: OAuth, credentials, paid tools, public publishing, or browser automation.

## Security Concerns

- No secrets are committed.
- Public publishing is blocked by default.
- Paid tools are blocked by default.
- Browser automation is blocked by default.
- Human approval is required by default.
- Auth, protected sessions, audit persistence, and database-backed settings/approvals exist.
- Upload validation, rate limits, CSRF hardening, broader role tests, and platform OAuth security are still future work.

## May 13, 2026 - First Governed Live Thumbnail Rendering Risks

### Live thumbnail rendering can accidentally become broader media execution

- Risk: A live thumbnail path could be expanded into unrestricted image/video/GPU execution, direct ComfyUI access, FFmpeg execution, or autonomous retries.
- Prevention: The new live path is isolated in `src/lib/media/live-thumbnail-rendering.ts`, accepts only 16:9 thumbnail requests, forces the controlled `local_worker` provider, uses one attempt, validates output schema, and records safety flags for no publishing, no video generation, no autonomous retries, and no workflow mutation.
- Verification: Focused media tests and the full test suite passed, including rejection of non-thumbnail output shape and successful live execution only with activation flags, approval, worker, budget, and validation.
- Rollback: Use `POST /api/media/live-thumbnail-render/control` with `rollback_to_dry_run` or `quarantine`, set `ALLOW_LIVE_THUMBNAIL_RENDERING=false`, set `LIVE_THUMBNAIL_RENDER_STAGE=0`, and keep `MEDIA_RENDER_EMERGENCY_STOP=true` if needed.
- Human approval trigger: Any direct ComfyUI execution, FFmpeg process execution, video generation, additional provider, autonomous retry, workflow mutation, or public publishing path.

### Worker endpoint and shared secret can leak or be misused

- Risk: `LOCAL_WORKER_BASE_URL` and `LOCAL_WORKER_SHARED_SECRET` could expose a render worker if committed, logged, or sent to the browser.
- Prevention: Env examples contain placeholders only; the shared secret is read server-side, never returned by diagnostics, and only sent to the worker as an internal header.
- Verification: No real worker secret was added, no real worker call was made, and endpoint access remains authenticated/admin-operator gated.
- Rollback: Rotate the worker secret, unset `LOCAL_WORKER_BASE_URL`, unset `LOCAL_WORKER_SHARED_SECRET`, and quarantine live thumbnail rendering.
- Human approval trigger: Any real worker secret, production worker URL, network firewall change, or render worker deployment.

### Approval existence could be mistaken for execution permission

- Risk: A user may assume an approved row alone is enough to render.
- Prevention: Live rendering also requires activation flags, worker configuration, kill switches off, budget/quota checks, validation/scoring, provider not quarantined, and request mutation guards.
- Verification: Tests confirm default live thumbnail rendering does not call the worker and completes only when approval and every runtime gate are supplied.
- Rollback: Revoke the approval, call the control endpoint to roll back to dry-run, and keep env flags disabled.
- Human approval trigger: Changing approval type scope, bypassing approval verification, or relaxing budget/quota/validation gates.

## May 13, 2026 - Production Environment & Deployment Governance Risks

### Production deployment can boot with unsafe or incomplete env

- Risk: A VPS, Docker, Coolify, or Vercel runtime may boot with placeholder secrets, missing database/Redis URLs, mismatched runtime profile, or unsafe flags.
- Prevention: Added `src/lib/deployment-governance/*`, startup env flags, masked secret checks, production-profile required secret validation, startup integrity checks, and protected `/api/deployment/readiness`.
- Verification: `eslint .`, `tsc --noEmit`, `tsx --test "src/**/*.test.ts"`, `prisma generate && next build`, and HTTP smoke for `/api/deployment/readiness` returning `401` anonymously passed.
- Rollback: Set `STARTUP_ROLLBACK_MODE=true`, keep live execution/media/publishing flags false, stop workers, redeploy previous image/commit, and verify `/api/health`.
- Human approval trigger: Any real production deployment, `.env.production` creation with real secrets, Docker worker startup, live Redis queue mode, provider activation, or public traffic cutover.

### Secret diagnostics could accidentally expose sensitive values

- Risk: Deployment dashboards can become a secret leak if they render raw env values.
- Prevention: Secret governance returns only `configured` and masked values; docs state secrets must live in platform/server secret managers; `.dockerignore` excludes env files.
- Verification: Deployment governance tests assert the raw Gemini key is absent from serialized dashboard output.
- Rollback: Remove diagnostics endpoint from production, rotate affected secrets, and audit trace output if any raw secret is ever exposed.
- Human approval trigger: Any new diagnostic that includes env values, credential metadata, connection strings, OAuth tokens, or provider keys.

### Docker/VPS production profile may be mistaken for production activation

- Risk: Adding production Docker/Coolify scaffolding may make future users assume providers, queues, publishing, or rendering are live.
- Prevention: Compose keeps workers behind a disabled profile, app env overrides keep dangerous flags false, docs label deployment as readiness only, and UI shows `Mock`, `Not connected`, `Needs approval`, `Configured`, `Blocked`, or `Live`.
- Verification: Build output includes `/api/deployment/readiness`; tests confirm local defaults remain mock-safe and live queue startup blocks without Redis governance.
- Rollback: Remove or disable `docker-compose.production.yml` worker profile and keep the app on local/Vercel deployment until a supervised VPS rehearsal is approved.
- Human approval trigger: Enabling `--profile workers`, setting `ORCHESTRATION_EXECUTION_MODE=live`, adding provider credentials, enabling controlled rendering, or changing `ALLOW_PUBLIC_PUBLISH`.

### Backup and rollback are documented but not rehearsed

- Risk: Production deployment without a restore rehearsal can leave the project unable to recover cleanly from bad data or failed deploys.
- Prevention: Added `docs/PRODUCTION_DEPLOYMENT_GOVERNANCE.md` with backup, restore, rollback, and quarantine procedures; UI exposes rollback readiness as `Needs approval` where rehearsal is still required.
- Verification: Documentation and readiness panel compile in the production build; no destructive backup/restore command was run.
- Rollback: Keep the existing Vercel deployment as the safe baseline until VPS/Coolify backup and rollback rehearsal passes.
- Human approval trigger: Any database restore, backup retention change, off-host backup setup containing credentials, or production rollback affecting real users.
