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

This deployment is live for testing the shell, login screen, protected-route behavior, health/status endpoints, and database-backed authentication. It is not a complete production MVP yet because live n8n secrets, uploads, platform integrations, and real content workflows are still pending.

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

The foundation branch includes a neon green dark cyber/glass UI direction, app shell placeholders, provider honesty states, environment validation, safety guards, Prisma schema foundation, and checkpoint docs. The landing page now follows the uploaded `display-perfect-mirror-main.zip` template more closely with a sticky glass header, long product sections, clean empty states, FAQ, CTA, and footer. The dashboard next phase has started with Folqen-specific cards for jobs, approvals, platform status, tool limits, and activity.

The project now also includes deployment-readiness docs, database seed scripts, safe health/integration status APIs, and a custom authentication foundation for testing the Vercel + Supabase + Oracle n8n worker plan.

Authentication routes and protected dashboard routes are implemented. Supabase is connected in production, the Prisma schema has been applied, seed data exists, and login works with the default seeded admin user.

Uploads, live social integrations, and real publishing are not implemented yet.

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
5. Continue Phase 3 auth hardening with password change and role-aware checks, then continue route-specific backend work.
6. For deployment continuation, read `docs/DEPLOYMENT_PLAN.md` and `docs/REAL_DATA_TESTING.md` before adding Vercel, database, or n8n secrets.

## Default Admin User

The seed script creates this admin user:

- Email: `admin@example.com`
- Password: `ChangeMe123!`

This password must be changed immediately after first successful login.
