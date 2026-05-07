# Folqen

Folqen is an AI Creator Command Center for an India-based urban legends, mystery, and folklore content brand. It is being built as a secure, premium, future-proof Next.js app with approval-gated automation.

## Current Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL through Docker Compose for local development
- Zod for environment and server-side validation
- Framer Motion and Lucide for UI motion/icons

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the safe environment template:

```bash
cp .env.example .env
```

3. Start local PostgreSQL if database work is needed:

```bash
docker compose up -d
```

4. Run verification:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

5. Start development:

```bash
npm run dev
```

## Deployment Direction

The selected MVP deployment plan is:

- Vercel for the Folqen web app and API routes.
- Supabase free PostgreSQL for real app data.
- The user's Oracle Free Tier server for self-hosted n8n automation workers.
- Local/worker execution for heavy jobs like FFmpeg, ComfyUI, browser automation, and long-running workflows.

See `docs/DEPLOYMENT_PLAN.md` and `docs/REAL_DATA_TESTING.md` before connecting real infrastructure.

Current Vercel production URL:

- https://folqen.vercel.app

This deployment is live for testing the shell, login screen, protected-route behavior, health/status endpoints, database-backed authentication, settings, approvals, audit logs, persistent mock agent chat, route-specific protected pages, manual posting package generation/download, metadata-only file registration, safe mock-agent draft creation, provider setup panels, provider approval requests, and Supabase-backed dashboard/workspace data. It is not a complete production MVP yet because live n8n secrets, Google Drive OAuth/storage credentials, OpenAI key/payment approval, platform integrations, and real media workflows are still pending.

Useful deployment/data commands:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Run `db:push` only after confirming `DATABASE_URL` points to the intended free database. Do not commit real database URLs or n8n secrets.

## Safety Defaults

Folqen must stay safe by default:

- `ALLOW_PUBLIC_PUBLISH=false`
- `REQUIRE_HUMAN_APPROVAL=true`
- `ALLOW_PAID_TOOLS=false`
- `ALLOW_BROWSER_AUTOMATION=false`
- `DEFAULT_UPLOAD_PRIVACY=private`

Do not add real secrets to the repository. Do not claim any integration is live until it is truly configured. Public publishing, paid tools, browser automation, credentials, monetization/payment actions, and real upgrades require explicit human approval.

## Current Status

The foundation branch includes a neon green dark cyber/glass UI direction, app shell, provider honesty states, environment validation, safety guards, Prisma schema foundation, Supabase production database, and checkpoint docs. The landing page follows the uploaded `display-perfect-mirror-main.zip` template style with a sticky glass header, long product sections, clean empty states, FAQ, CTA, and footer.

The project now also includes deployment-readiness docs, database seed scripts, safe health/integration status APIs, custom authentication, password-change flow, database-backed settings, approval decisions, audit logs, persistent mock agent chat, all required authenticated route surfaces, manual posting package generation, upload validation foundations, service interface mocks, and dashboard/workspace pages reading live Supabase records.

Authentication routes and protected dashboard routes are implemented. Supabase is connected in production, the Prisma schema has been applied, seed data exists, and login works. A temporary low-privilege viewer test account exists for dashboard testing; keep its password out of repo docs and rotate/delete it after testing.

Google Drive is now the planned cloud storage provider in the settings/provider UI, but it is not connected until Google OAuth credentials, a refresh token, and a private Drive folder id are added through server-only environment variables. The n8n tab can embed the self-hosted n8n UI after `ORACLE_N8N_INSTANCE_URL` is configured and the n8n instance allows iframe embedding. OpenAI model preference is saved through the settings dropdown, but real OpenAI calls remain blocked until an API key is configured and paid-tool approval gates are intentionally enabled. Actual binary storage writes, live social integrations, real n8n workflows, real AI calls, media rendering, and real publishing are not implemented yet.

Admins can now create provider setup approval records from `/settings` for Google Drive storage, OpenAI paid-agent calls, n8n workflow access, and media worker setup. These approval requests are database/audit records only; they do not store secrets or connect external services.

## Design Template Direction

The requested design template is `display-perfect-mirror-main.zip`. Continue Folqen development using this visual language:

- dark cyber background
- neon green primary action color
- glassmorphism panels
- thin low-opacity borders
- grid background texture
- radial glow effects
- Space Grotesk, Inter, and JetBrains Mono typography direction
- clean product sections with strong empty states
- explicit `Mock`, `Not connected`, and `Needs approval` labels

Do not revert to the earlier purple/cyan style.

## Continuation Notes For Another Codex Account

1. Work from branch `build/phase-0-foundation`.
2. Read `AGENTS.md`, `IMPLEMENTATION_PLAN.md`, `CHECKPOINT_RULES.md`, `FUTURE_PROOF_ARCHITECTURE.md`, `SELF_IMPROVEMENT_AGENT.md`, `HANDOFF_RULES.md`, this README, and all checkpoint docs in `docs/`.
3. Run `npm install` if dependencies are missing.
4. Run `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` before continuing.
5. Start by confirming the live app still passes health and login checks.
6. Use `/settings` to change the seeded admin password, then rotate/delete the temporary viewer test account after testing.
7. Continue Google Drive OAuth/storage setup, n8n embed/webhook setup, OpenAI paid-tool approval flow, rendering worker setup, or role-aware action hardening if the needed secrets are available.
8. For deployment continuation, read `docs/DEPLOYMENT_PLAN.md` and `docs/REAL_DATA_TESTING.md` before adding Vercel, database, or n8n secrets.

## Default Admin User

The seed script creates this admin user:

- Email: `admin@example.com`
- Password: `ChangeMe123!`

This password must be changed immediately after first successful login.

## Latest Safe Checkpoint

Last safe checkpoint: May 7, 2026 on branch `build/phase-0-foundation`.

- Production URL: https://folqen.vercel.app
- Latest pushed checkpoint commit before this stop: see latest `build/phase-0-foundation` commit.
- Database status: live through Supabase.
- Safe to stop: yes, after the final handoff commit is pushed.
- Next recommended build task: actual file upload/storage flow, richer posting package workflow, role-aware action states, or Oracle n8n setup if webhook secrets are provided.
