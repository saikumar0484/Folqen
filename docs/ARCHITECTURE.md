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
- Shared UI shell components live under `src/components/app`.
- Reusable route definitions live in `src/lib/app-routes.ts`.
- Provider registry types live in `src/lib/providers.ts`.
- Environment validation lives in `src/lib/env.ts`.
- Safety guard functions live in `src/lib/security/guards.ts`.
- Prisma schema foundation lives in `prisma/schema.prisma`.

## Future-Proof Rules

- Select providers by capability, not provider name.
- Keep provider status honest: `not_connected`, `configured`, `testing`, `live`, `failed`, `disabled`, `deprecated`, or `needs_attention`.
- Version settings and prompts.
- Log meaningful events for content, approvals, publishing blocks, provider changes, upgrade proposals, and agent commands.
- Keep risky features behind feature flags and human approvals.

## Current Integration State

All live integrations are intentionally `Not connected`. This includes YouTube, Instagram, Facebook, Snapchat, Threads, Substack, LinkedIn, Bluesky, Lemon8, Kick, n8n, ComfyUI, FFmpeg, TTS, browser automation, and analytics providers.
