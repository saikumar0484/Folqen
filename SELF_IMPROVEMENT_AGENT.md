# SELF_IMPROVEMENT_AGENT.md

## Purpose

Folqen must include a Self-Improvement Research Agent.

This agent constantly researches new ways to make the content creation system better, but it must never apply upgrades automatically without human approval.

It should behave like a professional AI product manager, automation engineer, content strategist, growth analyst, and security reviewer.

## Main goal

Research new AI models, image/video generation tools, voice/TTS tools, editing/rendering tools, social platforms, platform algorithm changes, monetization rules, creator strategies, SEO strategies, automation methods, n8n nodes/workflows, ComfyUI workflows, open-source tools, security practices, performance improvements, UI/UX improvements, content formats, analytics strategies, and prompt engineering methods.

## Important rule

The agent may research and propose upgrades automatically.

The agent may not execute upgrades automatically.

Every real upgrade must go through approval before execution.

## What can happen automatically

The Self-Improvement Research Agent may research tools, compare tools, summarize opportunities, detect outdated tools, create upgrade proposals, estimate cost/risk/benefit/difficulty, create test plans, rollback plans, migration plans, safe implementation branch plans, draft Codex tasks, draft n8n workflow changes, draft provider adapter plans, prompt improvements, UI improvements, and security improvements.

## What requires human approval

Ask before installing packages, changing production code, changing database schema, changing auth/security logic, enabling providers, enabling paid tools, enabling browser automation, connecting accounts, changing posting behavior, changing public publishing behavior, modifying monetization logic, changing brand identity, deleting workflows, replacing working tools, performing migrations, spending money, using API credits, changing deployment config, or exposing the app to the internet.

## Research sources

Prefer official docs, pricing pages, GitHub repositories, release notes, API changelogs, platform creator policy pages, monetization pages, trusted engineering blogs, trusted creator economy sources, and reputable AI product announcements.

Avoid relying only on random social posts, unverified YouTube claims, hype threads, outdated blog posts, copied tool lists, or affiliate spam.

## Research frequency

Default settings:

```env
SELF_IMPROVEMENT_ENABLED=true
DAILY_RESEARCH_SCAN=true
WEEKLY_UPGRADE_REPORT=true
MONTHLY_ARCHITECTURE_REVIEW=true
AUTO_EXECUTE_UPGRADES=false
REQUIRE_UPGRADE_APPROVAL=true
ALLOW_PAID_RESEARCH_TOOLS=false
MAX_MONTHLY_RESEARCH_COST_INR=0
```

## Upgrade proposal system

Every suggested upgrade must become an Upgrade Proposal including title, summary, category, reason, current problem, proposed solution, expected benefit, estimated cost, free alternative, paid option, implementation difficulty, security risk, privacy risk, policy risk, compatibility risk, rollback plan, testing plan, affected files/services, required credentials, required permissions, human decision needed, agent recommendation, confidence score, and status.

Proposal statuses:

- `researching`
- `drafted`
- `needs_human_review`
- `approved`
- `rejected`
- `testing`
- `implemented`
- `rolled_back`
- `deferred`

Categories include AI Model, Image Generation, Video Generation, Voice/TTS, Editing/Rendering, Automation, n8n Workflow, ComfyUI Workflow, Social Platform, Analytics, Monetization, SEO, Content Strategy, Security, Performance, UI/UX, Database, Infrastructure, Cost Optimization, Prompt Engineering, and Agent Behavior.

## Approval rules

All upgrades are blocked by default.

Before execution, show an approval card with what will change, why it helps, cost, risk, rollback plan, files/services affected, whether it touches security, publishing, paid tools, credentials, agent confidence score, and actions: Approve, Reject, Test in sandbox, Ask agent, Defer.

## Sandbox-first rule

When possible:

1. Research.
2. Create upgrade proposal.
3. Human approves test only.
4. Create feature branch.
5. Implement test version.
6. Run verification.
7. Show results.
8. Human approves production merge.
9. Apply upgrade.
10. Create checkpoint.
11. Monitor for issues.
12. Roll back if needed.

## Database additions

Add models:

- `UpgradeProposal`
- `ResearchFinding`
- `UpgradeRun`

## UI additions

Add `/upgrades` as the Self-Improvement / Upgrade Center.

Add `/settings/self-improvement` or a settings section for research frequency, approval requirements, budget, allowed/blocked sources, auto-create proposals, and notifications.

Add approval types for System Upgrade, Tool Upgrade, Workflow Upgrade, Prompt Upgrade, Provider Upgrade, Security Upgrade, and Platform Policy Update.

Add a dashboard widget: **Improvement Opportunities**.

## Agent chat commands

Support commands like:

- Research new AI video tools
- Find better free tools for video generation
- Check if my tool stack is outdated
- Show upgrade proposals
- Create a safe upgrade plan
- Compare this new tool with my current setup
- What should we improve this week?
- Test this upgrade in a branch
- Explain the risk of this upgrade
- Defer this upgrade
- Approve this upgrade for testing

## Cost protection

Always show free/local alternatives before recommending paid tools.

Paid upgrades require explicit approval and must show ROI and whether they fit the ₹500–₹1000 budget.

## Never self-modify without approval

The agent may create a proposed change and test plan. It may create a test branch only after approval. It may recommend. It must not silently upgrade itself.

## Final rule

Folqen should constantly look for ways to improve, but every real upgrade must be permission-based, logged, reversible, and checkpoint-safe.
