# Platform Operations and Publishing Infrastructure

## Purpose

Folqen's Platform Operations layer is the distribution department for the autonomous creator organization. It plans publishing, scheduling, platform adaptation, retry recovery, analytics ingestion, distribution tracking, and monetization monitoring without touching real social accounts.

This layer is intentionally mock-safe in the current slice:

- No public posting.
- No platform credentials.
- No account automation.
- No browser automation.
- No scraping.
- No live n8n workflow execution.
- No paid platform API calls.

## Runtime Shape

```text
Platforms UI
  -> /api/platform-ops/*
  -> Platform Operations Service
  -> LangGraph dry-run workflow
  -> BullMQ queue adapter
  -> EventLog / AuditLog / WorkflowRun / AgentTask / AnalyticsRecord
  -> manual posting package and approval checkpoints
```

## Supported Platform Infrastructure

The active platform operations registry supports YouTube, Instagram, Threads, TikTok as a requested placeholder only, LinkedIn, and X/Twitter.

Folqen's India platform rule still applies. TikTok must not become a dependency for India distribution. It is represented as infrastructure-only and mock/manual fallback until a future human-approved strategy changes that rule.

## Workflows

The layer defines seven dry-run workflows:

- Scheduled Publishing
- Multi-Platform Distribution
- Publishing Retry Recovery
- Failed Upload Recovery
- Platform Adaptation Workflow
- Analytics Collection Workflow
- Engagement Monitoring Workflow

Each workflow validates input, checks provider/account safety, adapts metadata, creates deployment plans, enqueues mock queue jobs, emits orchestration events, and captures approval checkpoints.

## Queue Infrastructure

The orchestration queue registry now includes:

- `folqen.publishing`
- `folqen.scheduling`
- `folqen.publishing.retry`

When Redis/BullMQ live mode is disabled, queue jobs return mock queue metadata. Live workers remain disabled unless explicitly configured in a future approved phase.

## Provider Abstraction

Provider statuses are exposed through `src/lib/platform-ops/providers.ts`:

- Mock Publishing Planner
- n8n Workflow Provider
- YouTube Data API
- Instagram Graph API
- Threads API
- TikTok API Placeholder
- LinkedIn API
- X/Twitter API

Every provider returns `livePublishingEnabled: false`. Credentials, when eventually present, should move a provider to `Blocked` or `Configured`, never `Live`, until publishing guards, approvals, policy checks, and account permissions are implemented.

## Persistence

No schema migration was added.

The service uses existing flexible models:

- `WorkflowRun` stores platform operation input/output/logs.
- `AgentTask` stores distribution work units.
- `EventLog` stores operational events.
- `AuditLog` stores safety-relevant actions.
- `AnalyticsRecord` stores dry-run analytics ingestion snapshots.

TikTok and X/Twitter are not in the current Prisma `PlatformName` enum, so analytics rows for those platform operations remain metadata-only and do not write unsupported enum values.

## APIs

- `GET /api/platform-ops/overview`
- `GET /api/platform-ops/deployments`
- `POST /api/platform-ops/adapt`
- `POST /api/platform-ops/schedule`
- `POST /api/platform-ops/distribute`
- `POST /api/platform-ops/retry`
- `POST /api/platform-ops/analytics/collect`

All mutations require authentication, admin/operator permissions, the Folqen mutation marker, same-origin/rate-limit guard, Zod validation, and audit/event logging.

## Frontend Integration

The `/platforms` page now includes the Platform Operations Department panel with provider status, workflow registry, distribution workflow runner, platform selection, schedule dry-run action, multi-platform distribution planning, analytics ingestion planning, failed publishing retry planning, deployment registry, monetization and policy watch, and explicit safety labels.

## Safety Boundary

The current implementation only creates plans. It must not be extended to call platform APIs until a future approved slice adds OAuth account connection, provider-specific permission checks, content review and copyright verification, approval record linkage, idempotency keys, real queue workers, platform API integration tests, rollback workflows, and explicit human approval for public publishing.
