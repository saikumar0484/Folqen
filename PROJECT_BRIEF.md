# Folqen — Project Brief

## Product goal

Build **Folqen**, a secure, premium, future-proof web app that lets the creator control and talk to an AI content creator agent.

The agent manages an Urban Legends / Mystery / Folklore content brand across social platforms.

The creator wants 99% automation, but not reckless automation. The human should only approve important decisions, permissions, credentials, public publishing, paid tools, risky topics, and monetization/payment-related actions.

---

## User context

- User is based in India.
- User has self-hosted n8n.
- User wants to use Codex to build the system.
- User wants minimal cost, ideally ₹500–₹1000 monthly operating cost.
- User wants a stunning, simple, secure web app.
- User wants to talk to the agent using text, voice, images, and files.
- User wants the agent to work like a professional content creator.

---

## Niche

Urban legends around the world, including folklore, haunted places, cursed objects, mystery stories, creepy historical legends, mythical creatures, local legends by country, short scary stories, and documentary-style mystery content.

Avoid copyrighted modern horror stories without permission, fake claims presented as fact, exploiting real tragedies, graphic content, celebrity voice/likeness misuse, and low-effort reused content.

---

## Target platforms

Primary:

- YouTube
- Instagram
- Facebook
- Snapchat
- Threads

Secondary:

- Substack
- LinkedIn
- Bluesky
- Lemon8
- Kick

Do not rely on TikTok for India.

---

## Core user experience

The user opens Folqen and sees:

1. Dashboard showing agent work.
2. Global mini chat available everywhere.
3. Agent chat page for full conversations.
4. Settings page to control autonomy and permissions.
5. Approval page for important decisions.
6. Pipeline page to see active jobs.
7. Library page for generated content.
8. Tools page to track free/local tool limits.
9. Platforms page to manage social platforms.
10. Analytics page to track performance.
11. Upgrade Center for self-improvement proposals.
12. Audit page to see what the agent did.

---

## MVP must include

- Authentication
- Protected dashboard
- Premium app shell
- Global mini agent chat
- Full agent chat page
- Settings page
- Approvals page
- Content pipeline page
- Content library page
- Tool limits page
- Platform manager page
- File manager
- Analytics page with mock data
- Upgrade Center
- Audit logs
- Security guards
- Mock agent service
- Provider registry
- n8n webhook placeholder
- ComfyUI placeholder
- FFmpeg/render placeholder
- YouTube/private upload placeholder
- Posting package system
- Clear “Not connected” states

---

## Design

Folqen must be stunning, smooth, minimal, fast, professional, user-friendly, dark-mode first, and mobile responsive.

Visual style:

- creator command center
- premium SaaS dashboard
- smooth gradients
- clean glass-like cards
- soft shadows
- strong spacing
- crisp typography
- subtle animations
- clear status indicators

---

## Main pages

### `/dashboard`

Show current agent activity, active jobs, drafts ready, pending approvals, errors, scheduled posts, platform status, tool limits, monetization progress, recent analytics, improvement opportunities, and agent recommendations.

### `/agent`

Full agent chat with text, voice placeholder, images, files, quick commands, current tasks, and agent memory placeholder.

### `/settings`

Control brand name, country India, timezone, autonomy, publishing permissions, paid tool permissions, platform defaults, n8n webhook, local tools, security settings, notifications, and self-improvement settings.

### `/approvals`

Human decisions for public publishing, paid tool use, sensitive topics, copyright uncertainty, account connection, brand changes, risky comments, destructive actions, and system upgrades.

### `/pipeline`

Show active jobs with steps from strategy to analytics.

### `/library`

Store scripts, storyboards, images, videos, shorts, reels, thumbnails, captions, metadata, and posting packages.

### `/tools`

Track ComfyUI, FFmpeg, local GPU/CPU placeholder, disabled cloud tools, TTS tools, and storage.

### `/platforms`

Manage YouTube, Instagram, Facebook, Snapchat, Threads, Substack, LinkedIn, Bluesky, Lemon8, and Kick. If not connected, show setup instructions.

### `/analytics`

Show views, watch time, retention, CTR, engagement, best topics, best hooks, best platforms, and monetization progress.

### `/upgrades`

Show self-improvement research findings, upgrade proposals, cost-saving opportunities, security improvements, AI/tool updates, platform updates, and approvals.

---

## Autonomy levels

Settings must include:

1. Manual
2. Assisted
3. Draft Automation
4. High Automation
5. 99% Automation with Approval Gates

Default: **High Automation**, with public publishing disabled.

---

## Agent may do automatically

Research topics, write scripts, generate storyboards, generate prompts, generate assets if configured, generate voiceovers if configured, render drafts if configured, create thumbnails, create metadata, review content, fix small errors, prepare posting packages, upload private drafts if configured, track analytics if connected, research improvements, and draft upgrade proposals.

---

## Agent must ask before

Public publishing, paid tool usage, account connection, monetization/payment actions, sensitive topics, copyright uncertainty, brand identity changes, destructive actions, browser automation, comment deletion, real credentials, code upgrades, security changes, database migrations, and production prompt changes.

---

## Future-proof requirement

Folqen must be built as a modular platform that can accept future AI/software updates.

Support multiple LLM providers, image providers, video providers, voice providers, workflow providers, render providers, social platform adapters, future content formats, provider capability detection, feature flags, plugin registry, versioned prompts/settings, event logs, upgrade docs, and migration-safe design.

Do not hardcode one model, one platform, or one tool.

---

## Self-improvement requirement

Folqen must include a Self-Improvement Research Agent that constantly looks for ways to improve the system by researching new AI models, content strategies, video/image tools, platform rules, monetization updates, SEO methods, workflow automations, security practices, cost-saving opportunities, better prompts, better provider adapters, and better UI/UX patterns.

The agent may create upgrade proposals automatically.

It must not execute upgrades without human approval.

All upgrades must include cost, benefit, risk, rollback plan, testing plan, affected areas, required permissions, and approval status.

---

## Success definition

The first complete MVP succeeds when the user can log in, see a beautiful dashboard, talk to the mock agent from every page, manage settings, see approvals, see content pipeline, see library, see tool/platform statuses, upload files safely, see analytics mock data, view upgrade proposals, and verify that publishing and paid tools are blocked by default.
