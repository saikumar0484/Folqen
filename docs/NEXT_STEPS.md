# Next Steps

## Immediate Next Phase

Continue Phase 2 route-specific UI refinement, then prepare Phase 3 authentication and security base.

## Exact Next Tasks

1. Continue replacing generic route placeholders with route-specific page layouts while keeping `Mock` and `Not connected` honesty.
2. Add mobile sidebar behavior for the app shell.
3. Add toast infrastructure and refine command palette interactions.
4. Build richer `/agent`, `/approvals`, `/platforms`, `/tools`, and `/settings` screens next.
5. Prepare Phase 3 auth design using roles: admin, operator, viewer.
6. Add Prisma seed planning before running any migrations.

## Human Decisions Needed

None for the next UI refinement work.

## Credentials Needed

None now. Real credentials must not be added until the app reaches live integration phases and the user provides them through a safe secret flow.

## Risky Actions Coming Later

- Authentication and session handling.
- Database migrations and seed user creation.
- File upload validation.
- Public publishing logic.
- Paid tool enablement.
- OAuth/platform account connections.
- Production deployment secrets.

## Resume Command

Continue from branch `build/phase-0-foundation`, read all root project docs and checkpoint docs, run verification, then continue Phase 2 route-specific UI work.
