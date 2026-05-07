# Next Steps

## Immediate Next Phase

Continue from route-specific read surfaces into safe actions and MVP workflows. All required authenticated routes now have dedicated pages, but uploads, posting packages, provider services, and real automation are still pending.

## Exact Next Tasks

1. Resume from branch `build/phase-0-foundation` and confirm `git status` is clean.
2. Pull/install dependencies if needed, then run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`.
3. Check `https://folqen.vercel.app/api/health` and confirm database status remains `live`.
4. Use `/settings` to change the seeded admin password from `ChangeMe123!`.
5. Remove or rotate the temporary viewer test account after dashboard testing is finished.
6. Add stronger role-aware UI states for admin/operator/viewer and tests around forbidden actions.
7. Add stronger role-aware UI states for admin/operator/viewer and tests around forbidden actions.
8. Build the actual file upload/storage flow using the existing validation foundation, role checks, privacy defaults, storage path isolation, and audit logs.
9. Add posting package generation for platforms that remain `Not connected`.
10. Add role-aware UI states for admin/operator/viewer and tests around forbidden actions.
11. Add service interfaces and mock implementations for agent, publishing, analytics, workflow, render, storage, and notifications.
12. Configure Oracle n8n webhook env values only when the human provides the URL/secret, then test `POST /api/integrations/n8n/test`.
13. Add mobile sidebar behavior, toasts, and refined command palette interactions.

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

Continue from branch `build/phase-0-foundation`, read README, all root project docs, and checkpoint docs, run verification, then continue actual file upload/storage, posting packages, service interfaces, role-aware UI/tests, or n8n setup if the human provides webhook secrets. All required authenticated pages are route-specific, and upload validation foundations are verified locally.
