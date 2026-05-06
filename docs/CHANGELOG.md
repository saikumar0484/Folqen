# Changelog

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
