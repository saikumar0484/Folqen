# IMPLEMENTATION_PLAN.md

## Codex instruction

Complete Folqen phase by phase. Do not ask the human to manually send each phase prompt. Work from this file and `AGENTS.md`.

Before each phase, check repo state, read relevant files, decide exact tasks, implement, verify, fix errors, and commit or summarize changes.

Do not move forward if the current phase is broken.

---

## Phase 0 — Preparation

Before coding:

- Inspect repo.
- Identify package manager.
- Identify current tech stack.
- Check if app already exists.
- Create/update execution checklist.
- Create route map.
- Create database model plan.
- Create security checklist.
- Create UI component checklist.
- Create future-proof provider/plugin architecture plan.
- Create self-improvement research/upgrade plan.
- Identify missing decisions.
- Identify safe assumptions.

Output:

- `docs/EXECUTION_CHECKLIST.md`
- `docs/ARCHITECTURE.md`
- `docs/SECURITY_PLAN.md`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_STEPS.md`
- `docs/CHANGELOG.md`
- `docs/RISK_LOG.md`

---

## Phase 1 — Project foundation

Build Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Prisma, PostgreSQL Docker Compose, Zod, ESLint, Prettier, `.env.example`, README, and a health check API route.

Security defaults:

```env
ALLOW_PUBLIC_PUBLISH=false
REQUIRE_HUMAN_APPROVAL=true
ALLOW_PAID_TOOLS=false
ALLOW_BROWSER_AUTOMATION=false
DEFAULT_UPLOAD_PRIVACY=private
```

Verify install, lint, typecheck, tests if available, and build.

---

## Phase 2 — App shell and design system

Build `AppShell`, `Sidebar`, `Topbar`, `ThemeProvider`, `CommandPalette`, `NotificationCenter`, `StatCard`, `StatusBadge`, `RiskBadge`, `PageHeader`, `EmptyState`, `LoadingSkeleton`, and `ConfirmDialog`.

Create polished placeholders for all required routes:

- `/dashboard`
- `/agent`
- `/calendar`
- `/pipeline`
- `/library`
- `/approvals`
- `/platforms`
- `/tools`
- `/settings`
- `/analytics`
- `/monetization`
- `/brand`
- `/errors`
- `/audit`
- `/workflows`
- `/files`
- `/notifications`
- `/upgrades`

---

## Phase 3 — Authentication and security base

Build login, logout, protected routes, session handling, roles, password hashing, middleware route protection, security headers, audit log helper, and seed admin user.

Roles: admin, operator, viewer.

Default seed user: `admin@example.com` / `ChangeMe123!`.

README must warn to change this password.

---

## Phase 4 — Database schema and seed data

Create Prisma models:

- User
- AgentMessage
- AgentTask
- ContentItem
- Asset
- Render
- Approval
- PlatformConnection
- ToolLimit
- AnalyticsRecord
- Setting
- AuditLog
- UploadedFile
- ErrorLog
- Notification
- WorkflowRun
- UpgradeProposal
- ResearchFinding
- UpgradeRun
- ProviderRegistryItem
- PromptVersion
- EventLog

Add enums for user roles, content status, task status, approval status, risk level, platform name, tool type, connection status, review status, provider status, and upgrade status.

Seed realistic mock data.

---

## Phase 5 — Dashboard

Build `/dashboard` with active jobs, drafts ready, pending approvals, failed tasks, scheduled posts, platform status, tool limits, storage usage, local render queue, monetization progress, recent analytics, improvement opportunities, recommendations, charts, and activity timeline.

---

## Phase 6 — Global MiniAgentChat

Create `MiniAgentChat` on every authenticated page with text input, voice placeholder, file/image upload, drag/drop state, current page context, quick commands, streaming mock response, agent status, open full chat, Ctrl/Cmd+Enter send, and Esc close.

---

## Phase 7 — Full agent page

Build `/agent` with full chat, history, text input, voice placeholder, multi-file upload, image/file previews, current task panel, memory placeholder, context chips, quick actions, and AgentService interface/mock.

Create API routes:

- `POST /api/agent/message`
- `GET /api/agent/status`
- `POST /api/agent/command`

---

## Phase 8 — Settings

Build `/settings` with General, Agent Autonomy, Publishing Rules, Content Settings, Platform Settings, Security Settings, n8n Settings, Local Tools, Notifications, and Self-Improvement settings.

Use Zod validation, save to database, mask secrets, confirm dangerous changes, and audit critical changes.

---

## Phase 9 — Approvals

Build `/approvals` for public publishing, paid tool usage, sensitive topic, copyright uncertainty, account connection, brand changes, risky comment/reply, platform policy warning, and system upgrades.

Create backend routes and role checks. All decisions create audit logs.

---

## Phase 10 — Safety guards

Implement:

```ts
canPublishPublicly(contentItem, settings, approval)
canUsePaidTool(tool, settings, approval)
canExecuteUpgrade(upgradeProposal, settings, approval)
```

Add tests for blocked defaults and allowed cases only after approvals.

---

## Phase 11 — Calendar

Build `/calendar` with calendar/list/kanban views, filters, topic creation, approvals, and rescheduling.

---

## Phase 12 — Pipeline

Build `/pipeline` with active jobs, step progress, logs, retry/cancel/pause, errors, and generated file links.

---

## Phase 13 — Library

Build `/library` for videos, shorts, reels, scripts, storyboards, images, voiceovers, thumbnails, captions, metadata, posting packages, preview, download, and archive/delete confirmation.

---

## Phase 14 — Tools

Build `/tools` to track ComfyUI, FFmpeg, local hardware placeholders, disabled cloud tools, TTS tools, storage, commercial use, watermark, credits, cost, fallback priority, and setup status.

---

## Phase 15 — Platforms

Build `/platforms` for YouTube, Instagram, Facebook, Snapchat, Threads, Substack, LinkedIn, Bluesky, Lemon8, and Kick. Show connected/not connected, API/manual mode, last post, failed posts, setup instructions, and approval requirements.

Do not fake posting.

---

## Phase 16 — File manager

Build `/files` with uploads, drag/drop, MIME validation, size validation, preview, search, tags, delete/archive confirmation, and audit logs.

Supported: images, videos, audio, pdf, docx, txt, md, csv, xlsx, json, yaml, srt, vtt.

---

## Phase 17 — Analytics

Build `/analytics` with views, watch time, retention, CTR, engagement, subscribers/followers, best/worst topics, hooks, platforms, and monetization progress.

---

## Phase 18 — Monetization, brand, errors, audit, workflows, notifications

Build polished useful pages for `/monetization`, `/brand`, `/errors`, `/audit`, `/workflows`, and `/notifications`.

---

## Phase 19 — Integration service layer

Create interfaces and mock implementations:

- AgentService
- N8nService
- ComfyUIService
- RenderService
- PublishingService
- AnalyticsService
- ToolLimitService
- ApprovalService
- FileStorageService

Return `Not connected` when not configured.

---

## Phase 20 — n8n integration placeholder

Build webhook settings, test connection endpoint, trigger workflow endpoint, workflow status placeholder, and webhook secret header support.

---

## Phase 21 — Posting package system

For platforms without API configuration, generate posting packages with file path, caption, hashtags, thumbnail, description, platform instructions, recommended posting time, and approval status.

---

## Phase 22 — Final UI polish

Improve animations, responsive layout, states, toasts, modals, keyboard shortcuts, command palette, mini chat feel, and charts.

---

## Phase 23 — Security hardening

Check auth, route protection, API validation, uploads, rate limiting, CSRF where relevant, CSP, secrets, audit logs, approval logs, guards, admin-only settings, errors, and no frontend secrets.

Create `SECURITY.md`.

---

## Phase 24 — Production setup

Create deployment guide, Docker production config, backup instructions, env checklist, first-run checklist, and troubleshooting guide.

---

## Phase 25 — Future-proof platform architecture

Add provider registry, capability-based selection, service interfaces, mock adapters, feature flags, versioned settings, prompt registry, event log structure, plugin guide, provider guide, and upgrade guide.

Required interfaces: LLMProvider, ImageGenerationProvider, VideoGenerationProvider, VoiceGenerationProvider, TranscriptionProvider, CaptionProvider, RenderProvider, WorkflowProvider, PublishingProvider, AnalyticsProvider, StorageProvider, NotificationProvider, VectorMemoryProvider, BrowserAutomationProvider.

---

## Phase 26 — Self-improvement research and upgrade agent

Build the Self-Improvement Research Agent system.

Add `/upgrades`, dashboard improvement widget, upgrade proposals, research findings, approval type for upgrades, risk/cost/benefit scoring, rollback/testing plans, audit logs, settings, blocked/allowed research sources, and chat commands for upgrade research.

Create/update models: `UpgradeProposal`, `ResearchFinding`, `UpgradeRun`.

Rules:

- Research allowed automatically.
- Draft proposals allowed automatically.
- Execution blocked by default.
- All real upgrades require approval.
- Paid upgrades require paid-tool approval.
- Code upgrades require branch/checkpoint workflow.

---

## Verification after every phase

Run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

If one is missing, add it.

Fix all errors.

Then summarize what changed, what was verified, known limitations, whether it is safe to stop, and the next phase.
