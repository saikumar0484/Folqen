# Next Steps

## Immediate Next Phase

Continue deployment setup gates, then Phase 3 authentication and security base.

## Exact Next Tasks

1. Configure a free Postgres provider outside git and add `DATABASE_URL` safely.
2. Run `npm run db:generate`, `npm run db:push`, and `npm run db:seed` only after confirming the target database.
3. Configure Vercel project/env variables through the dashboard or CLI without printing secrets.
4. Configure Oracle n8n webhook env values and test `POST /api/integrations/n8n/test`.
5. Continue replacing generic route placeholders with route-specific page layouts while keeping `Mock` and `Not connected` honesty.
6. Add mobile sidebar behavior, toasts, and refined command palette interactions.
7. Build Phase 3 auth design using roles: admin, operator, viewer.

## Human Decisions Needed

Required before real deployment/database/n8n testing:

- Vercel account/project authorization.
- Free database provider choice and connection string.
- Oracle n8n webhook URL and shared secret.
- Approval before pushing schema to any production-like database.

## Credentials Needed

Needed through safe secret flow only:

- `DATABASE_URL`
- `AUTH_SECRET`
- `APP_BASE_URL`
- `NEXTAUTH_URL`
- `N8N_WEBHOOK_URL`
- `N8N_WEBHOOK_SECRET`
- `ORACLE_N8N_INSTANCE_URL`

## Risky Actions Coming Later

- Authentication and session handling.
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

Continue from branch `build/phase-0-foundation`, read all root project docs and checkpoint docs, run verification, then either configure Vercel/free database/n8n secrets or continue Phase 3 authentication if credentials are not available.
