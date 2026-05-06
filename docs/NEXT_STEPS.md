# Next Steps

## Immediate Next Phase

Continue database setup gates, then complete Phase 3 authentication hardening and real backend data flows.

## Exact Next Tasks

1. Resume from branch `build/phase-0-foundation` and confirm `git status` is clean except checkpoint docs if this commit was not pushed.
2. Confirm Supabase CLI is still linked to project `eobvgajgyvydqydlfken` with `supabase projects list`.
3. Apply the Prisma schema through Supabase Management API, not the direct database hostname from this Windows environment:

```powershell
$nodeDir="$env:TEMP\folqen-node-runtime\node-v24.14.0-win-x64"
$schemaFile=Join-Path $env:TEMP "folqen_prisma_schema.sql"
& (Join-Path $nodeDir "node.exe") node_modules\prisma\build\index.js migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script | Set-Content -LiteralPath $schemaFile -Encoding utf8
& (Join-Path $nodeDir "npx.cmd") supabase db query --linked --file $schemaFile
```

4. Seed the approved Supabase database. Prefer `npm run db:seed` with the Supabase pooler URL only if it responds quickly; if Prisma hangs again, create a temporary SQL seed and run it with `supabase db query --linked --file`.
5. Add Supabase pooler `DATABASE_URL` to Vercel production env without printing or committing the password.
6. Redeploy production and verify `/api/health` changes database from `not_connected` to `live`.
7. Verify `/login` with the seeded admin account, then add a password-change flow and role-aware UI checks.
8. Configure Oracle n8n webhook env values and test `POST /api/integrations/n8n/test`.
9. Continue replacing generic route placeholders with database-backed route-specific pages.
10. Add mobile sidebar behavior, toasts, refined command palette interactions, and file upload validation.

## Human Decisions Needed

Required before real database/n8n testing:

- Supabase database schema application approval if the next account treats it as production-like.
- Oracle n8n webhook URL and shared secret.
- Approval before destructive migrations, public publishing, paid tools, browser automation, or OAuth/platform connections.

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

Continue from branch `build/phase-0-foundation`, read all root project docs and checkpoint docs, run verification, then resume Supabase schema setup through `supabase db query --linked`. Do not retry the direct Supabase database hostname from this Windows environment unless DNS is confirmed fixed.
