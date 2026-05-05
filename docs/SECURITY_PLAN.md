# Security Plan

## Defaults

- Public publishing disabled.
- Paid tools disabled.
- Browser automation disabled.
- Human approval required.
- Upload privacy defaults to private.
- No secrets committed.
- No frontend secret exposure.

## Required Guards

Implemented foundation guards:

- `canPublishPublicly`
- `canUsePaidTool`
- `canExecuteUpgrade`

These return blocked-by-default decisions with explicit reasons. Later phases must call these from server-side routes, actions, or services before any risky operation.

## Upcoming Security Work

- Authentication and session handling.
- Role-based access for admin, operator, and viewer.
- Password hashing and seed user rotation warning.
- Protected routes and server-side authorization checks.
- Security headers in `next.config.ts`.
- Rate limit helpers.
- Zod validation for API inputs.
- Upload MIME, size, path traversal, and privacy checks.
- Audit logs and approval logs for sensitive actions.

## Human Approval Triggers

Stop and ask before real credentials, OAuth permissions, public publishing, paid tools, browser automation, monetization/payment access, production secrets, destructive actions, database migrations, production prompt changes, or unclear legal/copyright cases.
