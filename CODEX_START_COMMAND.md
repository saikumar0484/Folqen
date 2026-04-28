# CODEX_START_COMMAND.md

Copy and paste this into Codex cloud for the `saikumar0484/Folqen` repo.

---

Read these files first:

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

You are responsible for completing Folqen phase by phase.

This task may be started by a different Codex account or session than previous work. Do not assume prior chat memory. The repository files are the source of truth.

Work continuously in Codex cloud until the project is complete or until human intervention is required.

Do not pause just because I close my PC, leave the browser, or stop watching the task.

Do not ask me to manually send every phase prompt.

First, perform Phase 0 preparation or resume from the latest checkpoint if Phase 0 already exists:

- inspect the repo
- confirm the current stack
- identify the package manager
- create/read the execution checklist
- prepare/read the project structure plan
- create/read the route/page plan
- create/read the database/schema plan
- create/read the security plan
- create/read checkpoint files
- create/read future-proof provider/plugin architecture plan
- create/read self-improvement research and upgrade approval plan
- read `docs/HANDOFF_LOG.md` if it exists
- identify risks
- identify missing decisions
- decide what can be done without human input

Then continue from the next safe phase/task.

Proceed phase by phase automatically.

After every meaningful change or phase:

- run lint
- run typecheck
- run tests if available
- run build
- fix errors
- create/update checkpoint and handoff docs:
  - `docs/CURRENT_STATUS.md`
  - `docs/NEXT_STEPS.md`
  - `docs/CHANGELOG.md`
  - `docs/RISK_LOG.md`
  - `docs/HANDOFF_LOG.md`
- commit stable changes if possible
- summarize what changed, what was verified, known limitations, and the next phase
- continue to the next phase automatically unless blocked

Checkpoints are save points, not stopping points.

Handoff docs are required so another Codex account can continue if this task hits rate limits or stops.

Only stop if:

- the project is complete
- credentials are required
- OAuth/account permissions are required
- paid tools are required
- public publishing permission is required
- deployment secrets are required
- destructive actions are required
- permanent brand decisions are required
- legal/copyright uncertainty needs human decision
- a risky database/security/publishing/provider migration needs approval
- verification fails and cannot be fixed safely
- you need a human decision

Do not ask me for small implementation choices. Make professional decisions yourself.

Use minimal-cost local/free/open-source tools by default.

Keep safe defaults:

- public publishing disabled
- paid tools disabled
- browser automation disabled
- human approval required
- no secrets exposed
- no fake integrations

Do not access monetization/payment settings.

Make the UI premium, smooth, simple, secure, user-friendly, and future-proof.

Folqen must be built as a modular platform using provider adapters, service interfaces, feature flags, versioned prompts/settings, and plugin-style integrations so future AI tools and social platforms can be added later without rebuilding the whole app.

Folqen must include a Self-Improvement Research Agent that researches improvements automatically but never executes upgrades without human approval.

If you reach a blocker, create a safe checkpoint and clearly tell me:

1. what is blocked
2. why it is blocked
3. what decision or permission is needed
4. what has already been completed
5. whether the project is safe to stop
6. how another Codex account can continue from the handoff docs

If I say “pause”, “stop”, “break”, “save point”, or “checkpoint”, immediately create a safe checkpoint and tell me whether the project is safe to stop.

Begin now and continue until blocked or complete.
