# Next Steps

## Immediate Next Phase

Complete Phase 3 authentication hardening, then continue real backend data flows.

## Exact Next Tasks

1. Resume from branch `build/phase-0-foundation` and confirm `git status` is clean.
2. Pull/install dependencies if needed, then run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`.
3. Add a password-change flow for the seeded admin and clearly warn the user to change `ChangeMe123!`.
4. Add role-aware UI/API checks for admin/operator/viewer.
5. Continue replacing generic route placeholders with database-backed route-specific pages.
6. Configure Oracle n8n webhook env values only when the human provides the URL/secret, then test `POST /api/integrations/n8n/test`.
7. Add mobile sidebar behavior, toasts, refined command palette interactions, and file upload validation.
8. Add backend APIs for settings, approvals, audit logs, and route data persistence.

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

Continue from branch `build/phase-0-foundation`, read all root project docs and checkpoint docs, run verification, then continue Phase 3 auth hardening with password change and role-aware checks. Supabase schema/seed/Vercel production database env are already complete; avoid destructive database resets.
