<<<<<<< ours
# Architecture

Folqen is designed as a modular creator operations platform, not a hardcoded one-time app.

## Layers

```text
UI Layer
API Layer
Agent Orchestration Layer
Service Interfaces
Provider Adapters / Plugins
External Tools / Local Tools / Platforms
```

The UI does not call external tools directly. Pages call app services, services call provider interfaces, and provider adapters own tool-specific details.

## Foundation Choices

- Next.js App Router keeps route UI under `src/app`.
- Vercel is the intended app hosting target.
- Free PostgreSQL is the intended database target for MVP real data.
- Oracle Free Tier n8n is the intended self-hosted workflow worker.
- Heavy media/automation jobs stay outside Vercel Functions and run through worker/provider adapters.
- Shared UI shell components live under `src/components/app`.
- Reusable route definitions live in `src/lib/app-routes.ts`.
- Provider registry types live in `src/lib/providers.ts`.
- Environment validation lives in `src/lib/env.ts`.
- Safety guard functions live in `src/lib/security/guards.ts`.
- Prisma schema foundation lives in `prisma/schema.prisma`.
- Lazy Prisma client and database status helpers live in `src/lib/db.ts`.
- Integration status helpers live in `src/lib/integrations`.

## Future-Proof Rules

- Select providers by capability, not provider name.
- Keep provider status honest: `not_connected`, `configured`, `testing`, `live`, `failed`, `disabled`, `deprecated`, or `needs_attention`.
- Version settings and prompts.
- Log meaningful events for content, approvals, publishing blocks, provider changes, upgrade proposals, and agent commands.
- Keep risky features behind feature flags and human approvals.

## Current Integration State

All live integrations are intentionally `Not connected`. This includes YouTube, Instagram, Facebook, Snapchat, Threads, Substack, LinkedIn, Bluesky, Lemon8, Kick, n8n, ComfyUI, FFmpeg, TTS, browser automation, and analytics providers.
=======
# Folqen Architecture (Phase 0 Draft)

## Layered Architecture

```text
UI Layer (Next.js App Router pages/components)
  -> API Layer (Route Handlers / server actions)
    -> Agent Orchestration Layer (task workflows, approval-aware command handling)
      -> Service Interfaces (typed contracts)
        -> Provider Adapters / Plugins (mock or configured)
          -> External Platforms / Local Tools / Workflow Engines
```

## Architectural Principles

- Capability-based provider selection (never hardcode provider names).
- Strict separation of UI from external integrations.
- Human approval gates for risky operations (publishing, paid tools, upgrades).
- Migration-safe relational schema with extensible JSON metadata.
- Event and audit logging for every critical workflow decision.

## Provider/Service Interface Baseline

Planned interfaces:

- `LLMProvider`
- `ImageGenerationProvider`
- `VideoGenerationProvider`
- `VoiceGenerationProvider`
- `TranscriptionProvider`
- `CaptionProvider`
- `RenderProvider`
- `WorkflowProvider`
- `PublishingProvider`
- `AnalyticsProvider`
- `StorageProvider`
- `NotificationProvider`
- `AuthProvider`
- `VectorMemoryProvider`
- `BrowserAutomationProvider`

Provider statuses:

- `not_connected`
- `configured`
- `testing`
- `live`
- `failed`
- `disabled`
- `deprecated`
- `needs_attention`

## MVP Implementation Direction

- Initialize with mock-first adapters that return truthful status values.
- Introduce Provider Registry storage model in Prisma phase.
- Implement explicit fallback behavior (`Not connected`, manual package generation).
- Keep n8n/ComfyUI/FFmpeg integrations as placeholders until configured.

## Required Architecture Documentation (future phases)

- `docs/PROVIDER_GUIDE.md`
- `docs/PLUGIN_GUIDE.md`
- `docs/UPGRADE_GUIDE.md`
>>>>>>> theirs
