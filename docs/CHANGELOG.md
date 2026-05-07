# Changelog

## May 7, 2026 - Session save point

### Changed

- Created an explicit end-of-session checkpoint for continuing this chat/session safely.
- Confirmed the latest deployed state includes manual posting packages, role-aware approval controls, route-specific authenticated pages, upload validation foundations, and mock service interfaces.

### Verification

- `git status`: clean before save-point docs.
- `GET https://folqen.vercel.app/api/health`: returned database status `live`.
- No feature code or production configuration was changed in this save-point entry.

## May 7, 2026 - Manual posting packages and role-aware controls

### Added

- Added manual posting package generation for not-connected platforms.
- Added `POST /api/posting-packages/manual`, which creates a `posting_package` asset and audit log without uploading or publishing.
- Added a Library page action to create a manual package for the first target platform on a content item.
- Added role-aware approval UI states so viewers see disabled actions with an explicit role message.
- Added permission tests for admin/operator/viewer behavior.
- Updated README continuation notes for the current state.

### Safety

- Manual package generation does not publish content, connect platform APIs, or spend money.
- Only admins and operators can create posting packages or review approvals.
- Viewers remain read-only for approval and posting-package actions.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 21 tests.
- `npm run build`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- `GET https://folqen.vercel.app/api/health`: returned database status `live`.
- Unauthenticated `POST /api/posting-packages/manual`: returned 401 login required.

## May 7, 2026 - Service interface foundation

### Added

- Added service interface types for agent, workflow, render, publishing, analytics, storage, and notifications.
- Added mock service implementations that keep external providers, storage writes, workflow execution, public publishing, and live analytics blocked by default.
- Added tests for blocked public publishing, manual posting package mode, storage validation without writes, and blocked workflow execution.

### Safety

- No real provider, n8n, render, storage, analytics, platform, or publishing integration was enabled.
- Service methods return `mock` or `not_connected` states until real configuration and approval gates are added.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 15 tests.
- `npm run build`: passed.

## May 7, 2026 - File upload validation foundation

### Added

- Added upload candidate validation for allowed MIME types, matching extensions, safe file names, path traversal prevention, positive file size, and a 100 MB MVP limit.
- Added focused tests for supported files, path traversal, MIME/extension mismatch, oversize files, and unsupported file types.

### Safety

- No upload endpoint, file storage write, or public file access was enabled.
- This is a validation foundation only; actual uploads still require role checks, privacy defaults, storage path isolation, confirmations where needed, and audit logs.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 11 tests.
- `npm run build`: passed.

## May 7, 2026 - Route-specific calendar monetization brand and files pages

### Added

- Added server-side data loading for calendar, monetization, brand, and files pages.
- Replaced `/calendar` placeholder with Supabase-backed content schedule and approval-blocker views.
- Replaced `/monetization` placeholder with safe revenue-readiness and analytics signal views while payment access remains off.
- Replaced `/brand` placeholder with brand direction, safety boundaries, and content record views.
- Replaced `/files` placeholder with read-only uploaded-file and asset inventory views.

### Safety

- File uploads are still disabled until strict validation, storage, role checks, confirmations, and audit logs are implemented.
- Payment/monetization actions remain disabled and require human approval.
- Calendar auto-scheduling and public posting remain disabled.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed after correcting the settings helper import.
- `npm run test`: passed, 6 guard tests.
- `npm run build`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- `GET https://folqen.vercel.app/api/health`: returned database status `live`.
- Unauthenticated `GET /files` and `GET /calendar`: returned 307 login redirects.

## May 7, 2026 - Database-backed operations pages

### Added

- Added shared server-side operations data loading for notifications, analytics, errors, workflows, and upgrades.
- Replaced `/notifications` placeholder with Supabase-backed notification records and read/risk states.
- Replaced `/analytics` placeholder with Supabase-backed analytics records while keeping live platform analytics marked as not connected.
- Replaced `/errors` placeholder with Supabase-backed error records and recovery guidance.
- Replaced `/workflows` placeholder with Supabase-backed workflow/provider status while keeping n8n execution gated.
- Replaced `/upgrades` placeholder with Supabase-backed upgrade proposals, findings, scores, test plans, and rollback plans.

### Safety

- No workflows, upgrades, external analytics, platform publishing, paid tools, or browser automation were enabled.
- All operations pages are read-only until role-checked actions, confirmations, and audit logs are added.
- Upgrade execution remains blocked by default and requires human approval.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 6 guard tests.
- `npm run build`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- `GET https://folqen.vercel.app/api/health`: returned database status `live`.
- Unauthenticated `GET /notifications` and `GET /upgrades`: returned 307 login redirects.

## May 7, 2026 - Database-backed platforms and tools pages

### Added

- Added server-side platform data loading from Supabase `PlatformConnection` records.
- Added a route-specific `/platforms` screen with India-first platform tiers, connection status, manual posting fallback, and approval reminders.
- Added server-side tool data loading from Supabase `ProviderRegistryItem`, `ToolLimit`, and runtime integration status checks.
- Added a route-specific `/tools` screen with provider status, tool limits, runtime connection status, cost guard, and local-first setup notes.

### Safety

- No OAuth, platform credentials, paid tools, rendering, or workflow execution were enabled.
- Every platform/tool that is not configured remains clearly labeled `Not connected` or equivalent.
- Public publishing, paid tools, browser automation, and platform posting remain blocked.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 6 guard tests.
- `npm run build`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- `GET https://folqen.vercel.app/api/health`: returned database status `live`.
- Unauthenticated `GET /platforms` and `GET /tools`: returned 307 login redirects.

## May 7, 2026 - Database-backed pipeline and library pages

### Added

- Added server-side pipeline data loading from Supabase `AgentTask`, `WorkflowRun`, `Approval`, and `ErrorLog` records.
- Added a route-specific `/pipeline` screen with live task progress, approval/error attention queue, workflow run state, and publishing guard reminders.
- Added server-side library data loading from Supabase `ContentItem`, `Asset`, `UploadedFile`, and `Render` records.
- Added a route-specific `/library` screen with content package status, review/safety/copyright checks, asset/file/render sections, and manual posting package honesty.

### Safety

- No database schema changes or migrations were made.
- Public publishing, paid tools, browser automation, n8n, ComfyUI, FFmpeg, and platform integrations remain blocked or `Not connected`.
- Pipeline controls remain read-only until service adapters and role-checked actions are implemented.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 6 guard tests.
- `npm run build`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- `GET https://folqen.vercel.app/api/health`: returned database status `live`.
- Unauthenticated `GET /pipeline` and `GET /library`: returned 307 login redirects.

## May 6, 2026 - Sidebar overlap hotfix

### Fixed

- Fixed the authenticated app sidebar so the `Approval gates active` safety card no longer overlaps the lower navigation items on desktop-height screens.
- Converted the sidebar into a vertical flex layout with a scrollable route list and a fixed-in-flow safety card.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 6 guard tests.
- `npm run build`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- `GET https://folqen.vercel.app/api/health`: returned database status `live`.

## May 6, 2026 - End-of-session handoff checkpoint

### Changed

- Refreshed README continuation notes for another Codex account.
- Clarified the current live state: Supabase, login, dashboard, settings, approvals, audit, and persistent mock agent chat are working.
- Updated stale risk/handoff wording so tomorrow's continuation starts from the correct source of truth.

### Verification

- Repository status checked before handoff.
- Production health endpoint still reports database `live`.
- No code or production configuration changes were made in this checkpoint.

## May 6, 2026 - Test viewer and live dashboard data

### Added

- Created a low-privilege `VIEWER` test account in Supabase for dashboard testing.
- Added server-side dashboard data loading from Supabase.
- Updated `/dashboard` to show real counts, active jobs, pending approvals, platform statuses, tool limits, and recent audit activity.

### Safety

- Test account is viewer-only and cannot change settings or approve/reject items.
- Test password is not committed to the repository docs.
- Dashboard still shows platform/tool integrations as `Not connected` unless truly configured.

### Verification

- Test viewer production login returned 200.
- Test viewer production `/dashboard` returned 200.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 6 guard tests.
- `npm run build`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- Live dashboard contained `Live database` and `Now powered by Supabase records`.
- `GET /api/health`: returned database status `live`.

## May 6, 2026 - Real backend controls phase

### Added

- Admin password-change API and settings-page form.
- Database-backed settings page and safe settings update API.
- Approval center backed by Supabase records with approve/reject API and audit logging.
- Audit trail page backed by Supabase `AuditLog` records.
- Persistent agent chat page and message API using Supabase `AgentMessage` records.
- Shared audit helper and role permission helpers.

### Safety

- Settings updates keep public publishing, paid tools, and browser automation locked off.
- Approval decisions do not publish content or execute paid tools.
- Agent replies remain clearly marked as mock until a real AI provider is configured.
- Password changes and approval decisions create audit entries.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed after tightening Prisma JSON metadata typing.
- `npm run test`: passed, 6 guard tests.
- `npm run build`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- Production login returned 200.
- Production `/settings`, `/approvals`, `/audit`, and `/agent` returned 200 with expected page text.
- Production settings save returned 200 using safe values.
- Production agent message save returned 200 and returned persisted messages.

## May 6, 2026 - Landing gradient text hotfix

### Fixed

- Fixed neon gradient text rendering as a solid green rectangle on the live landing page in Chrome.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 6 guard tests.
- `npm run build`: passed.
- `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- Headless Chrome screenshot of the live homepage confirmed the headline renders as text, not a block.
- `GET /api/health`: returned database status `live`.

## May 6, 2026 - Supabase production database live

### Added

- Applied the Prisma schema to Supabase project `eobvgajgyvydqydlfken` through `supabase db query --linked`.
- Enabled row level security on all 22 public Folqen tables.
- Seeded the Supabase database with the admin user, safety settings, platform statuses, content, approval, analytics, notification, and upgrade proposal data.
- Added Vercel production `DATABASE_URL` as a sensitive env var without committing or printing the value.

### Changed

- Updated `npm run build` to run `prisma generate && next build` so Vercel deployments generate a fresh Prisma Client.
- Redeployed production at `https://folqen.vercel.app`.

### Verification

- `npm install`: passed in the fresh worktree after setting the temporary Node runtime on PATH.
- `supabase projects list`: passed; linked project is `Folqen`.
- Supabase table count check: passed; 22 public tables created.
- RLS verification: passed; all 22 public tables report RLS enabled.
- `npm run db:generate`: passed.
- `npm run db:seed`: passed against the Supabase session pooler.
- Seed verification: passed; admin user, 10 platforms, safety settings, approval, and upgrade proposal exist.
- `vercel env add DATABASE_URL production --sensitive`: passed.
- First Vercel redeploy exposed a Prisma stale-client issue.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 6 guard tests.
- `npm run build`: passed and generated Prisma Client before Next build.
- Second `vercel deploy --prod --yes`: passed and aliased `https://folqen.vercel.app`.
- `GET /api/health`: returned database status `live`.
- `POST /api/auth/login`: returned 200 for the seeded admin account.
- Authenticated `GET /dashboard`: returned 200 and contained the dashboard/logout UI.

## May 6, 2026 - Safe Supabase checkpoint

### Added

- Documented the fresh Supabase project connection as a safe continuation checkpoint.
- Recorded the linked Supabase project reference `eobvgajgyvydqydlfken` and Seoul region.
- Added next-step guidance to apply schema through `supabase db query --linked` instead of the failing direct database host path.

### Verification

- `supabase projects list`: passed and showed linked project `Folqen`.
- `supabase db query "select current_database() as database_name, current_user as user_name;" --linked -o json`: passed.
- Prisma schema SQL generation to a temporary local file: passed.

### Not Changed

- No Supabase schema was applied.
- No seed data was inserted.
- No Vercel `DATABASE_URL` was added.
- No production redeploy was started from this partial Supabase step.

## May 6, 2026 - Authentication foundation

### Added

- Custom login page at `/login`.
- Auth APIs for login, logout, and current user.
- Signed HTTP-only session cookie helpers.
- Current-user lookup helper backed by Prisma.
- Protected app route proxy in `src/proxy.ts`.
- Authenticated app layout guard for dashboard routes.
- Topbar user display and logout button.
- `bcryptjs` password hashing.
- Seed script now hashes `admin@example.com` / `ChangeMe123!`.
- Preserved generated prototype files under `docs/prototypes/ai-studio-generated/`.

### Changed

- Excluded `docs/prototypes/**` from active TypeScript compilation.
- Added production Vercel `AUTH_SECRET` without printing or committing the value.

### Verification

- `npm install bcryptjs`: passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 6 tests.
- `prisma validate`: passed with local development `DATABASE_URL`.
- `npm run build`: passed.
- `vercel deploy --prod --yes`: passed.
- `GET https://folqen.vercel.app`: returned 200.
- `GET https://folqen.vercel.app/login`: returned 200.
- `GET https://folqen.vercel.app/dashboard` without session: returned 307 redirect to login.

## May 6, 2026 - Deployment and real-data foundation

### Added

- Deployment plan for Vercel + free PostgreSQL + Oracle Free Tier n8n worker.
- Vercel production deployment at `https://folqen.vercel.app`.
- `.vercelignore` to keep env files out of CLI deployment uploads.
- Real-data testing plan with safe testing order and recovery notes.
- Database scripts for Prisma generate, push, seed, and studio.
- Prisma seed script with realistic mock records for safety settings, content, approvals, platform statuses, provider registry items, analytics, notifications, and upgrade proposal data.
- Lazy Prisma client and database status helper.
- Integration status API at `GET /api/integrations/status`.
- n8n webhook test API at `POST /api/integrations/n8n/test`.
- Expanded health API with dynamic integration status.
- Additional env placeholders for app base URL, Oracle n8n, and local worker secrets.

### Changed

- Upgraded Next.js to `16.2.4`, React to `19.2.5`, React DOM to `19.2.5`, and matching Next ESLint config/types.
- Updated ESLint to use Next's flat config exports.
- Added Node engine requirement `>=20.9.0`.
- Updated README with the selected deployment architecture.
- Linked Vercel project `rayalasai874-4182s-projects/folqen`.
- Added non-secret production env values for `APP_BASE_URL` and `NEXTAUTH_URL`.

### Verification

- `npm install next@latest react@latest react-dom@latest eslint-config-next@latest @types/react@latest @types/react-dom@latest`: passed.
- `npx prisma generate`: passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 6 tests.
- `prisma validate`: passed with local development `DATABASE_URL`.
- `npm run build`: passed on Next.js `16.2.4`.
- `npm audit --omit=dev`: still reports 2 moderate Next/PostCSS advisories; no unsafe forced downgrade applied.
- `vercel link --yes --project folqen --scope rayalasai874-4182s-projects`: passed.
- `vercel deploy --prod --yes`: passed.
- `GET https://folqen.vercel.app`: returned 200.
- `GET https://folqen.vercel.app/api/health`: returned `status: ok`, Vercel configured, database/n8n not connected.

## May 5, 2026 - Phase 1 verification and Phase 2 shell start

### Added

- npm lockfile and verified dependency install.
- Prisma schema foundation with required MVP models and enums.
- Environment validation in `src/lib/env.ts`.
- Safety guards and focused tests in `src/lib/security`.
- Provider registry type foundation in `src/lib/providers.ts`.
- App route registry in `src/lib/app-routes.ts`.
- App shell with sidebar, topbar, command palette, notifications, mini agent chat, reusable cards, badges, empty/loading states, and confirmation dialog.
- Placeholder pages for all required MVP routes.
- Expanded README setup instructions.
- Architecture, security, route map, provider, plugin, upgrade, and failure recovery docs.
- Security headers in `next.config.ts`.
- Expanded health route response with safety and integration status.

### Changed

- Merged the newer `main` AGENTS.md update into `build/phase-0-foundation`.
- Replaced deprecated `next lint` script with `eslint .`.
- Removed unused homepage icon import.
- Kept neon green dark cyber/glass UI direction.

### Verification

- `npm install`: passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 6 tests.
- `prisma validate`: passed with local development `DATABASE_URL`.
- `npm run build`: passed, 23 app routes generated.
- Dev server HTTP checks passed for `/`, `/dashboard`, and `/platforms`.

### Limitations

- In-app browser screenshot verification was unavailable due missing `agent-browser` CLI and browser-use Node runtime access denial.
- `npm audit` reports two moderate Next/PostCSS advisories; no safe automatic fix was applied.

## May 6, 2026 - Template alignment and dashboard next phase

### Added

- Re-inspected the uploaded `display-perfect-mirror-main.zip` template.
- Ported more template structure into the Folqen landing page: sticky glass header, expanded feature sections, how-it-works, product preview, empty states, use cases, build-ready section, CTA, FAQ, and footer.
- Added missing template-inspired theme tokens for card, popover, accent, secondary, destructive, chart, sidebar, input, and ring colors.
- Started the next Phase 2 UI step with a dedicated dashboard screen showing active jobs, approvals, platform status, tool limits, activity, and safe next steps.

### Changed

- Updated README with design template direction and another-account continuation notes.
- Removed remaining negative tracking utility from page header and landing hero.

### Verification

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 6 tests.
- `prisma validate`: passed with local development `DATABASE_URL`.
- `npm run build`: passed, 23 app routes generated.
