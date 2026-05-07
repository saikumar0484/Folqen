# Risk Log

## Current Risks

### Files page is inventory-only

- Risk: Users may expect the Files page to accept uploads now that it has a route-specific UI.
- Prevention: Upload controls are not enabled. The page explicitly states uploads are disabled until validation, storage, role checks, confirmations, and audit logs exist.
- Verification: `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` passed after adding the page.
- Rollback: Revert the foundation pages data-loader and screen commit if a route causes runtime issues.
- Human approval trigger: Any file upload/storage implementation that writes files, accepts user input, or changes storage configuration.

### Monetization page is read-only

- Risk: Users may expect payment or monetization actions.
- Prevention: Payment access remains off, and the route only displays readiness/analytics signals.
- Verification: `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` passed.
- Rollback: Revert the monetization screen if it causes confusion or runtime issues.
- Human approval trigger: Any payment, ads, sponsorship commitment, revenue API, or monetization account connection.

### Operations pages are read-only

- Risk: Users may expect notifications, analytics, errors, workflows, or upgrades pages to mark records read, resolve errors, execute workflows, or apply upgrades.
- Prevention: The pages only read Supabase records and display safety guidance. Write/execution actions remain out of scope until role checks, confirmations, service adapters, and audit logs exist.
- Verification: `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` passed after adding the pages.
- Rollback: Revert the operations data-loader and page commits if a route causes runtime issues.
- Human approval trigger: Any workflow execution, upgrade execution, external analytics connection, notification delivery channel, destructive error cleanup, paid provider call, or production code/security change.

### Platforms and tools pages are status-only

- Risk: Users may expect platform connection cards or tool cards to connect accounts, run providers, render media, or publish content.
- Prevention: The pages read Supabase/runtime status only and keep all setup/execution actions out of scope until credentials, role checks, approvals, and service adapters exist.
- Verification: `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` passed after adding the pages.
- Rollback: Revert the platforms/tools page and data-loader commits if a route causes runtime issues.
- Human approval trigger: Any OAuth setup, platform credential entry, paid provider enablement, n8n workflow trigger, render execution, or public publishing feature.

### Pipeline and library pages are read-only

- Risk: Users may expect the new live-data pages to execute retries, downloads, uploads, archive/delete, renders, or posting packages.
- Prevention: The pages show existing Supabase records and keep write actions out of scope until service adapters, upload validation, role checks, confirmations, and audit logs are implemented.
- Verification: `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` passed after adding the pages.
- Rollback: Revert the pipeline/library page and data-loader commits if a route causes runtime issues.
- Human approval trigger: Any destructive archive/delete, real render, upload handling, public publishing, paid provider call, or n8n workflow trigger.

### Temporary viewer test account exists

- Risk: A shared test account can remain active longer than needed.
- Prevention: It has role `VIEWER`, cannot change settings, and cannot approve/reject items.
- Verification: Production login and dashboard access were tested; privileged APIs remain role-gated.
- Rollback: Delete or rotate the test account from Supabase after dashboard testing.
- Human approval trigger: Keeping, deleting, or changing role/password for the test account.

### Supabase direct database hostname is unreliable from this Windows environment

- Risk: Direct Prisma commands against `db.eobvgajgyvydqydlfken.supabase.co:5432` fail DNS resolution locally, and a prior pooler `db push` attempt hung.
- Prevention: Use `supabase db query --linked` through the Supabase Management API for schema SQL application; keep SQL files temporary and out of git.
- Verification: `supabase db query --linked` successfully returned current database and user from the linked project.
- Rollback: If schema application fails partway, inspect Supabase tables through `supabase db query --linked`, document the failed SQL statement, and ask before destructive cleanup.
- Human approval trigger: Any destructive database operation, reset, drop, migration against production-like data, or credential rotation.

### Supabase database password was shared in chat

- Risk: The DB password is now visible in conversation history even though it was not committed to git.
- Prevention: Do not print it again, do not write it to repository files, and add the final connection string only through Vercel/local secret flows.
- Verification: `git status` and `git diff` must show no committed secret files or connection strings.
- Rollback: Rotate the Supabase database password after the app is connected, or sooner if there is any concern the chat history is exposed.
- Human approval trigger: Password rotation, Vercel secret replacement, or any credential-bearing operation.

### Default seeded admin password must be changed

- Risk: The seeded admin account uses the documented first-run password.
- Prevention: Use the implemented password-change flow in `/settings` and treat the seeded password as temporary first-login-only access.
- Verification: Production login works and the password-change API/page exist.
- Rollback: Rotate the user password directly in Supabase or reseed with a new hash if needed.
- Human approval trigger: Password rotation policy, account recovery decisions, or inviting additional real users.

### Generated prototype files are preserved but not active

- Risk: Prototype files under `docs/prototypes/ai-studio-generated/` may confuse future agents or TypeScript if included accidentally.
- Prevention: `docs/prototypes/**` is excluded from active TypeScript compilation.
- Verification: `npm run typecheck` and `npm run build` pass.
- Rollback: Delete or archive the prototype folder after human approval if it is no longer needed.
- Human approval trigger: Replacing active Folqen UI with prototype code.

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

### Future database migrations can affect real data

- Risk: Supabase is now live and seeded, so future schema changes can affect real data.
- Prevention: Avoid destructive resets, inspect migration SQL, and use small reviewed schema changes.
- Verification: Run lint, typecheck, tests, build, and targeted Supabase checks after changes.
- Rollback: Use Supabase backups/snapshots where available or write explicit rollback SQL for small changes.
- Human approval trigger: Any destructive migration, reset, drop, or production auth/security change.

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
- Auth, protected sessions, audit persistence, and database-backed settings/approvals exist.
- Upload validation, rate limits, CSRF hardening, broader role tests, and platform OAuth security are still future work.
