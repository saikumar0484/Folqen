# Next Steps

## Immediate Next Phase

Continue real backend data flows and the next safety-focused UX work. Dashboard, pipeline, library, settings, approvals, audit, and persistent mock agent chat now use Supabase-backed records.

## Exact Next Tasks

1. Resume from branch `build/phase-0-foundation` and confirm `git status` is clean.
2. Pull/install dependencies if needed, then run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`.
3. Check `https://folqen.vercel.app/api/health` and confirm database status remains `live`.
4. Use `/settings` to change the seeded admin password from `ChangeMe123!`.
5. Remove or rotate the temporary viewer test account after dashboard testing is finished.
6. Add stronger role-aware UI states for admin/operator/viewer and tests around forbidden actions.
7. Add stronger role-aware UI states for admin/operator/viewer and tests around forbidden actions.
8. Continue replacing generic route placeholders with database-backed route-specific pages, next choosing platforms/tools/notifications or analytics.
9. Configure Oracle n8n webhook env values only when the human provides the URL/secret, then test `POST /api/integrations/n8n/test`.
10. Add mobile sidebar behavior, toasts, refined command palette interactions, and file upload validation.
11. Add posting package generation for platforms that remain `Not connected`.

## Human Decisions Needed

Required before real n8n/platform testing:

- Oracle n8n webhook URL and shared secret.
- Approval before destructive migrations, public publishing, paid tools, browser automation, or OAuth/platform connections.

## Credentials Needed

Needed through safe secret flow only:

- `APP_BASE_URL`
- `NEXTAUTH_URL`
- `DATABASE_URL`
- `N8N_WEBHOOK_URL`
- `N8N_WEBHOOK_SECRET`
- `ORACLE_N8N_INSTANCE_URL`

## Risky Actions Coming Later

- Future database migrations after real user data exists.
- Vercel production deployment changes.
- Oracle n8n webhook execution.
- File upload validation.
- Public publishing logic.
- Paid tool enablement.
- OAuth/platform account connections.
- Production deployment secrets.

## Resume Command

Continue from branch `build/phase-0-foundation`, read README, all root project docs, and checkpoint docs, run verification, then continue database-backed route work or n8n setup if the human provides webhook secrets. Supabase, login, password change API, settings, approvals, audit logs, agent message persistence, dashboard, pipeline, and library live data are already verified locally.
