# FUTURE_PROOF_ARCHITECTURE.md

## Purpose

Folqen must not be built only for today's tools. AI models, APIs, video generators, social platforms, automation tools, and content formats will change quickly.

Build Folqen as a modular platform so future tools can be added without rebuilding the whole project.

## Core rules

Use provider adapters, plugin-style integrations, service interfaces, feature flags, versioned config, migration-safe database design, queue/event-based jobs, and clear separation between UI, agent logic, tools, and platforms.

Architecture:

```text
UI Layer
  ↓
API Layer
  ↓
Agent Orchestration Layer
  ↓
Service Interfaces
  ↓
Provider Adapters / Plugins
  ↓
External Tools / Local Tools / Platforms
```

The UI must not directly call external tools. The agent calls service interfaces. Service interfaces route to provider adapters.

## Required provider interfaces

Create interfaces for:

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

Each provider must expose id, name, status, version, capabilities, cost model, rate limits, commercial-use status, configuration schema, health check, test connection method, and safe fallback behavior.

Provider statuses:

- `not_connected`
- `configured`
- `testing`
- `live`
- `failed`
- `disabled`
- `deprecated`
- `needs_attention`

Do not fake live status.

## Capability-based design

Do not check only provider names. Check capabilities.

Bad:

```ts
if (provider.name === "runway") generateVideo();
```

Good:

```ts
if (provider.capabilities.includes("text_to_video")) generateVideo();
```

Capabilities may include text generation, structured output, vision, image understanding, text-to-image, image-to-image, text-to-video, image-to-video, voice generation, transcription, captions, rendering, upload video, schedule post, analytics read, comment read, browser control, and local execution.

## Workflow, render, and platform flexibility

n8n is the default workflow engine, but use a `WorkflowProvider` interface.

FFmpeg is the default renderer, but use a `RenderProvider` interface.

Each social platform adapter must define platform id, supported formats, API support level, auth method, upload support, scheduling support, analytics support, comment support, manual fallback, rate limits, and approval requirements.

## Content format flexibility

Support data-driven formats such as short vertical video, long horizontal video, reel, story, carousel, text thread, newsletter, livestream outline, podcast clip, community post, image post, interactive post, and future unknown formats.

Each format defines aspect ratio, duration, file type, metadata requirements, platform support, captions, thumbnail requirements, and approval requirements.

## Database and prompt versioning

Use relational schema for core entities and JSON fields for flexible provider/platform metadata.

Use version fields for content schema, workflow version, provider config version, settings version, and prompt version.

Prompts must be versioned in a prompt registry for strategy, research, scripts, storyboard, prompt generation, review, safety, metadata, and analytics.

## Event system

Add internal event logs for content created, reviewed, approved, rejected, render started/completed/failed, platform connected, post package created, draft uploaded, publishing blocked, tool limit reached, approval requested/completed, agent command received, and agent error.

## Feature flags

Use feature flags for risky or future features:

- `enableBrowserAutomation`
- `enablePaidTools`
- `enablePublicPublishing`
- `enableLocalLLM`
- `enableComfyUI`
- `enableAutoScheduling`
- `enableCommentReplies`
- `enableExperimentalProviders`

Default risky flags to false.

## Documentation requirements

Document how to add new AI providers, social platforms, workflow providers, render providers, content formats, prompt versions, and analytics sources.

Create or update:

- `docs/ARCHITECTURE.md`
- `docs/PROVIDER_GUIDE.md`
- `docs/PLUGIN_GUIDE.md`
- `docs/UPGRADE_GUIDE.md`

## Final rule

Build Folqen so future AI tools can be added as providers instead of rebuilding the app.
