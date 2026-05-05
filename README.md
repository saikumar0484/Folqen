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

## Safety Defaults

Folqen must stay safe by default:

- `ALLOW_PUBLIC_PUBLISH=false`
- `REQUIRE_HUMAN_APPROVAL=true`
- `ALLOW_PAID_TOOLS=false`
- `ALLOW_BROWSER_AUTOMATION=false`
- `DEFAULT_UPLOAD_PRIVACY=private`

Do not add real secrets to the repository. Do not claim any integration is live until it is truly configured. Public publishing, paid tools, browser automation, credentials, monetization/payment actions, and real upgrades require explicit human approval.

## Current Status

The foundation branch includes a neon green dark cyber/glass UI direction, app shell placeholders, provider honesty states, environment validation, safety guards, Prisma schema foundation, and checkpoint docs. Authentication, live integrations, database migrations, uploads, and real publishing are not implemented yet.

## Default Admin User Later

The implementation plan calls for a future seed user:

- Email: `admin@example.com`
- Password: `ChangeMe123!`

This password must be changed immediately once authentication is implemented. It is not active in the current foundation.
