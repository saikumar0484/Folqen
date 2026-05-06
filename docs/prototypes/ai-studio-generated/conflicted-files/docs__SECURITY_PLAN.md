<<<<<<< ours
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
=======
# Folqen Security Plan (Phase 0 Draft)

## Security Defaults

```env
ALLOW_PUBLIC_PUBLISH=false
REQUIRE_HUMAN_APPROVAL=true
ALLOW_PAID_TOOLS=false
ALLOW_BROWSER_AUTOMATION=false
DEFAULT_UPLOAD_PRIVACY=private
```

## Mandatory Security Controls

- Authentication and protected routes.
- Role-based authorization (`admin`, `operator`, `viewer`).
- Secure session handling and password hashing.
- Zod validation for all external/user inputs.
- Server-side checks for all sensitive actions.
- File upload validation (MIME, extension, size, filename sanitization).
- Path traversal prevention in file management.
- Security headers and baseline rate-limiting helpers.
- Audit logs and approval logs for sensitive operations.
- Secret masking in settings and logs.
- Confirmation dialogs for risky/destructive actions.

## Guard Functions (Phase 10 target)

- `canPublishPublicly(contentItem, settings, approval)`
- `canUsePaidTool(tool, settings, approval)`
- `canExecuteUpgrade(upgradeProposal, settings, approval)`

## Critical Blocking Rules

### Public publishing blocked unless all true

- `ALLOW_PUBLIC_PUBLISH === true`
- `REQUIRE_HUMAN_APPROVAL === true`
- approval status is `approved`
- content safety status is `passed`
- copyright status is `clear`
- review status is `passed`

### Paid tools blocked unless all true

- `ALLOW_PAID_TOOLS === true`
- human approval status is `approved`
>>>>>>> theirs
