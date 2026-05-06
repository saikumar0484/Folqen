# Changelog

## May 6, 2026 - Deployment and real-data foundation

### Added

- Deployment plan for Vercel + free PostgreSQL + Oracle Free Tier n8n worker.
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

### Verification

- `npm install next@latest react@latest react-dom@latest eslint-config-next@latest @types/react@latest @types/react-dom@latest`: passed.
- `npx prisma generate`: passed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 6 tests.
- `prisma validate`: passed with local development `DATABASE_URL`.
- `npm run build`: passed on Next.js `16.2.4`.
- `npm audit --omit=dev`: still reports 2 moderate Next/PostCSS advisories; no unsafe forced downgrade applied.

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
