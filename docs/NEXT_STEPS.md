# Next Steps

## Immediate Next Phase

Continue from provider setup surfaces into credential-backed integrations. All required authenticated routes now have dedicated pages, manual posting package creation/download is live, file registration is live, safe mock-agent draft creation is live, and setup panels exist for Google Drive storage, OpenAI model selection, n8n, and media tools. Binary object storage, paid AI calls, embedded n8n execution, rendering, and real automation are still pending.

Current save point: May 7, 2026, after app-marked mutation hardening, visible UI hardening, and the Vercel speed fix. The live app is deployed at `https://folqen.vercel.app`, health reports database `live`, Vercel Functions run in Seoul (`icn1`) near Supabase, and real Drive uploads remain blocked until Google OAuth env values plus a private folder id are configured.

The user now wants a 2-day launch sprint so Folqen can be used with the channel from day 3. Treat `docs/2_DAY_LAUNCH_PLAN.md` as the practical launch scope: protected planning, manual posting packages, approvals, audit, and provider setup testing if credentials are available. Do not promise full auto-publishing, real media rendering, or complete multi-platform automation inside 2 days. Folqen now has a `/settings` Connection Wizard for encrypted credential intake inside the app.

The `/platforms` tab now also has a social-platform Connection Wizard near the top, so YouTube/Instagram/Facebook/Snapchat/Threads setup can start from the exact platform manager view.

## Exact Next Tasks

1. Resume from GitHub branch `build/phase-0-foundation` at or after commit `1a78e1b` and confirm `git status` is clean.
2. Pull/install dependencies if needed, then run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`.
3. Check `https://folqen.vercel.app/api/health` and confirm database status remains `live`; if slow again, confirm `vercel inspect` still shows app functions in `icn1`.
4. Get a new admin password from the human, then use `/settings` or a safe server-side flow to rotate the seeded admin password.
5. Get explicit human approval to delete or rotate the temporary viewer test account, then verify login/audit behavior.
6. Configure Google Drive OAuth values through secret env only, redeploy, then live-test one small private upload and verify `binaryStored: true`.
7. Alternatively, use `/settings` Connection Wizard to enter Google Drive details inside Folqen, then live-test one small private upload and verify `binaryStored: true`.
8. Use `/settings` Connection Wizard for n8n instance/webhook/secret, then test `POST /api/integrations/n8n/test`.
9. Use `/settings` Connection Wizard for OpenAI API key, request/approve the OpenAI provider approval in Folqen, then add a real-generation endpoint that still checks paid-tool guards before every call.
9. Configure local or Oracle worker endpoints for FFmpeg, ComfyUI, and TTS, then add test-only connection checks.
10. Configure local or Oracle worker endpoints for FFmpeg, ComfyUI, and TTS, then add test-only connection checks.
11. Use the dashboard Day-3 launch readiness section to drive the remaining 2-day launch tasks.
12. Continue expanding role-aware UI states across settings, packages, files, providers, and future action APIs.
13. Wire the service interface foundation into workflow test APIs while keeping real execution blocked.
14. Continue broader security hardening, including stronger CSRF patterns, server-side action audits, and provider-secret isolation.

## Human Decisions Needed

Required before real provider testing:

- Google Drive OAuth client ID, client secret, refresh token, and target folder ID.
- Oracle n8n webhook URL and shared secret.
- Oracle n8n instance URL and confirmation that iframe embedding is allowed on the self-hosted n8n server.
- OpenAI API key plus explicit approval to create the paid-tool approval flow before real calls are enabled.
- Local or Oracle worker endpoint details for FFmpeg, ComfyUI, and TTS.
- Approval before destructive migrations, public publishing, paid tools, browser automation, or OAuth/platform connections.

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
- `LOCAL_WORKER_BASE_URL`
- `LOCAL_WORKER_SHARED_SECRET`
- `COMFYUI_BASE_URL`
- `FFMPEG_PATH`
- `TTS_PROVIDER_URL`

## Risky Actions Coming Later

- Future database migrations after real user data exists.
- Vercel production deployment changes.
- Oracle n8n webhook execution.
- File upload validation.
- Public publishing logic.
- Paid tool enablement.
- OAuth/platform account connections.
- Production deployment secrets.

## Resume Command

Continue from branch `build/phase-0-foundation`, read README, all root project docs, and checkpoint docs, run verification, then continue Google Drive storage, n8n embed/webhook setup, OpenAI paid-tool approval, media worker setup, posting package polish, service-backed mock APIs, or role-aware UI/tests. All required authenticated pages are route-specific, provider setup panels exist, metadata-only file registration is verified, and safe mock-agent draft creation exists.
