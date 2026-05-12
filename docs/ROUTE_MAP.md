# Route Map

All required MVP routes exist as Phase 2 placeholders under the app shell.

## Operational Command Center Routes

| Route | Purpose | Current State |
| --- | --- | --- |
| `/dashboard` | Autonomous media company command center | Mock frontend |
| `/agents` | Agent hierarchy, tasks, memory, performance | Mock frontend |
| `/departments` | AI organization department map | Mock frontend |
| `/workflows` | Workflow cards, retries, timeline, logs | Mock frontend |
| `/research-intelligence` | Trend, source, competitor, policy signals | Mock frontend |
| `/content-studio` | Scripts, hooks, captions, metadata, packages | Mock frontend |
| `/analytics` | CTR, retention, engagement, recommendations | Mock frontend |
| `/organizational-memory` | Institutional memory, retrieval, reflection, experiments, prompt/version notes | Mock-safe backend/UI |
| `/automations` | n8n, Redis/BullMQ, retry and fallback status | Not connected |
| `/incident-center` | Failed workflows, escalations, recovery | Mock frontend |
| `/infrastructure` | Redis, queue, provider, worker, database health | Mock frontend |
| `/settings` | Command settings plus live settings forms | Configured shell |

These command-center routes are API-ready mock frontend surfaces. They do not enable live provider execution, public publishing, paid tools, worker jobs, or platform posting.

## Orchestration API Routes

| Route | Purpose | Current State |
| --- | --- | --- |
| `GET /api/orchestration/registry` | Agent registry, departments, and hierarchy layers | Mock-safe backend |
| `GET /api/orchestration/events` | Recent orchestration events | In-memory plus database event log when available |
| `GET /api/orchestration/monitoring` | Database, Redis, queue, agent, and safety status | Dynamic status |
| `POST /api/orchestration/tasks` | Delegate a typed task to a department agent | Approval-gated mock-safe queue |
| `POST /api/orchestration/workflows/run` | Run a LangGraph dry-run and CrewAI-compatible coordination plan | Approval-gated mock-safe workflow |
| `GET /api/orchestration/incidents` | List recent incident events | Mock-safe backend |
| `POST /api/orchestration/incidents` | Report an incident and queue recovery planning | Mock-safe recovery |
| `worker:orchestration` | BullMQ worker entrypoint | Disabled unless Redis live mode and worker flag are enabled |

## Intelligence API Routes

| Route | Purpose | Current State |
| --- | --- | --- |
| `GET /api/intelligence/departments` | Research/Content departments, agents, workflows, providers, and recent runs | Mock-safe backend |
| `GET /api/intelligence/runs` | Recent persisted intelligence workflow runs | Existing-model read model |
| `POST /api/intelligence/research/run` | Run trend, competitor, or viral opportunity research workflow | Mock-safe, approval-gated |
| `POST /api/intelligence/content/run` | Run topic, hook, script, thumbnail, or metadata workflow | Mock-safe, approval-gated |
| `POST /api/intelligence/content/package` | Create a review-gated draft content package from the intelligence layer | Mock-safe, no publishing |

## Memory API Routes

| Route | Purpose | Current State |
| --- | --- | --- |
| `GET /api/memory/overview` | Organizational memory categories, provider status, recent memory, reflections, and recommendations | Mock-safe backend |
| `GET /api/memory/search` | Mock semantic memory retrieval with category/tag filters | Mock-safe backend |
| `POST /api/memory/ingest` | Capture strategic/workflow/prompt/analytics/organizational memory | Admin/operator, mock-safe, no live embeddings |
| `POST /api/memory/reflect` | Run LangGraph dry-run reflection and strategy recommendations | Admin/operator, no workflow mutation |
| `POST /api/memory/experiments` | Track A/B, workflow, prompt, hook, and metadata comparisons | Admin/operator, no automatic rollout |
| `POST /api/memory/prompts/version` | Store prompt versions and capture prompt memory | Admin/operator, needs approval before promotion |

## Media API Routes

| Route | Purpose | Current State |
| --- | --- | --- |
| `GET /api/media/overview` | Media workflows, provider readiness, recent assets, render queue, and failed renders | Mock-safe backend |
| `GET /api/media/assets` | Media asset registry and render queue read model | Existing-model read model |
| `POST /api/media/generate` | Plan thumbnail, image, shorts visual, subtitle, adaptation, or optimization workflows | Admin/operator, dry-run only |
| `POST /api/media/render` | Queue a rendering workflow as a dry-run FFmpeg/media-worker plan | Admin/operator, no FFmpeg execution |
| `POST /api/media/retry` | Plan failed render retry and recovery logs | Admin/operator, no live rendering |

## Platform Operations API Routes

| Route | Purpose | Current State |
| --- | --- | --- |
| `GET /api/platform-ops/overview` | Platform operations dashboard, provider readiness, workflows, deployments, analytics, and monetization hooks | Mock-safe backend |
| `GET /api/platform-ops/deployments` | Content deployment registry and failed publishing recovery read model | Existing-model read model plus in-memory dry runs |
| `POST /api/platform-ops/adapt` | Adapt title, caption, hashtags, aspect ratio, metadata, and template per platform | Admin/operator, dry-run only |
| `POST /api/platform-ops/schedule` | Plan scheduled publishing queue entries and approval checkpoint | Admin/operator, no public posting |
| `POST /api/platform-ops/distribute` | Plan multi-platform distribution across YouTube, Instagram, Threads, TikTok placeholder, LinkedIn, and X/Twitter | Admin/operator, no account automation |
| `POST /api/platform-ops/retry` | Plan failed publishing/upload retry recovery | Admin/operator, no platform API call |
| `POST /api/platform-ops/analytics/collect` | Plan analytics ingestion and engagement metrics linkage | Admin/operator, no scraping or account read |

## Governance API Routes

| Route | Purpose | Current State |
| --- | --- | --- |
| `GET /api/governance/overview` | Governance dashboard, approval queue, policy summary, role matrix, cost controls, provider governance, audit, and sandbox status | Mock-safe backend |
| `POST /api/governance/policy/evaluate` | Evaluate execution policy before risky actions | Admin/operator, dry-run policy decision |
| `POST /api/governance/approvals/request` | Request human approval for risky action checkpoints | Admin/operator, creates approval/audit/event rows |
| `POST /api/governance/approvals/action` | Approve, reject, escalate, retry, or revoke governance approvals | Admin/operator, no live execution |
| `POST /api/governance/sandbox` | Queue isolated dry-run provider/workflow simulation | Admin/operator, mock-safe only |

## MVP Routes

| Route | Purpose | Current State |
| --- | --- | --- |
| `/dashboard` | Command overview | Mock |
| `/agent` | Full agent chat | Mock |
| `/calendar` | Content calendar | Mock |
| `/pipeline` | Content workflow pipeline | Mock |
| `/library` | Content and asset library | Mock |
| `/approvals` | Human approval center | Needs approval |
| `/platforms` | Social platform manager | Not connected |
| `/tools` | Tool registry and limits | Not connected |
| `/settings` | Safe system settings | Configured shell |
| `/analytics` | Performance analytics | Mock |
| `/monetization` | Monetization readiness | Needs approval |
| `/brand` | Brand controls | Mock |
| `/errors` | Error and recovery center | Mock |
| `/audit` | Audit trail | Mock |
| `/workflows` | n8n/workflow hub | Not connected |
| `/files` | File manager | Mock |
| `/notifications` | Signal center | Mock |
| `/upgrades` | Self-improvement proposals | Needs approval |

The public landing page remains at `/`.

## API Routes

| Route | Purpose | Current State |
| --- | --- | --- |
| `GET /api/health` | App, safety, and integration status | Dynamic status |
| `GET /api/integrations/status` | Database, Vercel, worker, n8n, ComfyUI, and FFmpeg status | Dynamic status |
| `POST /api/integrations/n8n/test` | Sends a safe connection-test event to configured n8n webhook | Not connected until env is configured |
| `GET /login` | Secure login screen | Live, waits for database |
| `POST /api/auth/login` | Password login and session cookie creation | Requires database |
| `POST /api/auth/logout` | Clears session cookie | Live |
| `GET /api/auth/me` | Returns current authenticated user | Requires session and database |
