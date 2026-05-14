# Folqen Memory & Reflection Intelligence Architecture

## Purpose

Folqen's Organizational Memory & Reflection Intelligence System is the institutional learning layer for the AI creator organization. It is designed to remember operating history, retrieve relevant context, reflect on results, track experiments, version prompts, and propose strategy improvements without automatically mutating workflows or executing paid providers.

## Core Services

- `Organizational Memory Service`: captures strategic, workflow, prompt, analytics, and organizational memory records.
- `Agent Memory Service`: stores agent-linked summaries through `agentId`, `departmentId`, and scoped memory metadata.
- `Workflow Memory Service`: connects workflow runs, retries, incidents, and bottlenecks to retrievable memory.
- `Analytics Memory Service`: stores metric patterns and recommendations as analytics memory.
- `Reflection Engine`: runs LangGraph dry-run reflection steps to compare memory, score quality, and draft recommendations.
- `Experiment Tracking System`: records A/B, workflow, prompt, hook, and metadata comparisons without automatic rollout.
- `Prompt Versioning System`: stores prompt versions and captures prompt memory while keeping promotion approval-gated.
- `Strategy Evolution System`: creates strategy recommendations from reflections only; it does not mutate live workflows.
- `Knowledge Retrieval System`: retrieves cross-category memory with mock semantic scoring.
- `Semantic Search Layer`: pgvector-ready schema, deterministic mock embeddings, and future provider adapters.

## Data Model

Prisma now includes pgvector-ready memory models:

- `MemoryEntry`: institutional memory with category, scope, subject, tags, importance, confidence, source, metadata, and an optional `Unsupported("vector")` embedding column.
- `MemoryReflection`: dry-run reflection reports linked to memory entries or workflow runs.
- `ExperimentRecord`: tracked comparisons for prompts, hooks, workflows, metadata, and A/B tests.
- Existing `PromptVersion` remains the prompt source of truth and is now connected to memory through service logic.

The reviewed SQL lives in `supabase/migrations/20260512154500_add_memory_reflection_system.sql`. It enables `pgvector`, creates the memory tables, adds search indexes, adds an IVFFlat cosine index for future embeddings, and enables RLS. The migration was not applied to production in this slice.

## Runtime Flow

1. A user or agent submits a memory, search, reflection, experiment, or prompt-version request.
2. Protected API routes validate auth, admin/operator permissions, same-origin mutation markers, rate limits, and Zod schemas.
3. Services enqueue mock-safe jobs through the existing memory queue.
4. Events are emitted through the orchestration event bus and audit logs are written when the database is available.
5. Reflection runs through a LangGraph dry-run graph:
   - validate scope
   - retrieve context
   - compare previous runs
   - score quality
   - generate recommendations
6. Results remain recommendations or memory records. No workflow, prompt, publishing, or provider state is mutated automatically.

## Provider Safety

Default provider:

- `MEMORY_EMBEDDINGS_PROVIDER=mock`
- `MEMORY_EMBEDDING_DIMENSIONS=1536`

OpenAI and Gemini embedding adapters are status-aware placeholders only. Live embeddings remain blocked until a future slice adds credentials, explicit paid-tool approval, human approval, provider execution guards, and verification.

## API Surface

- `GET /api/memory/overview`
- `GET /api/memory/search`
- `POST /api/memory/ingest`
- `POST /api/memory/reflect`
- `POST /api/memory/experiments`
- `POST /api/memory/prompts/version`

Mutation routes require authenticated admin/operator users, the Folqen mutation marker, same-origin checks, rate limits, and schema validation.

## Frontend Integration

`/organizational-memory` now includes a live mock-safe panel for:

- memory visualization
- mock semantic retrieval inspection
- memory ingestion
- dry-run reflection
- experiment tracking
- strategy recommendations

All status labels remain honest: `Mock`, `Not connected`, `Needs approval`, `Configured`, or `Blocked`.

## Safety Boundaries

- No live embeddings provider is called.
- No paid AI provider is used.
- No destructive memory action exists.
- No workflow, prompt, strategy, publishing, or provider configuration is automatically changed.
- Migration SQL is committed for review but not applied to Supabase production.
