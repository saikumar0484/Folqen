# Deployment Plan

## Chosen MVP Hosting Model

Folqen will use a low-cost hybrid setup:

- **Vercel** hosts the Next.js web app, API routes, previews, and production deployment.
- **Free PostgreSQL** stores app data. Supabase or Neon are acceptable free-tier choices.
- **Oracle Free Tier** runs the user's self-hosted n8n worker for automation.
- **Local/worker tools** such as FFmpeg, ComfyUI, browser automation, and long-running media jobs stay outside Vercel Functions.

This keeps Vercel fast and simple while avoiding serverless limits for heavy automation.

## Current Deployment Readiness

- App builds successfully locally before deployment.
- Safe env defaults exist in `.env.example`.
- Prisma schema exists.
- Seed script exists for realistic mock data.
- Health/status endpoints exist:
  - `GET /api/health`
  - `GET /api/integrations/status`
  - `POST /api/integrations/n8n/test`
- All integrations remain `Not connected` until real env values are configured.

## Vercel Setup Steps

1. Import `saikumar0484/Folqen` into Vercel.
2. Use branch `build/phase-0-foundation` for preview testing until merged.
3. Set framework preset to Next.js.
4. Add environment variables in Vercel, never in git:

```env
ALLOW_PUBLIC_PUBLISH=false
REQUIRE_HUMAN_APPROVAL=true
ALLOW_PAID_TOOLS=false
ALLOW_BROWSER_AUTOMATION=false
DEFAULT_UPLOAD_PRIVACY=private
DATABASE_URL=<free-postgres-connection-string>
AUTH_SECRET=<secure-random-secret>
APP_BASE_URL=<vercel-deployment-url-or-domain>
NEXTAUTH_URL=<vercel-deployment-url-or-domain>
N8N_WEBHOOK_URL=<oracle-n8n-webhook-url>
N8N_WEBHOOK_SECRET=<shared-secret>
ORACLE_N8N_INSTANCE_URL=<oracle-n8n-base-url>
```

5. Run Vercel preview deploy.
6. Verify `/api/health` and `/api/integrations/status`.
7. Run database push/seed only after confirming the database URL points to the intended free database.

## Database Setup

Use either Supabase or Neon free tier.

Recommended first path:

1. Create a free Postgres project.
2. Copy the pooled connection string if the provider recommends it for serverless.
3. Add it as `DATABASE_URL` in Vercel.
4. Pull env locally or add it to `.env` manually outside git.
5. Run:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Human approval is required before any production migration.

## Oracle n8n Worker Setup

Use the existing Oracle Free Tier n8n instance as Folqen's workflow provider.

Minimum n8n workflow:

1. Create a Webhook trigger.
2. Accept `POST` requests.
3. Validate the `x-folqen-secret` header.
4. Log or return a response for `event: "connection_test"`.
5. Return HTTP 200 with a small JSON response.

After setting `N8N_WEBHOOK_URL` and `N8N_WEBHOOK_SECRET`, test from Folqen:

```bash
curl -X POST <APP_BASE_URL>/api/integrations/n8n/test
```

This test does not publish content or use paid tools. It only sends a connection-test event.

## What Must Not Run On Vercel Functions

- Long FFmpeg renders.
- ComfyUI generation.
- Browser automation.
- Long n8n workflows.
- Large file processing.
- Public platform publishing without approval gates.

Folqen should ask the Oracle/local worker to do those jobs and store status back in the database.

## Blockers Before Production

- Authentication is not implemented yet.
- Protected routes are not implemented yet.
- Real database migration must be approved.
- Real n8n webhook secret must be configured safely.
- Platform OAuth credentials are not configured.
- Public publishing remains blocked.
