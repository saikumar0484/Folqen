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
| `/organizational-memory` | Brand memory, decisions, prompt/version notes | Mock frontend |
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
