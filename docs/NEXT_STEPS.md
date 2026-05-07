# Next Steps

## Immediate Next Phase

Continue from route-specific read surfaces into safe actions and MVP workflows. All required authenticated routes now have dedicated pages, manual posting package creation/download is live, file registration is live, and safe mock-agent draft creation is live. Binary object storage, provider-backed actions, and real automation are still pending.

Current save point: May 7, 2026. The live app is deployed at `https://folqen.vercel.app`, health reports database `live`, and the latest completed slice is file registration plus safe mock-agent draft creation.

## Exact Next Tasks

1. Resume from branch `build/phase-0-foundation` and confirm `git status` is clean.
2. Pull/install dependencies if needed, then run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`.
3. Check `https://folqen.vercel.app/api/health` and confirm database status remains `live`.
4. Use `/settings` to change the seeded admin password from `ChangeMe123!`.
5. Remove or rotate the temporary viewer test account after dashboard testing is finished.
6. Add stronger role-aware UI states for admin/operator/viewer and tests around forbidden actions.
7. Add stronger role-aware UI states for admin/operator/viewer and tests around forbidden actions.
8. Configure real Supabase Storage bucket, service key, and RLS/storage policies if the human approves credential setup; then replace metadata-only file registration with binary object storage.
9. Add copy-to-clipboard controls for posting package descriptions and checklist items.
10. Expand role-aware UI states across settings, packages, files, and future action APIs.
11. Wire the service interface foundation into workflow test APIs while keeping real execution blocked.
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

Continue from branch `build/phase-0-foundation`, read README, all root project docs, and checkpoint docs, run verification, then continue Supabase Storage setup, posting package copy polish, service-backed mock APIs, role-aware UI/tests, or n8n setup if the human provides webhook secrets. All required authenticated pages are route-specific, file registration is verified, and safe mock-agent draft creation exists.
