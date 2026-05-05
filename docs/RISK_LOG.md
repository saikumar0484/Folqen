# Risk Log

## Current Risks

### Next/PostCSS npm audit advisories

- Risk: `npm audit` reports two moderate vulnerabilities through Next's bundled PostCSS dependency.
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
