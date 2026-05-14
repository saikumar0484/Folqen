# Upgrade Guide

Folqen includes a Self-Improvement Research Agent concept. It may research improvements and draft upgrade proposals, but it must not execute real upgrades automatically.

## Upgrade Proposal Requirements

Every proposal should include:

- title and summary
- category
- current problem
- proposed solution
- expected benefit
- estimated cost
- free alternative
- implementation difficulty
- security, privacy, policy, and compatibility risks
- testing plan
- rollback plan
- affected files or services
- required credentials or permissions
- human decision needed
- confidence score
- status

## Execution Rules

- Research can happen automatically.
- Drafting proposals can happen automatically.
- Testing in a branch requires approval.
- Production code, provider, workflow, prompt, security, or database changes require approval.
- Paid upgrades also require paid-tool approval.

## Checkpoint Rule

Before and after upgrade work, update `docs/CURRENT_STATUS.md`, `docs/NEXT_STEPS.md`, `docs/CHANGELOG.md`, `docs/RISK_LOG.md`, and `docs/HANDOFF_LOG.md`.
