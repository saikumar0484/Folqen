# Risk Log

## Current Risks

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

### Generated prototype files are preserved but not active

- Risk: Prototype files under `docs/prototypes/ai-studio-generated/` may confuse future agents or TypeScript if included accidentally.
- Prevention: `docs/prototypes/**` is excluded from active TypeScript compilation.
- Verification: `npm run typecheck` and `npm run build` pass.
- Rollback: Delete or archive the prototype folder after human approval if it is no longer needed.
- Human approval trigger: Replacing active Folqen UI with prototype code.

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
