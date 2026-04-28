# HANDOFF_RULES.md

## Purpose

Folqen may be built by different Codex tasks, sessions, or accounts because of rate limits or availability.

Every Codex account must be able to continue from the last safe checkpoint without relying on memory from a previous Codex run.

The repository itself is the source of truth.

---

## Core handoff rule

Before starting or continuing work, Codex must read:

- `AGENTS.md`
- `PROJECT_BRIEF.md`
- `IMPLEMENTATION_PLAN.md`
- `CHECKPOINT_RULES.md`
- `FUTURE_PROOF_ARCHITECTURE.md`
- `SELF_IMPROVEMENT_AGENT.md`
- `HANDOFF_RULES.md`
- `docs/CURRENT_STATUS.md` if it exists
- `docs/NEXT_STEPS.md` if it exists
- `docs/CHANGELOG.md` if it exists
- `docs/RISK_LOG.md` if it exists
- `docs/HANDOFF_LOG.md` if it exists

No Codex run should assume it remembers previous work from chat history.

---

## Handoff save files

At the end of every phase, blocked state, or important change, Codex must create or update:

- `docs/CURRENT_STATUS.md`
- `docs/NEXT_STEPS.md`
- `docs/CHANGELOG.md`
- `docs/RISK_LOG.md`
- `docs/HANDOFF_LOG.md`

`docs/HANDOFF_LOG.md` must include:

- current phase
- exact completed work
- exact pending work
- commands run
- command results
- current branch
- latest commit SHA if available
- known broken areas
- known mock-only areas
- files changed
- environment assumptions
- whether the repo is safe to continue from another Codex account
- next recommended Codex command

---

## Cross-account resume command

If a new Codex account or task starts, use this command:

```text
Read AGENTS.md, PROJECT_BRIEF.md, IMPLEMENTATION_PLAN.md, CHECKPOINT_RULES.md, FUTURE_PROOF_ARCHITECTURE.md, SELF_IMPROVEMENT_AGENT.md, HANDOFF_RULES.md, and all docs checkpoint files.

You are continuing Folqen from a previous Codex task/account.

Do not assume any prior memory.

Use the repository files as the source of truth.

First verify the current state:
- inspect files
- check branch
- install dependencies if needed
- run lint/typecheck/tests/build if available
- read CURRENT_STATUS, NEXT_STEPS, CHANGELOG, RISK_LOG, and HANDOFF_LOG

Then continue from the next safe task.

Update HANDOFF_LOG after meaningful progress so another Codex account can continue if this task stops.
```

---

## Rate-limit safe behavior

To avoid losing progress if Codex hits rate limits:

- work in small committed phases
- update checkpoint docs frequently
- commit after stable changes
- avoid huge uncommitted rewrites
- keep implementation notes in repo docs
- write clear TODOs with file paths
- never leave secret values in files
- never enable paid/public actions while handing off

---

## When blocked

If Codex gets blocked, it must update `docs/HANDOFF_LOG.md` with:

- blocker title
- blocker reason
- what human decision is needed
- what was completed before the blocker
- safe next command
- safe rollback steps if relevant

---

## If multiple Codex accounts work on the repo

Codex must check for new commits before continuing.

If there are conflicting changes, Codex must not overwrite work blindly.

It should inspect, merge carefully if safe, or stop and explain the conflict.

---

## Final rule

A new Codex account should be able to continue Folqen by reading the repo files only.

If the current task stops because of rate limits, another Codex task/account should continue from `docs/HANDOFF_LOG.md` and `docs/NEXT_STEPS.md`.
