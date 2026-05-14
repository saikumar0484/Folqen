# Failure Recovery Playbook

Folqen should expect failures and make them recoverable.

## Before Risky Work

- Confirm current branch and changed files.
- Read checkpoint docs.
- Identify whether the work touches auth, database, uploads, publishing, paid tools, providers, security, or deployment.
- Update `docs/RISK_LOG.md` with prevention, verification, rollback, and approval triggers.

## If Verification Fails

1. Stop expanding scope.
2. Capture the failing command and output.
3. Fix safe local code issues.
4. Re-run the failing command.
5. If the fix would require credentials, paid tools, destructive changes, production secrets, or risky migration work, update checkpoint docs and ask the human.

## If Build State Is Unsafe

- Do not continue to the next phase.
- Revert only your own failed experiment if needed.
- Keep unrelated user or remote changes intact.
- Update handoff docs with the exact blocker and safe next command.

## Safe Recovery Output

When blocked, document:

- what failed
- why it failed
- commands run
- files changed
- safe rollback path
- whether the repo is safe to stop
- what human decision or permission is needed
