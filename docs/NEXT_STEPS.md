# Next Steps

## Immediate Next Phase

Use `docs/AUTONOMOUS_ORGANIZATION_ARCHITECTURE.md`, `docs/ORCHESTRATION_ARCHITECTURE.md`, `docs/MEMORY_REFLECTION_ARCHITECTURE.md`, `docs/MEDIA_PIPELINE_ARCHITECTURE.md`, `docs/PLATFORM_OPERATIONS_ARCHITECTURE.md`, `docs/GOVERNANCE_SAFETY_ARCHITECTURE.md`, `docs/AI_PROVIDER_GATEWAY_ARCHITECTURE.md`, `docs/CONTROLLED_LIVE_EXECUTION_ARCHITECTURE.md`, and the command-center frontend as the target design for the next implementation slices. The first live provider capability now covers Gemini Research ideation, governed Research intelligence workflows, governed Content intelligence workflows, and governed Analytics feedback intelligence workflows, but it remains blocked by default. `/audit` now has approval lifecycle read models, trace verification, diagnostics, correlations, and search. The safest next engineering phase is production trace verification against the deployed app, approval decision UX polish, local activation rehearsal planning, and credential setup guidance without enabling production execution.

Continue from provider setup surfaces into credential-backed integrations. All required authenticated routes now have dedicated pages, manual posting package creation/download is live, file registration is live, safe mock-agent draft creation is live, and setup panels exist for Google Drive storage, OpenAI model selection, n8n, and media tools. Binary object storage, paid AI calls, embedded n8n execution, rendering, and real automation are still pending.

Current save point: May 13, 2026, after the Production Governance & Trace Verification Hardening expansion. The latest live deployment remains `https://folqen.vercel.app`; no production deploy, live database migration application, credential change, paid tool activation, production provider activation, live AI provider execution, live embeddings, live ComfyUI request, FFmpeg process execution, unrestricted GPU execution, binary media write, platform account access, live platform analytics API read, scraping, publishing change, autonomous retry, autonomous optimization execution, prompt mutation, self-improvement mutation, workflow mutation, queue mutation, or n8n execution was enabled in this slice.

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
10. Keep the current verified Next.js `16.2.6` baseline unless the human explicitly asks to downgrade.
11. Check `https://folqen.vercel.app/api/health` and confirm database status remains `live`; if slow again, confirm `vercel inspect` still shows app functions in `icn1`.
12. Before any real live activation, rehearse Stage 1 locally only with explicit human approval, a Gemini key in secret env, `ALLOW_LIVE_AI_EXECUTION=true`, `LIVE_AI_ACTIVATION_STAGE=1`, a real approved `live_execution.provider_activation` approval ID, kill switches off, and one explicit endpoint: `/api/live-execution/research/ideation`, `/api/live-execution/research/workflows`, `/api/live-execution/content/workflows`, or `/api/live-execution/analytics/workflows`. Do not use the generic gateway endpoint for live execution.
13. Review `supabase/migrations/20260512154500_add_memory_reflection_system.sql`, add RLS policies/grants if needed for the final access model, then apply it only after human approval.
14. Verify `/audit`, `/api/operations/traces`, `/api/operations/diagnostics`, and `/api/governance/approvals/read-model` against production after the next deploy, using authenticated admin access and confirming no raw secrets or unsafe metadata appear.
15. Connect dashboard/workflow/agent/incident/infrastructure command-center panels to `/api/orchestration/*`, `/api/intelligence/*`, `/api/memory/*`, `/api/media/*`, `/api/platform-ops/*`, `/api/governance/*`, `/api/ai-gateway/*`, and `/api/live-execution/*` where useful.
16. Run local Redis through Docker Compose and test live BullMQ queue movement only after explicitly setting `ORCHESTRATION_EXECUTION_MODE=live` in a local-safe environment.
17. Add command-center loading and error segment states for the new route group.
18. Get a new admin password from the human, then use `/settings` or a safe server-side flow to rotate the seeded admin password.
19. Get explicit human approval to delete or rotate the temporary viewer test account, then verify login/audit behavior.
20. Configure Google Drive OAuth values through secret env only, redeploy, then live-test one small private upload and verify `binaryStored: true`.
21. Alternatively, use `/settings` Connection Wizard to enter Google Drive details inside Folqen, then live-test one small private upload and verify `binaryStored: true`.
22. Use `/settings` Connection Wizard for n8n instance/webhook/secret, then test `POST /api/integrations/n8n/test`.
23. Use `/settings` Connection Wizard or secret env for Gemini only after explicit provider approval, then run a local Stage 1 controlled Research, Content, or Analytics test only when `ALLOW_LIVE_AI_EXECUTION=true`, `LIVE_AI_ACTIVATION_STAGE=1`, an approved activation ID exists, persisted activation state is enabled, budget/quota gates pass, and the kill switch is off.
24. Configure local or Oracle worker endpoints for FFmpeg, ComfyUI, and TTS, then add test-only connection checks. Controlled media rendering now has gated packets and shutdown controls, but real ComfyUI/FFmpeg/GPU execution still needs explicit human approval, provider/worker enforcement, and safe sandbox rehearsal.
25. Use the `/audit` diagnostics model as the shared read-model pattern, then add route-specific history panels for `/research-intelligence`, `/content-studio`, `/organizational-memory`, media assets/renders, platform operations deployments, AI gateway traces, and controlled live execution traces.
26. Continue broader security hardening, including stronger CSRF patterns, server-side action audits, and provider-secret isolation.

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

## Resume Command

Continue from branch `build/phase-0-foundation`, read README, all root project docs, and checkpoint docs, run verification, then continue production trace verification, approval decision UX polish, local Stage 1 rehearsal planning, Google Drive storage, n8n embed/webhook setup, AI provider runtime hardening, media worker setup, route-specific read models, platform-ops read models, posting package polish, service-backed mock APIs, or role-aware UI/tests. All required authenticated pages are route-specific, `/audit` has approval lifecycles, trace verification, diagnostics, correlations, and search, provider setup panels exist, metadata-only file registration is verified, and safe mock-agent draft creation exists.
