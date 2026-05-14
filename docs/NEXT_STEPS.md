# Next Steps

## Immediate Follow-Up (May 14, 2026 - Palette Propagation QA)

1. Run a page-by-page visual QA pass to catch any remaining hardcoded non-palette tones on:
   - `/dashboard`, `/onboarding`, `/workflows`, `/research-intelligence`, `/content-studio`, `/analytics`, `/browser-operations`, `/infrastructure`.
2. Replace remaining blue/cyan accents in secondary charts/icons where they are not semantically required.
3. Add optional chart color fallback helpers tied to `--chart-*` tokens so visual consistency survives future component additions.
4. Keep loading/empty/error states consistent with the same palette while preserving accessibility contrast.

## Immediate Follow-Up (May 14, 2026 - Post Coverage Expansion)

1. Replace or archive now-unused legacy presentation modules:
   - `src/components/app/foundation-pages-screens.tsx`
   - `src/components/app/operations-screens.tsx`
   - `src/components/app/library-screen.tsx`
   - `src/components/app/pipeline-screen.tsx`
   - `src/components/app/platforms-screen.tsx`
   - `src/components/app/tools-screen.tsx`
   - and related static data files (`foundation-pages-data`, `operations-data`, `library-data`, `pipeline-data`, `platforms-data`, `tools-data`)
   after confirming no remaining imports.
2. Add persisted creator-history cards for first-run outputs so refreshed sessions can reopen generated packages without export-only fallback.
3. Add route smoke tests that assert empty-state CTAs appear for clean accounts on:
   - `/calendar`, `/pipeline`, `/library`, `/platforms`, `/tools`, `/files`, `/notifications`, `/errors`, `/upgrades`.
4. Keep status contract strict across authenticated UI:
   - `Configured`, `Needs approval`, `Not connected`, `Blocked`
   and block new user-facing `Mock` labels.
5. Keep restricted capabilities blocked while continuing product UX polish.

## Immediate Follow-Up (May 14, 2026 - Post De-Mocking)

1. Add route-level persisted history cards for first-run outputs so users can reopen prior generated packages after refresh.
2. Replace remaining non-critical legacy `command-center/*` demo panels with creator-focused empty/history views or archive them behind internal-only flags.
3. Extend empty-state CTA guidance in:
   - `/pipeline`
   - `/library`
   - `/calendar`
   - `/notifications`
   with direct onboarding/workflow actions.
4. Add lightweight journey tests for clean-account UX:
   - no fake stats/feed content rendered
   - onboarding CTA appears when workspace is missing
   - truthful status labels only (`Configured`, `Needs approval`, `Not connected`, `Blocked`).
5. Keep all dangerous capabilities blocked (publishing, unrestricted rendering/browser/provider execution, autonomous retries, workflow mutation).

## Immediate UX/Productization Follow-Up (May 14, 2026)

1. Add route-level persistence for first-run outputs so users can revisit previous draft packages after navigation/reload.
2. Add inline onboarding recovery controls (reset flow, edit earlier answers, continue from saved draft).
3. Add focused creator QA pass on small-screen devices for:
   - `/dashboard`
   - `/onboarding`
   - first-run result sections
4. Add lightweight telemetry for first-run completion funnel (start -> run -> draft viewed -> export action) without changing safety model.
5. Keep all restricted capabilities blocked (publishing, unrestricted rendering, unrestricted browser automation, unrestricted provider execution, autonomous retries).

## Immediate Productization Follow-Up (May 14, 2026)

1. Add route-level first-run workflow cards to `/research-intelligence` and `/content-studio` so users can inspect generated draft package artifacts from the beta run endpoint.
2. Add explicit forced-password-change redirect UX (optional redirect to `/settings`) for invited users after first login.
3. Add focused API tests for:
   - beta user lifecycle endpoints
   - first-run workflow blocked/approval-gate outputs
4. Add lightweight dashboard/mobile polish for conversational dock and first-run result readability on small screens.
5. Keep all dangerous execution flags disabled by default in beta runtime profile.

## Immediate DB Follow-Up (May 14, 2026)

1. Set both `DATABASE_URL` (pooler/runtime) and `DIRECT_URL` (direct CLI/migrations) in local and Vercel envs.
2. Re-run `npm run db:generate` and `npm run db:seed` in any environment that still lacks seeded records.
3. Verify login and protected dashboard routes against the same Supabase project after env sync.
4. Keep all execution flags disabled in preview/public environments.

## Latest Update (May 14, 2026)

A full frontend reset redesign is now applied across Folqen's primary command surfaces:

- New visual system tokens and futuristic panel hierarchy.
- New shell/navigation architecture (sidebar, topbar, mobile drawer).
- New command-center renderer composition for dashboard/agents/workflows/intelligence/infrastructure surfaces.
- New landing page for product storytelling and demo readiness.
- New global loading feedback for link clicks + form submits, plus action-level spinner feedback in mini chat.
- New public-release onboarding flow (`/onboarding`) with conversational setup + workspace creation and topbar workspace switching.

No unsafe execution capabilities were enabled during this redesign slice.

## Immediate Next Phase

Public release preparation now continues with product activation, not infra expansion:

1. Add creator onboarding recovery states (resume/edit draft after partial completion).
2. Add workspace management surface (rename workspace, profile switch, operational profile adjustments).
3. Add guided first-workflow generation panel from onboarding output to research/content workflow runners.
4. Add channel connection architecture UX (safe setup wizard + `Not connected` honesty labels).
5. Add public beta empty-state storytelling and mobile onboarding polish across onboarding/dashboard/topbar.
6. Keep all dangerous execution disabled while improving usability and creator value delivery.

Use `docs/AUTONOMOUS_ORGANIZATION_ARCHITECTURE.md`, `docs/ORCHESTRATION_ARCHITECTURE.md`, `docs/MEMORY_REFLECTION_ARCHITECTURE.md`, `docs/MEDIA_PIPELINE_ARCHITECTURE.md`, `docs/PLATFORM_OPERATIONS_ARCHITECTURE.md`, `docs/GOVERNANCE_SAFETY_ARCHITECTURE.md`, `docs/AI_PROVIDER_GATEWAY_ARCHITECTURE.md`, `docs/CONTROLLED_LIVE_EXECUTION_ARCHITECTURE.md`, `docs/PRODUCTION_DEPLOYMENT_GOVERNANCE.md`, `docs/BROWSER_OPERATIONS_ARCHITECTURE.md`, `docs/SAFE_PREVIEW_DEPLOYMENT.md`, and the command-center frontend as the target design for the next implementation slices. SAFE public preview deployment is now live on `https://folqen.vercel.app` with preview-public mode and dry-run guards. The first live provider capability still only covers governed Gemini intelligence paths and one governed live thumbnail path, all blocked by default until approvals/env/quotas pass. Browser Operations remains dry-run only. `/audit` has approval lifecycle read models, trace verification, diagnostics, correlations, and search. `/infrastructure` has preview deployment diagnostics plus production deployment governance, startup integrity, masked secret checks, Docker/VPS readiness, and rollback readiness. The safest next engineering phase is controlled internal activation rehearsal for one approved live path (Research or Thumbnail) with strict budget and kill-switch validation, plus final route-specific history panel integration.

Continue from provider setup surfaces into credential-backed integrations. All required authenticated routes now have dedicated pages, manual posting package creation/download is live, file registration is live, safe mock-agent draft creation is live, and setup panels exist for Google Drive storage, OpenAI model selection, n8n, and media tools. Binary object storage, paid AI calls, embedded n8n execution, rendering, and real automation are still pending.

Current save point: May 13, 2026, after preview public mode activation support, premium command-center UI refinement, and full verification. The latest live deployment remains `https://folqen.vercel.app`; no production deploy, live database migration application, production credential change, paid tool activation, production provider activation, live AI provider execution, live embeddings, live browser execution, scraping, account automation, live ComfyUI request, FFmpeg execution, unrestricted GPU execution, platform account access, live platform analytics API read, publishing change, autonomous retry, autonomous optimization execution, prompt mutation, self-improvement mutation, workflow mutation, queue mutation, or n8n execution was enabled in this slice. Browser Operations is dry-run only, preview demo auth only works with preview safe mode and forced dry-run, preview public mode requires forced dry-run with execution flags disabled, and a live-capable local-worker thumbnail endpoint still requires explicit env flags, worker endpoint/secret, real approval, budget/quota validation, and kill switches off before any render can happen. The historical cleanup report now lives at `archive/final-cleanup/docs/REPOSITORY_AUDIT_2026-05-13.md`; the previously reviewed `archive/review-required/` component archive was deleted after final reference verification.

The user now wants a 2-day launch sprint so Folqen can be used with the channel from day 3. Treat `docs/2_DAY_LAUNCH_PLAN.md` as the practical launch scope: protected planning, manual posting packages, approvals, audit, and provider setup testing if credentials are available. Do not promise full auto-publishing, real media rendering, or complete multi-platform automation inside 2 days. Folqen now has a `/settings` Connection Wizard for encrypted credential intake inside the app.

The `/platforms` tab now also has a social-platform Connection Wizard near the top, so YouTube/Instagram/Facebook/Snapchat/Threads setup can start from the exact platform manager view.

## Exact Next Tasks

1. Resume from GitHub branch `build/phase-0-foundation` at the latest pushed commit and confirm `git status` is clean.
2. Pull/install dependencies if needed, then run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`.
3. Re-read `docs/AUTONOMOUS_ORGANIZATION_ARCHITECTURE.md` before adding LangGraph, CrewAI, Redis/BullMQ, worker, memory, or provider changes.
4. Re-read `docs/MEMORY_REFLECTION_ARCHITECTURE.md` before applying memory migrations, enabling embeddings, or changing reflection behavior.
5. Re-read `docs/MEDIA_PIPELINE_ARCHITECTURE.md` before enabling media workers, FFmpeg, ComfyUI, storage writes, or live rendering.
6. Re-read `docs/PLATFORM_OPERATIONS_ARCHITECTURE.md` before enabling platform adapters, n8n publishing workflows, analytics ingestion, scheduling, monetization monitoring, or public publishing.
7. Re-read `docs/GOVERNANCE_SAFETY_ARCHITECTURE.md` before changing approvals, policy decisions, provider activation, sandbox behavior, cost controls, or any live execution gate.
8. Re-read `docs/AI_PROVIDER_GATEWAY_ARCHITECTURE.md` before changing provider adapters, fallback routing, model execution, token/cost estimates, or live provider behavior.
9. Re-read `docs/CONTROLLED_LIVE_EXECUTION_ARCHITECTURE.md` before changing activation stages, provider promotion, live quotas, kill switch behavior, emergency stop, or rollback controls.
10. Re-read `docs/PRODUCTION_DEPLOYMENT_GOVERNANCE.md` before changing Docker, VPS, Coolify, startup validation, runtime profiles, secret governance, backup, or rollback behavior.
11. Re-read `docs/BROWSER_OPERATIONS_ARCHITECTURE.md` before changing Browser Operations, Playwright, domain policies, browser traces, screenshot auditing, quarantine, or browser automation flags.
12. Re-read `docs/SAFE_PREVIEW_DEPLOYMENT.md` before deploying a preview, changing preview env, or promoting any deployment.
13. Keep the current verified Next.js `16.2.6` baseline unless the human explicitly asks to downgrade.
12. Check `https://folqen.vercel.app/api/health` and confirm database status remains `live`; if slow again, confirm `vercel inspect` still shows app functions in `icn1`.
12. Before any real live activation, rehearse Stage 1 locally only with explicit human approval, a Gemini key in secret env, `ALLOW_LIVE_AI_EXECUTION=true`, `LIVE_AI_ACTIVATION_STAGE=1`, a real approved `live_execution.provider_activation` approval ID, kill switches off, and one explicit endpoint: `/api/live-execution/research/ideation`, `/api/live-execution/research/workflows`, `/api/live-execution/content/workflows`, or `/api/live-execution/analytics/workflows`. Do not use the generic gateway endpoint for live execution.
13. Review `supabase/migrations/20260512154500_add_memory_reflection_system.sql`, add RLS policies/grants if needed for the final access model, then apply it only after human approval.
14. Verify `/audit`, `/api/operations/traces`, `/api/operations/diagnostics`, `/api/governance/approvals/read-model`, `/infrastructure`, and `/api/deployment/readiness` against production after the next deploy, using authenticated admin access and confirming no raw secrets or unsafe metadata appear.
15. For VPS/Coolify rehearsal, copy `deploy/.env.production.example` to a server-only `.env.production`, fill secrets outside git, run `docker compose -f docker-compose.production.yml up -d --build`, confirm `/api/health`, then confirm `/api/deployment/readiness` from an authenticated session.
15. Connect dashboard/workflow/agent/incident/infrastructure command-center panels to `/api/orchestration/*`, `/api/intelligence/*`, `/api/memory/*`, `/api/media/*`, `/api/platform-ops/*`, `/api/governance/*`, `/api/ai-gateway/*`, and `/api/live-execution/*` where useful.
16. Run local Redis through Docker Compose and test live BullMQ queue movement only after explicitly setting `ORCHESTRATION_EXECUTION_MODE=live` in a local-safe environment.
17. Add command-center loading and error segment states for the new route group.
18. Get a new admin password from the human, then use `/settings` or a safe server-side flow to rotate the seeded admin password.
19. Get explicit human approval to delete or rotate the temporary viewer test account, then verify login/audit behavior.
20. Configure Google Drive OAuth values through secret env only, redeploy, then live-test one small private upload and verify `binaryStored: true`.
21. Alternatively, use `/settings` Connection Wizard to enter Google Drive details inside Folqen, then live-test one small private upload and verify `binaryStored: true`.
22. Use `/settings` Connection Wizard for n8n instance/webhook/secret, then test `POST /api/integrations/n8n/test`.
23. Use `/settings` Connection Wizard or secret env for Gemini only after explicit provider approval, then run a local Stage 1 controlled Research, Content, or Analytics test only when `ALLOW_LIVE_AI_EXECUTION=true`, `LIVE_AI_ACTIVATION_STAGE=1`, an approved activation ID exists, persisted activation state is enabled, budget/quota gates pass, and the kill switch is off.
24. Configure the controlled local thumbnail worker endpoint and shared secret only after explicit human approval, then rehearse one local approved thumbnail render with `ALLOW_CONTROLLED_MEDIA_EXECUTION=true`, `ALLOW_LIVE_THUMBNAIL_RENDERING=true`, `LIVE_MEDIA_ACTIVATION_STAGE=1`, `LIVE_THUMBNAIL_RENDER_STAGE=1`, `THUMBNAIL_RENDER_PROVIDER=local_worker`, a verified approved `media_render` or `thumbnail_render` approval ID, render kill switches off, and no public production traffic. Direct ComfyUI/FFmpeg/GPU execution still needs separate approval and must remain unavailable to Folqen.
25. Prepare a Vercel preview deployment only with `FOLQEN_RUNTIME_PROFILE=preview`, `PREVIEW_SAFE_MODE=true`, `PREVIEW_FORCE_DRY_RUN=true`, `ORCHESTRATION_EXECUTION_MODE=mock`, `ORCHESTRATION_WORKER_ENABLED=false`, `ALLOW_BROWSER_AUTOMATION=false`, all live AI/media/render flags disabled, and preview-only auth/database env values.
26. Verify `/browser-operations`, `/api/browser-ops/overview`, `/api/deployment/preview`, and `/infrastructure` in preview before sharing any URL.
27. Use the `/audit` diagnostics model as the shared read-model pattern, then add route-specific history panels for `/research-intelligence`, `/content-studio`, `/organizational-memory`, media assets/renders, platform operations deployments, AI gateway traces, Browser Operations traces, and controlled live execution traces.
28. Continue broader security hardening, including stronger CSRF patterns, server-side action audits, and provider-secret isolation.

## Human Decisions Needed

Architecture decision needed before dependency churn:

- Keep the current verified Next.js `16.2.6` baseline or explicitly downgrade to Next.js 15.

Required before real provider testing:

- Google Drive OAuth client ID, client secret, refresh token, and target folder ID.
- Oracle n8n webhook URL and shared secret.
- Oracle n8n instance URL and confirmation that iframe embedding is allowed on the self-hosted n8n server.
- OpenAI API key plus explicit approval to create the paid-tool approval flow before real calls are enabled.
- Local or Oracle worker endpoint details for FFmpeg, ComfyUI, and TTS.
- Platform OAuth/API credentials for YouTube, Instagram, Threads, LinkedIn, or X/Twitter only after explicit account-connection and publishing-safety approval.
- Approval before destructive migrations, public publishing, paid tools, browser automation, or OAuth/platform connections.
- Approval before changing governance policy from blocked/sandbox-only to any live execution path.
- Approval before changing AI gateway provider adapters from mock/status-aware placeholders to live network execution.
- Approval before enabling `ALLOW_LIVE_AI_EXECUTION`, setting `LIVE_AI_ACTIVATION_STAGE` above `0`, providing Gemini credentials, or running the first Stage 1 live execution.
- Approval before enabling browser automation, adding live Playwright workers, using browser cookies/account sessions, scraping, uploading files through a browser, or expanding allowed domains beyond preview-safe internal targets.

## Credentials Needed

Needed through safe secret flow only:

- `APP_BASE_URL`
- `NEXTAUTH_URL`
- `DATABASE_URL` is already configured in Vercel production; rotate only if Supabase credentials change again.
- `N8N_WEBHOOK_URL`
- `N8N_WEBHOOK_SECRET`
- `ORACLE_N8N_INSTANCE_URL`
- `GOOGLE_DRIVE_CLIENT_ID`
- `GOOGLE_DRIVE_CLIENT_SECRET`
- `GOOGLE_DRIVE_REFRESH_TOKEN`
- `GOOGLE_DRIVE_FOLDER_ID`
- `OPENAI_API_KEY`
- `OPENROUTER_API_KEY`
- `GEMINI_API_KEY`
- `ANTHROPIC_API_KEY`
- `OPENAI_COMPATIBLE_BASE_URL`
- `OPENAI_COMPATIBLE_API_KEY`
- `OLLAMA_BASE_URL`
- `ALLOW_LIVE_AI_EXECUTION` must stay `false` until explicit activation approval.
- `LIVE_AI_ACTIVATION_STAGE` must stay `0` until explicit activation approval.
- `AI_RUNTIME_KILL_SWITCH`
- `AI_RUNTIME_EMERGENCY_STOP`
- `LOCAL_WORKER_BASE_URL`
- `LOCAL_WORKER_SHARED_SECRET`
- `PREVIEW_SAFE_MODE` should be `true` only in preview.
- `PREVIEW_FORCE_DRY_RUN` must stay `true` for preview.
- `BROWSER_OPERATIONS_SANDBOX_MODE` must stay `true`.
- `BROWSER_OPERATIONS_KILL_SWITCH`
- `BROWSER_OPERATIONS_ALLOWED_DOMAINS`
- `BROWSER_OPERATIONS_BLOCKED_DOMAINS`
- `COMFYUI_BASE_URL`
- `FFMPEG_PATH`
- `TTS_PROVIDER_URL`
- Future platform OAuth/API secrets only after approval; do not add them to repo files.

## Risky Actions Coming Later

- Future database migrations after real user data exists.
- Vercel production deployment changes.
- Oracle n8n webhook execution.
- File upload validation.
- Public publishing logic and scheduling against real accounts.
- Platform analytics ingestion, monetization monitoring, policy/strike monitoring, and account automation.
- Governance policy changes that could permit provider activation, queue live mode, or public execution.
- AI gateway policy/routing changes that could permit live model execution, fallback bypass, uncontrolled retry, or spend.
- Controlled live execution activation, including Gemini provider credentials, stage promotion, kill-switch release, budget threshold changes, or any execution with `ALLOW_LIVE_AI_EXECUTION=true`.
- Paid tool enablement.
- OAuth/platform account connections.
- Production deployment secrets.
- `.env.production` values for Docker/VPS/Coolify only through the server or platform secret manager.
- Approval before enabling production Docker worker profiles, live Redis queue mode, or any startup mode that is not dry-run/mock-safe.
- Approval before setting `ALLOW_LIVE_THUMBNAIL_RENDERING=true`, setting `LIVE_THUMBNAIL_RENDER_STAGE` above `0`, configuring `LOCAL_WORKER_BASE_URL`/`LOCAL_WORKER_SHARED_SECRET`, or running the first live thumbnail render.
- Approval before setting `ALLOW_BROWSER_AUTOMATION=true`, launching Playwright, expanding Browser Operations beyond dry-run, or allowing browser access to social/account/payment domains.

## Resume Command

Continue from branch `build/phase-0-foundation`, read README, all root project docs, and checkpoint docs, run verification, then continue safe Vercel preview deployment rehearsal, Browser Operations trace polish, controlled thumbnail worker setup/rehearsal planning, production readiness rehearsal, VPS/Coolify secret setup guidance, production trace verification, approval decision UX polish, local Stage 1 rehearsal planning, Google Drive storage, n8n embed/webhook setup, AI provider runtime hardening, route-specific read models, platform-ops read models, posting package polish, service-backed mock APIs, or role-aware UI/tests. All required authenticated pages are route-specific, `/browser-operations` is dry-run only, `/audit` has approval lifecycles, trace verification, diagnostics, correlations, and search, `/infrastructure` has preview plus deployment governance diagnostics, `/content-studio` has governed live thumbnail controls, provider setup panels exist, metadata-only file registration is verified, and safe mock-agent draft creation exists.

## Immediate Follow-Up (May 14, 2026 - Final Beta UX Cleanup)

1. Remove or archive unreferenced legacy `src/components/command-center/*` view panels after one final import check.
2. Remove or archive unreferenced legacy app screen modules (`foundation-pages-screens`, `tools-screen`, `platforms-screen`, `pipeline-screen`) if still detached.
3. Add route-smoke assertions that authenticated surfaces do not show fake activity/counters/charts by default for new accounts.
4. Keep status contract strict in authenticated UX: `Configured`, `Needs approval`, `Not connected`, `Blocked`.
5. Continue polish on first-run package persistence/history cards without changing backend architecture.

## Immediate Follow-Up (May 14, 2026 - Auth UX Finalization)

1. Add email delivery integration for password reset and beta invite requests (currently request capture + secure token flow without outbound email provider wiring).
2. Add route-level visual QA on mobile keyboards for `/login`, `/join-beta`, `/forgot-password`, `/reset-password`.
3. Add focused tests for new auth endpoints (`request-beta-access`, `request-reset`, `reset-password`).
4. Add account menu/profile chip polish for signed-in topbar.
5. Keep security posture unchanged while polishing copy and transitions.

## Immediate Follow-Up (May 14, 2026 - Post-Auth Stabilization)

1. Run visual QA for topbar spacing across 1280/1366/1440/1536 widths and mobile breakpoints.
2. Add API tests for happy-path reset completion with a seeded token in a DB-backed test harness (optional, post-beta hardening).
3. Continue creator-facing copy cleanup on remaining operational pages and remove any lingering infra-heavy phrasing.
4. Keep workspace switcher UX visible only where density supports it; avoid reintroducing crowded header layouts.

## Immediate Follow-Up (May 14, 2026 - Login DB Live Connection)

1. Reconnect Supabase MCP connector and target the intended Folqen DB project.
2. Run `npm run db:setup:login` against the live Supabase `DATABASE_URL`.
3. Set Vercel project `folqen` env vars for `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, and admin seed vars.
4. Trigger deployment and verify `/login` -> `/dashboard` with the seeded admin credentials.
5. Rotate temporary admin password immediately after first sign-in.
