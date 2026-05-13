# Folqen Production Deployment Governance

This phase prepares Folqen for production VPS deployment without enabling publishing, unrestricted rendering, unrestricted providers, platform automation, autonomous retries, or workflow mutation.

## Production Safety Model

Folqen must boot with safe defaults:

- `ALLOW_PUBLIC_PUBLISH=false`
- `REQUIRE_HUMAN_APPROVAL=true`
- `ALLOW_PAID_TOOLS=false`
- `ALLOW_BROWSER_AUTOMATION=false`
- `DEFAULT_UPLOAD_PRIVACY=private`
- `STARTUP_DRY_RUN_MODE=true`
- `ORCHESTRATION_EXECUTION_MODE=mock`

Production readiness is surfaced through:

- `/infrastructure` deployment governance panel
- `GET /api/deployment/readiness`
- Docker health checks
- masked secret diagnostics
- rollback and quarantine readiness indicators

The diagnostics are read-only. They must not start queues, activate providers, render media, post content, mutate workflows, or expose raw secret values.

## Runtime Profiles

Supported profiles:

- `local`: development and checkpoint verification.
- `docker`: production Docker Compose on a VPS.
- `vps`: manually supervised VPS deployment.
- `coolify`: Coolify-managed deployment.
- `vercel`: future hosted web deployment.

Use a production profile only after `AUTH_SECRET`, `DATABASE_URL`, `CREDENTIAL_ENCRYPTION_KEY`, rollback procedures, and backups are ready.

## Docker Deployment

Files:

- `Dockerfile.production`
- `docker-compose.production.yml`
- `deploy/.env.production.example`

Server setup:

```bash
cp deploy/.env.production.example .env.production
```

Then fill secrets on the server or in Coolify. Do not commit `.env.production`.

Start app, Postgres, and Redis:

```bash
docker compose -f docker-compose.production.yml up -d --build
```

The worker profile remains disabled by default. Only enable it after queue governance passes:

```bash
docker compose -f docker-compose.production.yml --profile workers up -d --build
```

Keep `ORCHESTRATION_WORKER_ENABLED=false` until live queue execution is explicitly approved.

## Coolify Readiness

Use Coolify secrets rather than committing `.env.production`.

Recommended services:

- Next.js app from `Dockerfile.production`
- PostgreSQL 16 service with persistent volume
- Redis 7 service with append-only persistence

Required Coolify checks:

- app health check reaches `/api/health`
- database and Redis are not publicly exposed
- deployment rollback is enabled
- secrets are scoped to the Folqen project
- startup profile is `coolify`

## Oracle VPS Guidance

Oracle Always Free can run the low-cost MVP if the server is hardened:

- create a non-root deploy user
- enable UFW for only SSH, HTTP, and HTTPS
- enable swap on small instances
- install Docker and Compose plugin
- store Postgres and Redis in named volumes
- keep Postgres and Redis private
- use Caddy, Nginx, or Coolify for HTTPS
- rehearse backup restore before launch

## Hetzner VPS Guidance

Hetzner is suitable for a paid production VPS after:

- firewall rules allow only SSH, HTTP, and HTTPS
- automatic security updates are enabled
- snapshots are configured
- off-host Postgres backups are scheduled
- restore rehearsal is complete
- DNS and TLS are verified

## Reverse Proxy Guidance

Expose only the web app. Keep Postgres and Redis private.

Caddy example:

```caddyfile
folqen.example.com {
  encode gzip zstd
  reverse_proxy 127.0.0.1:3000
}
```

Nginx should terminate TLS and proxy to `127.0.0.1:3000`. Preserve security headers from Next.js and do not expose internal services.

## Backup And Recovery

Database backup:

```bash
docker exec folqen-postgres-prod pg_dump -U folqen folqen > deploy/backups/folqen-$(date +%F).sql
```

Restore rehearsal:

```bash
docker exec -i folqen-postgres-prod psql -U folqen folqen < deploy/backups/folqen-YYYY-MM-DD.sql
```

Redis persistence:

- Redis runs with append-only file enabled.
- Back up the Redis volume only after stopping writes or taking a filesystem snapshot.
- Redis is operational state, not the system of record. PostgreSQL remains source of truth.

Rollback:

1. Set `STARTUP_ROLLBACK_MODE=true`.
2. Set `ALLOW_LIVE_AI_EXECUTION=false`.
3. Set `ALLOW_CONTROLLED_MEDIA_EXECUTION=false`.
4. Keep `ALLOW_PUBLIC_PUBLISH=false`.
5. Drain or stop workers.
6. Redeploy the previous image or commit.
7. Verify `/api/health` and `/api/deployment/readiness`.

Emergency quarantine:

1. Set `STARTUP_QUARANTINE_MODE=true`.
2. Set `AI_RUNTIME_EMERGENCY_STOP=true`.
3. Set `MEDIA_RENDER_EMERGENCY_STOP=true`.
4. Rotate impacted provider secrets.
5. Review audit and trace dashboards.

## Human Approval Triggers

Ask for human approval before:

- entering production public deployment
- enabling worker queues
- enabling Gemini or any paid provider
- enabling controlled rendering
- adding public publishing credentials
- restoring or replacing production data
- changing backup retention
- exposing any new network port

## Verification Checklist

Before production deployment:

- lint, typecheck, tests, and build pass
- `/infrastructure` shows no critical environment blockers
- `GET /api/deployment/readiness` is protected by login
- secrets are masked in diagnostics
- Docker volumes are persistent
- reverse proxy TLS is active
- backup restore rehearsal is complete
- rollback to dry-run has been tested
