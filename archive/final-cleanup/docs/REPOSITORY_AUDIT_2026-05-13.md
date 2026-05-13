# Folqen Repository Audit - May 13, 2026

## Scope

Principal-level repository reduction audit for branch `build/phase-0-foundation`.

Inspected:

- All tracked files from `git ls-files`.
- Root project docs and checkpoint docs.
- `docs/*.md` architecture, deployment, governance, risk, route, provider, and handoff files.
- Next.js app routes and API routes under `src/app`.
- Shared components under `src/components`.
- Runtime/service modules under `src/lib`.
- Worker, proxy, Prisma schema/seed, Supabase migration, deployment templates, Docker/Vercel configs, ESLint/TS/Tailwind/PostCSS configs, package manifest, and lockfile.
- Mock/dry-run systems, governance systems, runtime activation gates, browser operations, media, memory, platform operations, orchestration, AI gateway, and live execution code paths.

## Method

- Built tracked-file inventory: `470` tracked files.
- Built code inventory: `303` active `src`/`prisma` TypeScript files.
- Built docs inventory: `46` markdown files.
- Built generated-prototype inventory: `109` tracked files under `docs/prototypes/ai-studio-generated`.
- Built TypeScript import graph from static `import`, `export from`, and dynamic `import()` statements.
- Treated Next app `page.tsx`, `layout.tsx`, `route.ts`, `src/proxy.ts`, tests, worker entrypoints, and Prisma seed as framework/script entrypoints.
- Searched cross-references with `rg` for prototype paths, duplicate UI components, unused dependencies, env keys, and active imports.
- Compared package dependencies against source imports and package scripts.
- Checked config excludes and ignored local artifacts.

## Dependency And Reference Summary

- Active Next app routes: keep. All route files are framework entrypoints.
- Active API routes: keep. All API route files compile as Next route entrypoints.
- Active runtime systems: keep. Orchestration, governance, live execution, media, memory, platform operations, AI gateway, browser operations, preview deployment, deployment governance, auth, security, audit, and observability are imported by API routes, components, tests, or worker entrypoints.
- Active tests: keep. Tests cover safety gates and mock/dry-run behavior; none were classified dead.
- Env variables: no unused env keys found. Every env schema key is referenced in code, docs, env templates, deployment templates, or runtime diagnostics.
- Dead routes: none found.
- Stale deployment artifacts: no tracked `.next`, `.vercel`, `node_modules`, `.env`, or logs found. Local ignored build/dependency folders exist but are not repository bloat.

## Safe To Delete

### `docs/prototypes/ai-studio-generated/**`

Classification: `SAFE TO DELETE`

Risk level: `LOW`

Why unused:

- The entire tree is generated prototype/scaffold material, not active Folqen code.
- `tsconfig.json` explicitly excludes `docs/prototypes/**`.
- `eslint.config.mjs` explicitly ignores `docs/prototypes/**`.
- No active source file imports from this tree.
- Active app uses `src/app`, `src/components`, and `src/lib`, not root/prototype `app`, `components`, or `lib`.
- References outside the prototype tree are historical checkpoint/risk/changelog notes saying the files were preserved and excluded, not runtime dependencies.

Dependency/reference proof:

- `rg` found references only in `tsconfig.json`, `eslint.config.mjs`, and historical docs/checkpoint notes.
- No active `src/**`, `prisma/**`, config, route, worker, or API imports resolve into this tree.
- The files duplicate active app shell routes/components and old conflicted docs.

Exact files:

- `docs/prototypes/ai-studio-generated/.prettierrc.json`
- `docs/prototypes/ai-studio-generated/README.md`
- `docs/prototypes/ai-studio-generated/app/agent/page.tsx`
- `docs/prototypes/ai-studio-generated/app/analytics/page.tsx`
- `docs/prototypes/ai-studio-generated/app/api/health/route.ts`
- `docs/prototypes/ai-studio-generated/app/approvals/page.tsx`
- `docs/prototypes/ai-studio-generated/app/audit/page.tsx`
- `docs/prototypes/ai-studio-generated/app/brand/page.tsx`
- `docs/prototypes/ai-studio-generated/app/calendar/page.tsx`
- `docs/prototypes/ai-studio-generated/app/dashboard/page.tsx`
- `docs/prototypes/ai-studio-generated/app/errors/page.tsx`
- `docs/prototypes/ai-studio-generated/app/favicon.ico`
- `docs/prototypes/ai-studio-generated/app/files/page.tsx`
- `docs/prototypes/ai-studio-generated/app/globals.css`
- `docs/prototypes/ai-studio-generated/app/layout.tsx`
- `docs/prototypes/ai-studio-generated/app/library/page.tsx`
- `docs/prototypes/ai-studio-generated/app/monetization/page.tsx`
- `docs/prototypes/ai-studio-generated/app/notifications/page.tsx`
- `docs/prototypes/ai-studio-generated/app/page.tsx`
- `docs/prototypes/ai-studio-generated/app/pipeline/page.tsx`
- `docs/prototypes/ai-studio-generated/app/platforms/page.tsx`
- `docs/prototypes/ai-studio-generated/app/settings/page.tsx`
- `docs/prototypes/ai-studio-generated/app/tools/page.tsx`
- `docs/prototypes/ai-studio-generated/app/upgrades/page.tsx`
- `docs/prototypes/ai-studio-generated/app/workflows/page.tsx`
- `docs/prototypes/ai-studio-generated/components.json`
- `docs/prototypes/ai-studio-generated/components/design/confirm-dialog.tsx`
- `docs/prototypes/ai-studio-generated/components/design/empty-state.tsx`
- `docs/prototypes/ai-studio-generated/components/design/loading-skeleton.tsx`
- `docs/prototypes/ai-studio-generated/components/design/page-header.tsx`
- `docs/prototypes/ai-studio-generated/components/design/risk-badge.tsx`
- `docs/prototypes/ai-studio-generated/components/design/stat-card.tsx`
- `docs/prototypes/ai-studio-generated/components/design/status-badge.tsx`
- `docs/prototypes/ai-studio-generated/components/layout/app-shell.tsx`
- `docs/prototypes/ai-studio-generated/components/providers/theme-provider.tsx`
- `docs/prototypes/ai-studio-generated/components/shell/command-palette.tsx`
- `docs/prototypes/ai-studio-generated/components/shell/notification-center.tsx`
- `docs/prototypes/ai-studio-generated/components/shell/sidebar.tsx`
- `docs/prototypes/ai-studio-generated/components/shell/topbar.tsx`
- `docs/prototypes/ai-studio-generated/components/ui/button.tsx`
- `docs/prototypes/ai-studio-generated/components/ui/page-placeholder.tsx`
- `docs/prototypes/ai-studio-generated/conflicted-files/.env.example`
- `docs/prototypes/ai-studio-generated/conflicted-files/README.md`
- `docs/prototypes/ai-studio-generated/conflicted-files/docker-compose.yml`
- `docs/prototypes/ai-studio-generated/conflicted-files/docs__ARCHITECTURE.md`
- `docs/prototypes/ai-studio-generated/conflicted-files/docs__CHANGELOG.md`
- `docs/prototypes/ai-studio-generated/conflicted-files/docs__CURRENT_STATUS.md`
- `docs/prototypes/ai-studio-generated/conflicted-files/docs__EXECUTION_CHECKLIST.md`
- `docs/prototypes/ai-studio-generated/conflicted-files/docs__HANDOFF_LOG.md`
- `docs/prototypes/ai-studio-generated/conflicted-files/docs__NEXT_STEPS.md`
- `docs/prototypes/ai-studio-generated/conflicted-files/docs__RISK_LOG.md`
- `docs/prototypes/ai-studio-generated/conflicted-files/docs__SECURITY_PLAN.md`
- `docs/prototypes/ai-studio-generated/conflicted-files/package-lock.json`
- `docs/prototypes/ai-studio-generated/lib/routes.ts`
- `docs/prototypes/ai-studio-generated/lib/utils.ts`
- `docs/prototypes/ai-studio-generated/prisma.config.ts`
- `docs/prototypes/ai-studio-generated/public/file.svg`
- `docs/prototypes/ai-studio-generated/public/globe.svg`
- `docs/prototypes/ai-studio-generated/public/next.svg`
- `docs/prototypes/ai-studio-generated/public/vercel.svg`
- `docs/prototypes/ai-studio-generated/public/window.svg`
- `docs/prototypes/ai-studio-generated/root-scaffold/.prettierrc.json`
- `docs/prototypes/ai-studio-generated/root-scaffold/app/agent/page.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/app/analytics/page.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/app/api/health/route.ts`
- `docs/prototypes/ai-studio-generated/root-scaffold/app/approvals/page.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/app/audit/page.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/app/brand/page.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/app/calendar/page.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/app/dashboard/page.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/app/errors/page.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/app/favicon.ico`
- `docs/prototypes/ai-studio-generated/root-scaffold/app/files/page.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/app/globals.css`
- `docs/prototypes/ai-studio-generated/root-scaffold/app/layout.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/app/library/page.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/app/monetization/page.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/app/notifications/page.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/app/page.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/app/pipeline/page.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/app/platforms/page.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/app/settings/page.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/app/tools/page.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/app/upgrades/page.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/app/workflows/page.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/components.json`
- `docs/prototypes/ai-studio-generated/root-scaffold/components/design/confirm-dialog.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/components/design/empty-state.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/components/design/loading-skeleton.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/components/design/page-header.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/components/design/risk-badge.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/components/design/stat-card.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/components/design/status-badge.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/components/layout/app-shell.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/components/providers/theme-provider.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/components/shell/command-palette.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/components/shell/notification-center.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/components/shell/sidebar.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/components/shell/topbar.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/components/ui/button.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/components/ui/page-placeholder.tsx`
- `docs/prototypes/ai-studio-generated/root-scaffold/lib/routes.ts`
- `docs/prototypes/ai-studio-generated/root-scaffold/lib/utils.ts`
- `docs/prototypes/ai-studio-generated/root-scaffold/prisma.config.ts`
- `docs/prototypes/ai-studio-generated/root-scaffold/public/file.svg`
- `docs/prototypes/ai-studio-generated/root-scaffold/public/globe.svg`
- `docs/prototypes/ai-studio-generated/root-scaffold/public/next.svg`
- `docs/prototypes/ai-studio-generated/root-scaffold/public/vercel.svg`
- `docs/prototypes/ai-studio-generated/root-scaffold/public/window.svg`

## Probably Safe

These files are currently unimported by the active app but may retain design/reference value. Move to `/archive/review-required/` instead of deleting.

### `src/components/app/dashboard-screen.tsx`

Classification: `PROBABLY SAFE`

Risk level: `LOW-MEDIUM`

Why unused:

- Import graph shows no active importer.
- `rg` found only the file's own export.
- Active `/dashboard` route imports `CommandCenterPage` and `getCommandCenterView("dashboard")`, not `DashboardScreen`.

Dependency/reference proof:

- Current route: `src/app/(app)/dashboard/page.tsx`.
- No `src/**` import of `DashboardScreen`.

Action: move to `archive/review-required/src/components/app/dashboard-screen.tsx`.

### `src/components/app/route-page.tsx`

Classification: `PROBABLY SAFE`

Risk level: `LOW-MEDIUM`

Why unused:

- Import graph shows no active importer.
- `rg` found only the file's own export.
- Command-center pages now use `CommandCenterPage` or route-specific screens.

Dependency/reference proof:

- No `src/**` import of `RoutePage`.
- It represents the older placeholder route rendering strategy.

Action: move to `archive/review-required/src/components/app/route-page.tsx`.

### `src/components/app/loading-skeleton.tsx`

Classification: `PROBABLY SAFE`

Risk level: `LOW`

Why unused:

- Import graph shows no active importer.
- `rg` found references only in the implementation plan and generated prototype files.

Dependency/reference proof:

- No active app import of `LoadingSkeleton`.

Action: move to `archive/review-required/src/components/app/loading-skeleton.tsx`.

## Dependency Cleanup Candidates

### `@hookform/resolvers`

Classification: `SAFE TO REMOVE FROM package.json`

Risk level: `LOW`

Why unused:

- No active source import.
- `rg` found references only in `package.json`, `package-lock.json`, and generated prototype/conflict files.
- No `react-hook-form` dependency exists.

### `@radix-ui/react-dialog`

Classification: `SAFE TO REMOVE FROM package.json`

Risk level: `LOW`

Why unused:

- No active source import.
- Current `ConfirmDialog` is custom and does not import Radix Dialog.
- `@radix-ui/react-slot` is still directly used by the active button component and must remain.

## Needs Review

No files in this category should be moved or deleted in this pass.

- `docs/ARCHITECTURE.md`: overlaps with newer architecture docs but functions as a compact entrypoint. Keep for now.
- `docs/DEPLOYMENT_PLAN.md` and `docs/REAL_DATA_TESTING.md`: older deployment docs but still referenced by README and useful for production recovery/history. Keep for now.
- `CODEX_START_COMMAND.md`: overlaps with handoff docs but remains a convenient resume instruction file. Keep for now.
- `src/lib/services/mock.ts` and `src/lib/services/types.ts`: mock-only but architecture-critical service interface foundation. Keep.
- `src/lib/command-center/mock-service.ts`: mock data but active UI dependency for command-center dashboards. Keep.

## Critical Keep

Do not delete or archive:

- `src/app/**` active app and API routes.
- `src/lib/auth/**`, `src/lib/security/**`, `src/proxy.ts`.
- `src/lib/orchestration/**`, `src/workers/orchestration-worker.ts`.
- `src/lib/governance/**`, `src/lib/operations-trace/**`, `src/lib/deployment-governance/**`.
- `src/lib/live-execution/**`, `src/lib/ai-gateway/**`.
- `src/lib/media/**`, `src/lib/browser-ops/**`, `src/lib/platform-ops/**`, `src/lib/memory/**`, `src/lib/intelligence/**`.
- Prisma schema/seed and Supabase migration.
- Docker, Vercel, env templates, package manifest/lockfile, Next/TS/Tailwind/PostCSS/ESLint config.
- Root control docs and checkpoint docs.
- Active shared UI and command-center components imported by routes.

## Cleanup Plan

1. Delete `docs/prototypes/ai-studio-generated/**`.
2. Move the three unimported app components into `/archive/review-required/`.
3. Add `archive/**` to TypeScript and ESLint excludes so archived TSX does not compile.
4. Remove stale `docs/prototypes/**`, `app/**`, `components/**`, `lib/**`, and `prisma.config.ts` ignores after deleting the old scaffold.
5. Remove unused npm packages `@hookform/resolvers` and `@radix-ui/react-dialog`.
6. Update checkpoint/risk docs to state that prototype scaffold was removed after audit.
7. Run full verification.

## Cleanup Execution Result

Executed after this report was generated:

- Deleted `docs/prototypes/ai-studio-generated/**`.
- Moved `src/components/app/dashboard-screen.tsx`, `src/components/app/route-page.tsx`, and `src/components/app/loading-skeleton.tsx` to `archive/review-required/src/components/app/`.
- Added `archive/review-required/README.md`.
- Removed `@hookform/resolvers` and `@radix-ui/react-dialog`.
- Simplified TypeScript/ESLint excludes.
- Verification passed: `eslint .`, `tsc --noEmit`, `tsx --test "src/**/*.test.ts"`, `prisma generate`, `next build`, and local preview-demo route/API smoke.
