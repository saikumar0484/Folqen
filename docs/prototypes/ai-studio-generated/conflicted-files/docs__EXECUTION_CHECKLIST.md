<<<<<<< ours
# Execution Checklist

## Phase 0 / Phase 1 Foundation

- [x] Read root project instruction docs.
- [x] Sync foundation branch with latest main instructions.
- [x] Identify package manager.
- [x] Install dependencies.
- [x] Generate lockfile.
- [x] Run lint.
- [x] Run typecheck.
- [x] Run tests.
- [x] Run production build.
- [x] Validate Prisma schema.
- [x] Add safe `.env.example`.
- [x] Add Docker Compose PostgreSQL setup.
- [x] Add Prisma schema foundation.
- [x] Add environment validation.
- [x] Add safety guards.
- [x] Add guard tests.
- [x] Add README setup instructions.
- [x] Add architecture/security/provider/plugin/upgrade docs.
- [x] Add failure recovery playbook.

## Phase 2 App Shell

- [x] Add app shell.
- [x] Add sidebar navigation.
- [x] Add topbar.
- [x] Add command palette shell.
- [x] Add notification center shell.
- [x] Add global mini agent chat shell.
- [x] Add reusable stat/status/risk/empty/loading/confirm UI components.
- [x] Add placeholders for all required routes.
- [x] Start replacing placeholders with route-specific detailed pages.
- [x] Add dedicated dashboard screen.
- [ ] Add mobile sidebar drawer behavior.
- [ ] Add toasts.
- [x] Add richer dashboard widgets.

## Later Phases

- [x] Choose Vercel + free database + Oracle n8n worker deployment model.
- [x] Add deployment plan.
- [x] Add real-data testing plan.
- [x] Add database seed script.
- [x] Add database and integration health/status APIs.
- [x] Link Vercel project.
- [x] Deploy production app to Vercel.
- [x] Verify production `/` and `/api/health`.
- [x] Add non-secret production app URL env values.
- [ ] Configure free Postgres `DATABASE_URL`.
- [ ] Run database push against approved free database.
- [ ] Seed approved free database.
- [ ] Configure Oracle n8n webhook env values.
- [ ] Test Oracle n8n webhook from Folqen.
- [ ] Authentication and roles.
- [ ] Database migrations and seed data.
- [ ] Settings persistence.
- [ ] Approval backend routes.
- [ ] File upload validation.
- [ ] Service interfaces and provider adapters.
- [ ] n8n placeholder endpoints.
- [ ] Posting package system.
- [ ] Security hardening.
=======
# Folqen Execution Checklist

## Phase 0 — Preparation (In Progress)

- [x] Inspect repository and identify baseline state (docs-only, no application scaffold yet).
- [x] Read core instructions: `AGENTS.md`, `PROJECT_BRIEF.md`, `IMPLEMENTATION_PLAN.md`, `CHECKPOINT_RULES.md`, `FUTURE_PROOF_ARCHITECTURE.md`, `SELF_IMPROVEMENT_AGENT.md`, `HANDOFF_RULES.md`, `FAILURE_RECOVERY_PLAYBOOK.md`.
- [x] Confirm package manager and app stack status (none initialized yet).
- [x] Define route map for required pages.
- [x] Define initial database model plan.
- [x] Define security checklist and default guardrails.
- [x] Define UI component checklist.
- [x] Define provider/plugin architecture plan.
- [x] Define self-improvement research/upgrade plan.
- [x] Identify missing decisions and safe assumptions.

## Route Map (Required)

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

## Database Model Plan (Phase 4 target)

Core entities planned from implementation plan:

- `User`
- `AgentMessage`
- `AgentTask`
- `ContentItem`
- `Asset`
- `Render`
- `Approval`
- `PlatformConnection`
- `ToolLimit`
- `AnalyticsRecord`
- `Setting`
- `AuditLog`
- `UploadedFile`
- `ErrorLog`
- `Notification`
- `WorkflowRun`
- `UpgradeProposal`
- `ResearchFinding`
- `UpgradeRun`
- `ProviderRegistryItem`
- `PromptVersion`
- `EventLog`

## UI Component Checklist (Phase 2 target)

- `AppShell`
- `Sidebar`
- `Topbar`
- `ThemeProvider`
- `CommandPalette`
- `NotificationCenter`
- `StatCard`
- `StatusBadge`
- `RiskBadge`
- `PageHeader`
- `EmptyState`
- `LoadingSkeleton`
- `ConfirmDialog`
- `MiniAgentChat` (global, required on authenticated pages)

## Risks and Missing Decisions (tracked before coding)

1. **Stack bootstrap choice**: repository currently has no Next.js scaffold; we will initialize with Next.js App Router + TypeScript + Tailwind.
2. **Database local setup**: Docker Compose + PostgreSQL version selection required.
3. **Auth implementation choice**: Auth.js/NextAuth vs custom secure auth (defaulting to Auth.js unless blocked).
4. **File storage path policy**: local private storage strategy needed before upload endpoints.
5. **Mock vs live integration labels**: enforce `Not connected` and explicit status tags on all platform/tool screens.

## Safe Assumptions

- Start with local-first, free tooling.
- Keep all risky automation disabled by default.
- Build placeholders with honest connection states rather than fake integrations.
>>>>>>> theirs
