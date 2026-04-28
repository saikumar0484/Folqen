# CHECKPOINT_RULES.md

## Purpose

Folqen will be built over multiple sessions. The human may stop, take breaks, close the PC, or continue later. Codex must protect the project from being left broken while still continuing work in Codex cloud until the project is complete or blocked.

## Continuous cloud work rule

Checkpoints are save points, not stopping points.

Codex should not stop at every checkpoint unless the human explicitly asks to pause, stop, take a break, or create a checkpoint and wait.

In Codex cloud, continue working phase by phase even if the human closes the PC or leaves the session.

Continue automatically until one of these happens:

- the full project is complete
- human credentials are required
- OAuth/account permissions are required
- paid tool approval is required
- public publishing approval is required
- deployment secrets are required
- a risky migration/security/publishing/provider change needs approval
- verification fails and cannot be fixed safely
- a human decision is required

## Core checkpoint rule

Every phase must end at a safe checkpoint, but Codex should continue to the next phase after the checkpoint unless blocked or told to pause.

A safe checkpoint means:

- The app installs successfully.
- The app builds successfully, or the current limitation is clearly documented.
- Lint/typecheck/tests are run when available.
- Broken experiments are reverted or isolated.
- Unfinished work is documented.
- Next steps are written clearly.
- No secrets are committed.
- No paid tools are enabled.
- No public publishing is enabled.

## Before starting a phase

Codex must check current branch, changed files, build status, previous checkpoint notes, unfinished risky work, whether the phase is large, and whether it affects security, auth, database, publishing, or provider architecture.

Before risky work, create a checkpoint. If the risky work requires approval, stop and ask the human. Risky phases include auth, database migrations, file uploads, publishing logic, paid tools, OAuth, deployment, deleting many files, major refactors, security settings, provider/plugin changes, and production environment changes.

## Save point docs

At the end of every phase, create or update:

- `docs/CURRENT_STATUS.md`
- `docs/NEXT_STEPS.md`
- `docs/CHANGELOG.md`
- `docs/RISK_LOG.md`

`CURRENT_STATUS.md` must include current phase, completed work, app status, build status, test status, known issues, safe-to-stop yes/no, last verified commands, branch/commit info, and whether Codex is continuing automatically or blocked.

`NEXT_STEPS.md` must include next phase, exact next tasks, human decisions needed, credentials needed, risky actions coming next, and resume command.

`CHANGELOG.md` must include date, phase, files changed, features added, fixes made, and verification performed.

`RISK_LOG.md` must include current risks, security concerns, integration limitations, mock-only features, incomplete areas, and recovery steps.

## Pause command

If the human says pause, stop, break, take break, save point, or checkpoint, Codex must immediately stop starting new work, finish or revert the current small change, run verification if possible, update checkpoint docs, commit or summarize safe checkpoint, and tell the human whether the project is safe to stop.

## Resume command

If the human says resume, continue, start again, or continue from checkpoint, Codex must read the checkpoint docs and project instruction files, check repo status, run verification, and continue from the next safe task.

## Do not stop in these states

Avoid leaving broken builds, broken auth, broken migrations, undocumented env variables, half-created schemas, half-installed packages, broken routes, public publishing enabled, paid tools enabled, secrets committed, upload routes without validation, unreviewed destructive changes, or half-migrated provider/plugin architecture.

## Final rule

Folqen must always be resumable and Codex-cloud friendly. The human should be able to close the PC, return later, and see either completed work, a safe blocker, or a clear checkpoint. If returning after a blocker, the human should be able to say: `Continue from checkpoint`.
