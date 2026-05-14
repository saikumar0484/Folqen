# Folqen Orchestration Architecture

## Status

Implemented as a production-shaped, mock-safe TypeScript orchestration layer. It is ready for local Redis/BullMQ testing, but real external provider execution, public publishing, paid API calls, and live platform posting remain blocked by default.

## Runtime Model

Folqen now models the AI organization as:

1. Executive Layer
2. Department Managers
3. Team Leads
4. Worker Agents
5. Utility Agents
6. Error Recovery Agents
7. Optimization Agents

The active registry is in `src/lib/orchestration/registry.ts` and includes the required departments:

- Research Department
- Content Department
- Platform Operations
- Analytics Department
- Optimization Department
- Infrastructure Department
- Error Recovery Department
- Organizational Memory Department

Each agent has role, goals, memory summary, tools, permissions, KPIs, department assignment, current state, task state, workload, and communication channels.

## Core Services

- Agent Registry: `src/lib/orchestration/registry.ts`
- Task Orchestration: `src/lib/orchestration/service.ts`
- Event Bus: `src/lib/orchestration/event-bus.ts`
- Redis Connection: `src/lib/orchestration/redis.ts`
- BullMQ Queues: `src/lib/orchestration/queue.ts`
- LangGraph Flow: `src/lib/orchestration/langgraph-flows.ts`
- CrewAI Coordination Plan: `src/lib/orchestration/crewai-coordination.ts`
- Organizational Memory Hooks: `src/lib/orchestration/memory-hooks.ts`
- Monitoring Hooks: `src/lib/orchestration/monitoring.ts`
- Incident Recovery: `src/lib/orchestration/incidents.ts`
- Worker Entrypoint: `src/workers/orchestration-worker.ts`

## API Surface

- `GET /api/orchestration/registry`
- `GET /api/orchestration/events`
- `GET /api/orchestration/monitoring`
- `POST /api/orchestration/tasks`
- `POST /api/orchestration/workflows/run`
- `GET /api/orchestration/incidents`
- `POST /api/orchestration/incidents`

Mutation routes require authentication, role checks where needed, same-origin checks, the Folqen browser mutation marker, and rate limiting.

## Queue Mode

Default execution mode is mock-safe:

```env
ORCHESTRATION_EXECUTION_MODE="mock"
ORCHESTRATION_WORKER_ENABLED=false
```

Redis/BullMQ live mode requires all of these:

```env
REDIS_URL="redis://localhost:6379"
ORCHESTRATION_EXECUTION_MODE="live"
ORCHESTRATION_WORKER_ENABLED=true
```

Even in live queue mode, workers currently acknowledge jobs only and do not call external AI providers, publishing APIs, paid tools, browser automation, media renderers, or platform integrations.

## Safety Guarantees

- Public publishing remains blocked.
- Paid tool usage remains blocked.
- Browser automation remains blocked.
- CrewAI is represented as a typed coordination plan, not a live Python runtime.
- LangGraph runs a local approval-gated dry-run flow.
- Redis is optional and lazy-loaded.
- BullMQ queues fall back to mock job IDs when Redis/live mode is not enabled.
- Event logs persist to Prisma only when the database is available; otherwise they stay in memory.
- Organizational memory hooks capture events now and expose future vector-memory adapter points.

## Next Orchestration Phases

1. Connect command-center UI panels to the new orchestration APIs.
2. Add durable database tables for orchestration tasks/runs if in-memory/API-only traces are no longer enough.
3. Run Redis locally through Docker Compose and test live BullMQ queue movement.
4. Add a real worker deployment target after human approval.
5. Add provider adapters behind approval and paid-tool guards.
6. Add vector memory after storage/provider decisions are approved.
7. Add n8n workflow triggers only after webhook secrets and approval gates are configured.
