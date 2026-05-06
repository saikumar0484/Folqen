# Risk Log

<<<<<<< ours
## Current Risks

### Real deployment requires secret handling

- Risk: Vercel, database, and n8n secrets could be leaked if added to files or terminal logs.
- Prevention: Keep only placeholders in `.env.example`; add real values through Vercel/local env secret flows only; `.vercelignore` excludes env files from CLI deployment uploads.
- Verification: Check git diff before commits; verify `.env` and `.env.*` remain ignored except `.env.example`.
- Rollback: Rotate exposed credentials immediately if any secret is accidentally printed or committed.
- Human approval trigger: Any real credential, Vercel production env change, database connection string, or n8n shared secret.

### Database push/seed can affect real data

- Risk: `npm run db:push` and `npm run db:seed` can modify the target database.
- Prevention: Confirm `DATABASE_URL` target before running database commands; use free/dev database first.
- Verification: Run `prisma validate`, then inspect provider project before pushing schema.
- Rollback: Use provider backups/snapshots where available; otherwise recreate the free dev database and rerun seed.
- Human approval trigger: Any production-like database migration, schema push, or seed against a real database.

### n8n webhook test triggers a real workflow

- Risk: `POST /api/integrations/n8n/test` sends a real event to the configured Oracle n8n webhook.
- Prevention: The payload is only `connection_test` and includes disabled publishing/paid-tool flags.
- Verification: Confirm n8n workflow checks `x-folqen-secret` and only logs/acknowledges test events.
- Rollback: Remove `N8N_WEBHOOK_URL` and `N8N_WEBHOOK_SECRET` env values to return Folqen to `Not connected`.
- Human approval trigger: Any n8n workflow that publishes, spends money, edits accounts, or runs browser automation.

### Template port is a design adaptation, not a framework replacement

- Risk: The uploaded template uses Vite/TanStack/Tailwind v4 patterns, while Folqen is a Next.js/Tailwind v3 app.
- Prevention: Port visual structure and CSS tokens, not incompatible framework files.
- Verification: Run lint, typecheck, tests, and build after every template-related change.
- Rollback: Revert only the adapted landing/dashboard changes if they break the app.
- Human approval trigger: None unless the user wants a full framework migration, which is not recommended now.

### Next/PostCSS npm audit advisories

- Risk: `npm audit` reports two moderate vulnerabilities through Next's bundled PostCSS dependency even after upgrading to Next `16.2.4`.
- Prevention: Do not run `npm audit fix --force` because npm proposes a breaking downgrade to `next@9.3.3`.
- Verification: Track future compatible Next patches and rerun `npm audit`.
- Rollback: No code rollback needed; current build passes.
- Human approval trigger: Upgrade only when compatible and verified.

### Browser visual verification unavailable

- Risk: HTTP checks passed, but screenshot-level browser verification could not run in this desktop session.
- Prevention: Keep UI simple, build verified, and use route text checks.
- Verification: Run browser verification again when `agent-browser`, browser-use runtime, Playwright, or another approved browser tool is available.
- Rollback: None needed.
- Human approval trigger: None unless visual testing reveals design issues later.

### Auth and database migrations not implemented

- Risk: Route placeholders are publicly accessible until Phase 3 auth exists, and Prisma schema has not been migrated.
- Prevention: Do not treat the app as production-ready.
- Verification: Add auth tests and migration verification in later phases.
- Rollback: Keep schema changes in branch until stable.
- Human approval trigger: Real database migration or production auth changes.

### Live integrations not connected

- Risk: Users may assume platform/tool actions are live.
- Prevention: UI labels all provider/tool/platform states as `Not connected` or `Mock`.
- Verification: Check route copy and health response.
- Rollback: Revert any integration that claims live status before setup.
- Human approval trigger: OAuth, credentials, paid tools, public publishing, or browser automation.

## Security Concerns

- No secrets are committed.
- Public publishing is blocked by default.
- Paid tools are blocked by default.
- Browser automation is blocked by default.
- Human approval is required by default.
- Real upload validation, auth, sessions, rate limits, and audit persistence are still future work.
=======
## Active risks

1. **Auth not implemented yet (expected until Phase 3)**
   - Failure mode: pages are not truly protected.
   - Prevention: complete middleware/session auth in next phase before sensitive server actions.
   - Verification: role-based access and protected route checks in Phase 3.
   - Rollback: keep sensitive operations mocked and non-destructive until auth is in place.
   - Human approval trigger: only if external identity provider credentials are required.

2. **UI is premium placeholder, not feature-complete**
   - Failure mode: users may assume integrations are live.
   - Prevention: explicit mock/Not connected messaging across shell components.
   - Verification: visual pass on every route placeholder.
   - Rollback: revert any misleading integration claims.
   - Human approval trigger: none.

3. **Prisma transitive engine warning risk (Node compatibility)**
   - Failure mode: future dependency updates may require Node >=22.
   - Prevention: pin versions and verify on upgrade.
   - Verification: lint/typecheck/build after dependency changes.
   - Rollback: revert problematic updates.
   - Human approval trigger: if runtime upgrade becomes required.

## Integration limitations (current)

- Platform, workflow, analytics, and tool integrations remain intentionally mocked/Not connected.

## Mock-only scope (current)

- Command palette, notification center, confirmations, and page metrics are placeholder implementations.
>>>>>>> theirs
