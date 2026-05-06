# Real Data Testing Plan

## Goal

Start testing Folqen with real infrastructure while keeping risky actions blocked.

## Safe Real Data Sources

Allowed now:

- Real free Postgres database connection.
- Real Oracle n8n webhook for connection tests.
- Real mock/demo content records seeded into the database.
- Real app health/status responses.

Still blocked:

- Public publishing.
- Paid tool usage.
- Browser automation.
- Real social account posting.
- OAuth account connections.
- Production upgrades or migrations without approval.

## Testing Order

1. Verify the app locally:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

2. Configure a free Postgres `DATABASE_URL` outside git.
3. Generate and push the Prisma schema:

```bash
npm run db:generate
npm run db:push
```

4. Seed realistic starter data:

```bash
npm run db:seed
```

5. Start Folqen:

```bash
npm run dev
```

6. Check:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/integrations/status
```

7. Add Oracle n8n webhook env values outside git.
8. Test n8n:

```bash
curl -X POST http://localhost:3000/api/integrations/n8n/test
```

## Expected Results

- Database status becomes `live` when `DATABASE_URL` is valid.
- n8n status remains `configured` until the test endpoint succeeds.
- n8n test returns `live` only after the webhook accepts the health-check payload.
- All platform integrations continue showing `Not connected`.

## Recovery

If database setup fails:

- Remove or correct `DATABASE_URL`.
- Re-run `npm run db:generate`.
- Re-run `npm run db:push` only after confirming the target database.

If n8n test fails:

- Confirm the webhook URL accepts POST.
- Confirm the Oracle security list/firewall allows HTTPS traffic.
- Confirm `x-folqen-secret` matches the n8n workflow check.
- Remove `N8N_WEBHOOK_URL` to return Folqen to `Not connected`.
