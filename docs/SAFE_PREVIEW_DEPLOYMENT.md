# Safe Preview Deployment

## Goal

Prepare Folqen for a preview deployment that shows the UI, workflow previews, traces, dashboards, and operational visualization without enabling live execution.

Preview is for:

- UI preview
- workflow preview
- operational visualization
- controlled internal testing

Preview is not for:

- public publishing
- real AI provider execution
- rendering execution
- browser execution
- queue workers
- autonomous retries
- platform account automation

## Required Preview Flags

Use preview-only environment variables in Vercel Preview or a local `.env.preview`.

```env
FOLQEN_RUNTIME_PROFILE=preview
PREVIEW_SAFE_MODE=true
PREVIEW_PUBLIC_MODE=true
PREVIEW_FORCE_DRY_RUN=true
ALLOW_PUBLIC_PUBLISH=false
ALLOW_PAID_TOOLS=false
ALLOW_BROWSER_AUTOMATION=false
ORCHESTRATION_EXECUTION_MODE=mock
ORCHESTRATION_WORKER_ENABLED=false
ALLOW_LIVE_AI_EXECUTION=false
LIVE_AI_ACTIVATION_STAGE=0
ALLOW_CONTROLLED_MEDIA_EXECUTION=false
ALLOW_LIVE_THUMBNAIL_RENDERING=false
LIVE_MEDIA_ACTIVATION_STAGE=0
LIVE_THUMBNAIL_RENDER_STAGE=0
BROWSER_OPERATIONS_SANDBOX_MODE=true
```

Do not add provider, platform, OAuth, render worker, or paid-tool secrets to preview.

## Vercel Preview Setup

1. Add preview environment variables in Vercel, not in source control.
2. Use `deploy/.env.preview.example` as the template.
3. Keep `AUTH_SECRET`, `DATABASE_URL`, `NEXTAUTH_URL`, `APP_BASE_URL`, and `CREDENTIAL_ENCRYPTION_KEY` preview-specific.
4. For public UI preview screenshots, set `PREVIEW_PUBLIC_MODE=true`. This bypasses page login only in preview safe mode and returns a viewer identity; dangerous mutations stay role-blocked and execution flags must stay disabled.
5. Deploy a preview build from a non-production branch.
6. Visit `/api/health`, then inspect `/dashboard`, `/infrastructure`, `/audit`, and `/browser-operations`.

Suggested commands:

```bash
vercel env add FOLQEN_RUNTIME_PROFILE preview
vercel env add PREVIEW_SAFE_MODE preview
vercel env add PREVIEW_FORCE_DRY_RUN preview
vercel deploy
```

## Preview Diagnostics

Folqen exposes preview diagnostics in:

- `/infrastructure`
- `GET /api/deployment/preview`
- `GET /api/deployment/readiness`

The preview diagnostics check:

- preview runtime profile
- forced dry-run mode
- publishing disabled
- paid tools disabled
- live AI disabled
- rendering disabled
- browser execution disabled
- queue workers disabled
- minimal secrets only

## Safe Preview Middleware

When `PREVIEW_SAFE_MODE=true` or `VERCEL_ENV=preview`, protected page responses include:

- `X-Folqen-Preview-Mode: safe`
- `X-Folqen-Execution-Mode: dry-run`
- `X-Robots-Tag: noindex, nofollow`

When `PREVIEW_PUBLIC_MODE=true`, these headers also mark direct dashboard access as public-safe preview access. This does not enable provider execution, rendering, publishing, browser automation, queue workers, or mutation permissions.

## Verification Checklist

- `eslint .`
- `tsc --noEmit`
- `tsx --test "src/**/*.test.ts"`
- `prisma generate && next build`
- `GET /api/health` returns `200`
- anonymous protected preview APIs return `401` unless `PREVIEW_PUBLIC_MODE=true`; in public mode, read-only preview APIs may return safe viewer data while mutations remain `403` or blocked by mutation guards.
- Browser Operations dashboard shows `Dry-run only`
- Preview diagnostics show no blocked unsafe runtime flags

## Rollback

If preview ever shows unsafe status:

1. Set `PREVIEW_FORCE_DRY_RUN=true`.
2. Set `ALLOW_PUBLIC_PUBLISH=false`.
3. Set `ALLOW_PAID_TOOLS=false`.
4. Set `ALLOW_BROWSER_AUTOMATION=false`.
5. Set `ORCHESTRATION_EXECUTION_MODE=mock`.
6. Set `ORCHESTRATION_WORKER_ENABLED=false`.
7. Set all live AI/media/render activation stages to `0`.
8. Redeploy preview.

Do not promote a preview deployment to production unless production governance checks also pass and the human approves.
