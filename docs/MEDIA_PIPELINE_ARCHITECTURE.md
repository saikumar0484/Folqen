# Folqen Media Generation & Asset Pipeline Architecture

## Purpose

Folqen's Media Generation & Asset Pipeline System is the mock-safe creative production department for thumbnails, visual plans, subtitle plans, render jobs, asset versions, and platform-specific media variants.

It is not a simple image generator wrapper. It is designed as a future ComfyUI/FFmpeg/local-worker orchestration layer with queueing, retry policy, registry metadata, observability, and approval checkpoints.

## Core Systems

- `Asset Generation Service`: creates deterministic dry-run asset plans for thumbnails, shorts visuals, clips, subtitles, covers, variants, templates, and render outputs.
- `Thumbnail Pipeline`: creates ComfyUI-ready thumbnail plans with prompt, layout, validation, and version metadata.
- `Video Pipeline`: creates script-to-scene, shorts visual, and render-output plans without live video generation.
- `Rendering Queue System`: uses the existing BullMQ adapter through `ORCHESTRATION_QUEUES.media`.
- `Subtitle Generation System`: creates subtitle timing/overlay plans, not live transcriptions.
- `Media Asset Registry`: persists metadata through existing `Asset` rows when the database is available.
- `Asset Versioning System`: tracks version and lineage in asset metadata, using `sourceAssetId` for future lineage expansion.
- `Rendering Retry System`: records safe retry plans and recovery logs without executing FFmpeg.
- `Creative Workflow Registry`: defines reusable workflow templates under `src/lib/media/registry.ts`.
- `Asset Storage Layer`: emits `mock-media://` storage paths and can later route through Google Drive/local storage adapters.

## Workflows

The current workflow registry includes:

- Thumbnail Workflow
- Shorts Visual Workflow
- Script-to-Scene Workflow
- Asset Adaptation Workflow
- Rendering Workflow
- Subtitle Workflow
- Asset Optimization Workflow

Each workflow declares supported media types, provider preferences, retryability, and the approval reason required before public or live use.

## Provider Architecture

Providers are status-aware only:

- `mock`: active dry-run planner.
- `comfyui`: ComfyUI-ready workflow abstraction, no live API call.
- `ffmpeg`: FFmpeg render abstraction, no process spawn.
- `local_worker`: future heavy media worker bridge, no live job execution.

Even when `COMFYUI_BASE_URL`, `FFMPEG_PATH`, or local worker env values are configured, live execution remains blocked in this slice.

## Runtime Flow

1. User/operator submits a media workflow request from `/content-studio` or `/api/media/*`.
2. API validates auth, admin/operator permission, same-origin mutation guard, rate limits, and Zod schema.
3. LangGraph dry-run flow validates inputs, selects provider, builds asset plans, builds render plan, and attaches approval checkpoints.
4. Existing BullMQ adapter queues a mock media job through `folqen.media`.
5. Events are emitted through the orchestration event bus.
6. Existing `Asset` and `Render` tables store metadata when the database is available.
7. UI shows asset plans, versions, render logs, queue ids, and retry plans.

## Controlled Media Execution Layer

The controlled rendering expansion adds a governed operational layer on top of the dry-run media planner. It is designed to prepare approval-gated execution packets for future ComfyUI/FFmpeg/local-worker rendering without enabling unrestricted GPU execution.

New controlled workflows:

- Live Thumbnail Rendering
- Structured Image Generation
- Subtitle Rendering
- Asset Validation
- Render Quality Scoring
- Asset Reflection
- Creative Asset Registry Integration
- Render Recovery

Controlled rendering requires:

- `ALLOW_CONTROLLED_MEDIA_EXECUTION=true`
- `LIVE_MEDIA_ACTIVATION_STAGE >= 1`
- a verified approved `governance.media_render` approval ID
- provider configuration and health validation
- render quota validation
- GPU-minute budget validation
- concurrency and timeout validation
- queue depth validation
- governance policy validation
- kill switches and emergency stop not engaged

Even when these checks are modeled, this slice still produces sandbox execution packets only. It does not call ComfyUI, spawn FFmpeg, run a GPU job, write binary assets, generate unrestricted video, publish, retry autonomously, or mutate workflows.

## First Governed Live Thumbnail Rendering

The first live creative production capability is a single-purpose thumbnail renderer. It uses only the controlled `local_worker` provider and only the Content Department `live_thumbnail_rendering` workflow.

Mandatory gates:

- `ALLOW_CONTROLLED_MEDIA_EXECUTION=true`
- `ALLOW_LIVE_THUMBNAIL_RENDERING=true`
- `LIVE_MEDIA_ACTIVATION_STAGE >= 1`
- `LIVE_THUMBNAIL_RENDER_STAGE >= 1`
- `THUMBNAIL_RENDER_PROVIDER=local_worker`
- `LOCAL_WORKER_BASE_URL` and `LOCAL_WORKER_SHARED_SECRET` configured outside git
- verified approved `media_render` or `thumbnail_render` approval ID
- render kill switches and emergency stop off
- provider not quarantined
- budget, GPU-minute, timeout, concurrency, and queue-depth checks pass
- asset validation and render scoring accept the request

Live endpoint:

- `GET /api/media/live-thumbnail-render`
- `POST /api/media/live-thumbnail-render`
- `POST /api/media/live-thumbnail-render/control`

The worker contract is intentionally narrow: Folqen posts a thumbnail-only render request to `/api/folqen/render/thumbnail` on the configured local worker with the shared secret header. The worker must return a validated JSON object with an asset URL, MIME type, dimensions, optional checksum, optional trace ID, and timing metadata.

Live thumbnail rendering does not enable ComfyUI directly, FFmpeg directly, unrestricted GPU execution, video generation, autonomous retries, public publishing, platform APIs, workflow mutation, or prompt mutation.

Rollback controls:

- disable live thumbnail rendering at runtime
- rollback to dry-run
- queue drain marker
- quarantine the worker provider
- isolate failed asset metadata
- plan failed render recovery without autonomous retry

## Persistence

No database migration is required in this slice.

The system uses existing models:

- `Asset`: metadata-only media asset records.
- `Render`: render plan, logs, dry-run status, and provider metadata.
- `EventLog`: media pipeline events.
- `AuditLog`: media pipeline and retry audit records.
- `ErrorLog`: failed live thumbnail render isolation records.

## API Surface

- `GET /api/media/overview`
- `GET /api/media/assets`
- `POST /api/media/generate`
- `POST /api/media/render`
- `POST /api/media/retry`
- `GET /api/media/controlled-render`
- `POST /api/media/controlled-render`
- `POST /api/media/controlled-render/shutdown`
- `GET /api/media/live-thumbnail-render`
- `POST /api/media/live-thumbnail-render`
- `POST /api/media/live-thumbnail-render/control`

All mutations are admin/operator only, rate-limited, same-origin checked, and marked with the Folqen mutation header.

## Frontend Integration

`/content-studio` now includes:

- media workflow registry
- provider readiness
- asset dashboard
- render queue
- generation status
- render logs
- failed render retry planning
- controlled render governance
- render budget and quota monitoring
- asset validation and scoring
- emergency render shutdown
- status honesty labels

## Safety Boundaries

- No unrestricted GPU execution.
- No live ComfyUI request in this slice.
- No FFmpeg process spawn in this slice.
- No media worker execution.
- No binary file write.
- No automatic publishing.
- No paid provider call.
- No autonomous retry.
- No workflow mutation.
- All results are `Mock`, `Not connected`, `Configured`, `Needs approval`, or `Blocked`.
