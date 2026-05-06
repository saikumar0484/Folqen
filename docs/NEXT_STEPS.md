# Next Steps

## Immediate Next Phase

Continue database setup gates, then complete Phase 3 authentication hardening and real backend data flows.

## Exact Next Tasks

1. Configure a free Postgres provider outside git and add `DATABASE_URL` safely to Vercel/local env.
2. Run `npm run db:generate`, `npm run db:push`, and `npm run db:seed` only after confirming the target database.
3. Verify login at `/login` with `admin@example.com` / `ChangeMe123!`, then change the seed password.
4. Add password-change flow and role-aware UI checks for admin/operator/viewer.
5. Configure Oracle n8n webhook env values and test `POST /api/integrations/n8n/test`.
6. Continue replacing generic route placeholders with database-backed route-specific pages.
7. Add mobile sidebar behavior, toasts, refined command palette interactions, and file upload validation.

## Human Decisions Needed

Required before real deployment/database/n8n testing:

- Free database provider choice and connection string.
- Oracle n8n webhook URL and shared secret.
- Approval before pushing schema to any production-like database.

## Credentials Needed

Needed through safe secret flow only:

- `DATABASE_URL`
- `APP_BASE_URL`
- `NEXTAUTH_URL`
- `N8N_WEBHOOK_URL`
- `N8N_WEBHOOK_SECRET`
- `ORACLE_N8N_INSTANCE_URL`

## Risky Actions Coming Later

- Database migrations and seed user creation.
- Vercel production deployment.
- Real free database schema push.
- Oracle n8n webhook execution.
- File upload validation.
- Public publishing logic.
- Paid tool enablement.
- OAuth/platform account connections.
- Production deployment secrets.

## Resume Command

Continue from branch `build/phase-0-foundation`, read all root project docs and checkpoint docs, run verification, then configure free database credentials if available. If credentials are not available, continue auth hardening and backend service interfaces with mock/not-connected states.
