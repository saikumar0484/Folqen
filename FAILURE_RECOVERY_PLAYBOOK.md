# FAILURE_RECOVERY_PLAYBOOK.md

## Purpose

This file exists because Folqen is a large, long-running project and many things can fail.

Codex must actively prevent failures, detect them early, document them clearly, and prepare recovery paths before risky work begins.

The project should never depend on luck.

---

## Core rule

Before every major phase, Codex must ask:

> How can this phase fail, and what is the recovery plan?

For every risky area, Codex must prepare:

- likely failure modes
- early warning signs
- prevention steps
- verification steps
- rollback plan
- backup plan
- human intervention trigger

---

## Failure categories

Codex must consider these failure categories:

1. Repo and Git failures
2. Codex/cloud/rate-limit failures
3. Dependency/package failures
4. Build/typecheck/test failures
5. UI/UX failures
6. Authentication/security failures
7. Database/migration failures
8. File upload/storage failures
9. Provider/plugin architecture failures
10. n8n/workflow failures
11. ComfyUI/FFmpeg/local tool failures
12. Social platform/API failures
13. Publishing/approval failures
14. AI agent behavior failures
15. Self-improvement/upgrade failures
16. Cost/budget failures
17. Legal/copyright/platform policy failures
18. Deployment/hosting failures
19. Performance/scaling failures
20. Human handoff/resume failures
21. Data loss failures
22. Secret leakage failures
23. Monetization strategy failures
24. Content quality failures
25. Long-term maintainability failures

---

## 1. Repo and Git failures

### Possible failures

- Wrong repo selected.
- Work happens on wrong branch.
- Conflicting commits from another Codex account.
- Large uncommitted changes are lost.
- Bad commit breaks main branch.
- Instruction files get overwritten.

### Prevention

- Always confirm repo is `saikumar0484/Folqen`.
- Read `HANDOFF_RULES.md` before work.
- Check current branch and recent commits.
- Work in small stable commits.
- Avoid giant uncommitted rewrites.
- Keep instructions in root files.

### Recovery

- Read `docs/HANDOFF_LOG.md`.
- Use Git history to identify last safe commit.
- Revert bad changes if needed.
- Restore root instruction files from latest good commit.
- Continue from `docs/NEXT_STEPS.md`.

---

## 2. Codex/cloud/rate-limit failures

### Possible failures

- Codex task stops due to limits.
- Codex task times out.
- Codex loses context.
- Another account must continue.
- Codex cannot run long builds.

### Prevention

- Use checkpoints after every meaningful change.
- Update `docs/HANDOFF_LOG.md` frequently.
- Keep phases small enough to finish.
- Commit stable changes often.
- Do not rely on chat memory.

### Recovery

- Start new Codex task/account.
- Use command from `HANDOFF_RULES.md`.
- Read all checkpoint files.
- Verify build state.
- Continue from next safe task.

---

## 3. Dependency/package failures

### Possible failures

- Package install fails.
- Peer dependency conflicts.
- shadcn/ui setup breaks.
- Prisma/Auth.js/Next.js version mismatch.
- Package becomes deprecated.

### Prevention

- Prefer stable versions.
- Avoid unnecessary packages.
- Document why each package is installed.
- Keep package manager consistent.
- Run install/build after dependency changes.

### Recovery

- Revert last package change.
- Use stable package versions.
- Replace optional package with simpler implementation.
- Document issue in `docs/RISK_LOG.md`.

---

## 4. Build/typecheck/test failures

### Possible failures

- TypeScript errors.
- Broken imports.
- Missing env variables.
- Server/client component mistakes.
- Prisma generation errors.
- Test runner missing or failing.

### Prevention

- Run lint/typecheck/build after every phase.
- Add scripts if missing.
- Keep components small.
- Do not leave broken imports.

### Recovery

- Fix errors immediately.
- Revert unstable change if fix is not obvious.
- Add known limitation to checkpoint docs.
- Do not continue if app cannot build unless clearly isolated.

---

## 5. UI/UX failures

### Possible failures

- App looks basic or inconsistent.
- Pages are cluttered.
- Mobile layout breaks.
- Mini chat blocks important UI.
- Too many features overwhelm the user.

### Prevention

- Use reusable components.
- Keep dark-mode-first design.
- Use consistent spacing, cards, badges, states.
- Add loading, empty, and error states.
- Test responsive layouts.

### Recovery

- Refactor into shared design system.
- Simplify pages.
- Add UI polish phase.
- Create screenshots/review notes if possible.

---

## 6. Authentication/security failures

### Possible failures

- Routes are not protected.
- Sessions are insecure.
- Password hashing is weak/missing.
- Viewer can approve dangerous actions.
- Secrets are exposed to frontend.
- Security headers missing.

### Prevention

- Default all protected routes behind auth.
- Use role checks.
- Keep secrets server-side only.
- Add audit logs for critical actions.
- Add security tests where practical.

### Recovery

- Disable risky actions.
- Force protected routes.
- Rotate leaked secrets if any.
- Update `SECURITY.md` and `docs/RISK_LOG.md`.
- Stop and ask human if real secret exposure occurred.

---

## 7. Database/migration failures

### Possible failures

- Prisma schema invalid.
- Migration breaks existing data.
- Seed fails.
- JSON fields become inconsistent.
- Future provider schema is too rigid.

### Prevention

- Create checkpoint before migrations.
- Use flexible JSON fields for provider/platform metadata.
- Keep required fields minimal.
- Run prisma format/generate/migrate/seed.

### Recovery

- Revert bad migration.
- Restore last safe schema.
- Add migration notes.
- Use optional fields instead of destructive schema changes.

---

## 8. File upload/storage failures

### Possible failures

- Unsafe file types accepted.
- Oversized uploads crash app.
- Path traversal vulnerability.
- Storage fills up.
- Files are publicly exposed accidentally.

### Prevention

- Validate MIME and extension.
- Limit file size.
- Sanitize filenames.
- Store files outside public path unless intentionally public.
- Add audit logs.
- Add storage usage indicators.

### Recovery

- Disable uploads temporarily.
- Remove unsafe files.
- Add stronger validation.
- Document storage cleanup plan.

---

## 9. Provider/plugin architecture failures

### Possible failures

- App becomes hardcoded to one provider.
- Provider registry becomes too complex.
- Capabilities are not modeled correctly.
- Future tools cannot be added cleanly.

### Prevention

- Follow `FUTURE_PROOF_ARCHITECTURE.md`.
- Use interfaces and adapters.
- Select tools by capability, not name.
- Keep mock providers simple and typed.

### Recovery

- Refactor hardcoded logic into service interfaces.
- Add provider guide.
- Deprecate broken adapter safely.

---

## 10. n8n/workflow failures

### Possible failures

- n8n webhook not configured.
- Webhook secret mismatch.
- Workflow times out.
- n8n is offline.
- Workflow returns unexpected payload.

### Prevention

- Show `Not connected` by default.
- Add test connection endpoint.
- Validate webhook payloads.
- Keep manual fallback.

### Recovery

- Disable workflow trigger.
- Use manual posting/content package fallback.
- Show setup instructions.
- Log error in Error Center.

---

## 11. ComfyUI/FFmpeg/local tool failures

### Possible failures

- ComfyUI not installed.
- GPU not enough.
- FFmpeg missing.
- Render fails.
- Disk space insufficient.
- Model license unclear.

### Prevention

- Treat local tools as optional providers.
- Show setup/test status.
- Use fallback formats.
- Track tool limits and disk usage.
- Require license clarity for commercial use.

### Recovery

- Switch to still-image slideshow mode.
- Generate posting packages without render.
- Mark tool `Not connected` or `failed`.
- Ask human only if install/permission is needed.

---

## 12. Social platform/API failures

### Possible failures

- API unavailable.
- OAuth fails.
- Rate limits.
- Platform changes rules.
- Upload fails.
- Analytics unavailable.

### Prevention

- Use platform adapters.
- Show connection status.
- Use manual posting package fallback.
- Do not fake posting.
- Require approval for account connections.

### Recovery

- Create manual posting package.
- Retry only safe operations.
- Log platform error.
- Ask human for account/OAuth only when needed.

---

## 13. Publishing/approval failures

### Possible failures

- Content publishes without approval.
- Paid tool used without approval.
- Wrong content/platform selected.
- Approval state inconsistent.

### Prevention

- Implement publishing and paid-tool guards.
- Require server-side checks.
- Add tests.
- Audit every decision.

### Recovery

- Immediately disable publishing feature flag.
- Inspect audit logs.
- Revert offending code.
- Notify human.

---

## 14. AI agent behavior failures

### Possible failures

- Agent hallucinates sources.
- Agent creates low-quality scripts.
- Agent repeats content.
- Agent ignores brand rules.
- Agent claims fake legends as facts.

### Prevention

- Add research/source notes.
- Add review agent.
- Use disclaimers like “according to local legend”.
- Track content quality scores.
- Keep human approval for risky/sensitive topics.

### Recovery

- Send content back to review.
- Block publishing.
- Improve prompts through versioned prompt proposals.
- Add topic repetition checks.

---

## 15. Self-improvement/upgrade failures

### Possible failures

- Agent tries to self-modify silently.
- Bad upgrade breaks app.
- Paid upgrade exceeds budget.
- Upgrade introduces security risk.

### Prevention

- Research allowed; execution blocked by default.
- Upgrade proposals require approvals.
- Include rollback/testing plans.
- Use sandbox branch first.

### Recovery

- Reject or roll back upgrade.
- Restore previous prompt/provider version.
- Document in `docs/RISK_LOG.md`.

---

## 16. Cost/budget failures

### Possible failures

- Paid tools accidentally enabled.
- API usage grows unexpectedly.
- Hosting/database costs exceed budget.
- Cloud generation credits are consumed.

### Prevention

- Paid tools disabled by default.
- Budget settings.
- Cost fields in provider registry.
- Free/local-first defaults.
- Upgrade approvals show cost.

### Recovery

- Disable paid providers.
- Switch to local/free tools.
- Reduce generation frequency.
- Use manual posting packages.

---

## 17. Legal/copyright/platform policy failures

### Possible failures

- Copyrighted stories used.
- Unsafe AI disclosure practices.
- Reused/low-effort content hurts monetization.
- Platform policy changes.

### Prevention

- Safety/copyright review agent.
- Source notes.
- Transformative commentary.
- AI disclosure settings.
- Platform policy monitoring via Self-Improvement Agent.

### Recovery

- Block risky content.
- Rewrite with public-domain/folklore sources.
- Ask human for policy/legal uncertainty.
- Update prompts and rules.

---

## 18. Deployment/hosting failures

### Possible failures

- Environment variables missing.
- Build works locally but not on host.
- Database not reachable.
- File storage not persistent.
- Domain/DNS issues.

### Prevention

- Add deployment checklist.
- Use `.env.example`.
- Add health route.
- Add production Docker docs.
- Keep deployment secrets out of repo.

### Recovery

- Roll back deployment.
- Check logs.
- Verify env vars.
- Use local run until stable.

---

## 19. Performance/scaling failures

### Possible failures

- Dashboard slow.
- Large files slow app.
- Render jobs block server.
- Database queries inefficient.

### Prevention

- Separate render/job workers.
- Paginate large lists.
- Avoid loading huge files in UI.
- Use background jobs where needed.

### Recovery

- Disable heavy features.
- Add queues/workers.
- Add pagination and indexes.
- Archive old renders.

---

## 20. Human handoff/resume failures

### Possible failures

- New Codex account cannot understand current state.
- Checkpoint docs are outdated.
- Next steps unclear.
- Human does not know what is blocked.

### Prevention

- Follow `HANDOFF_RULES.md`.
- Update `docs/HANDOFF_LOG.md` often.
- Keep instructions in repo.
- Add exact resume command.

### Recovery

- Reconstruct status from Git history.
- Run verification.
- Update handoff docs.
- Continue from last safe phase.

---

## 21. Data loss failures

### Possible failures

- Generated assets deleted.
- Database wiped.
- Uploads lost.
- Wrong cleanup deletes important files.

### Prevention

- Archive/delete confirmation.
- Backup docs.
- Avoid destructive cleanup by default.
- Track assets in database.

### Recovery

- Restore from backup if available.
- Regenerate assets if possible.
- Log lost items.
- Ask human before destructive recovery.

---

## 22. Secret leakage failures

### Possible failures

- API key committed.
- Secret shown in UI.
- Logs expose tokens.
- Upload contains secrets.

### Prevention

- Never commit `.env`.
- Mask secret fields.
- Avoid logging secrets.
- Add `.gitignore`.
- Validate uploaded files metadata carefully.

### Recovery

- Stop and alert human.
- Rotate exposed secret.
- Remove secret from repo history if needed.
- Add test/check to prevent repeat.

---

## 23. Monetization strategy failures

### Possible failures

- Content does not grow.
- Shorts do not convert to subscribers.
- Long-form watch time too low.
- Reused-content risk.

### Prevention

- Use analytics feedback loop.
- Create original commentary.
- Use long-form plus Shorts strategy.
- Track retention, CTR, and topic performance.

### Recovery

- Improve hooks, thumbnails, topics.
- Shift to better-performing formats.
- Create upgrade proposals for strategy changes.

---

## 24. Content quality failures

### Possible failures

- Bad voiceover.
- Weak visuals.
- Poor captions.
- Repetitive scripts.
- Inaccurate legends.

### Prevention

- Review agent.
- Quality scoring.
- Script templates.
- Source notes.
- Platform-specific formatting.

### Recovery

- Block draft.
- Regenerate problematic part.
- Use simpler fallback production style.

---

## 25. Long-term maintainability failures

### Possible failures

- Code becomes too complex.
- Providers are hard to add.
- Docs fall behind.
- Tests missing.

### Prevention

- Use interfaces/adapters.
- Keep docs updated.
- Add tests for guards.
- Prefer simple architecture first.

### Recovery

- Refactor by module.
- Add documentation.
- Add provider/plugin guide.
- Deprecate old code gradually.

---

## Required Codex behavior before risky phases

Before risky phases, Codex must create a short failure-prevention note in `docs/RISK_LOG.md`:

```md
## Pre-phase failure review

Phase:
Possible failures:
Prevention:
Verification:
Rollback:
Human approval needed:
```

---

## Required Codex behavior when failure happens

When failure happens:

1. Stop expanding scope.
2. Identify exact failure.
3. Check whether it is safe to fix automatically.
4. If safe, fix and verify.
5. If unsafe, create checkpoint and ask human.
6. Update `docs/RISK_LOG.md` and `docs/HANDOFF_LOG.md`.
7. Do not hide the failure.

---

## Final rule

Folqen should be built with failure expected, not ignored.

Every serious failure must have a documented solution, fallback, rollback, or human-decision path.
