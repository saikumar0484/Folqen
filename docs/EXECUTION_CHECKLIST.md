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
- [x] Configure free Postgres `DATABASE_URL`.
- [x] Connect fresh Supabase project.
- [x] Verify Supabase linked query access.
- [x] Apply Prisma schema to Supabase through Management API.
- [x] Run database push against approved free database.
- [x] Seed approved free database.
- [ ] Configure Oracle n8n webhook env values.
- [ ] Test Oracle n8n webhook from Folqen.
- [x] Authentication and roles foundation.
- [x] Protected routes.
- [x] Login/logout API foundation.
- [x] Password change flow.
- [x] Database-backed login verification.
- [x] Database migrations and seed data.
- [x] Settings persistence.
- [x] Approval backend routes.
- [x] Audit log page backed by database.
- [x] Agent chat persistence.
- [x] Test viewer account for dashboard testing.
- [x] Dashboard backed by Supabase data.
- [ ] File upload validation.
- [ ] Service interfaces and provider adapters.
- [ ] n8n placeholder endpoints.
- [ ] Posting package system.
- [ ] Security hardening.
