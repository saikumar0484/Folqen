# Folqen 2-Day Launch Plan

## Goal

Make Folqen usable for the creator's channel from day 3 as a protected production MVP.

This does not mean unsafe full automation. Day-3 usage means the creator can log in, plan content, ask the agent for safe drafts, create manual posting packages, review approvals, track files, and prepare channel work while public publishing, paid tools, browser automation, and real provider execution stay approval-gated.

## Day 1 Focus

- Verify live app, database health, login, and dashboard speed.
- Rotate the default admin password through `/settings`.
- Keep or rotate/delete the temporary viewer account after human approval.
- Improve channel workflow: draft package creation, manual package copy/download, approval queue, audit visibility, and day-3 checklist.
- Keep all unconfigured providers labeled `Not connected`.

## Day 2 Focus

- Configure only the secrets the human is ready to provide:
  - Google Drive OAuth values and private folder id.
  - OpenAI API key.
  - Oracle n8n instance/webhook URL and shared secret.
- Test each provider in this order: health/readiness check, one small safe test, audit log, rollback note.
- Do not enable public publishing, paid tools, media rendering, or workflow execution until the relevant approval gate passes.

## Day 3 Usage Mode

Use Folqen for:

- Urban legend topic planning.
- Script and hook drafting.
- Caption, hashtags, and metadata preparation.
- Manual YouTube/Instagram/Facebook posting package creation.
- Approval tracking before public use.
- Audit trail and error visibility.

Do not use Folqen yet for:

- Automatic public publishing.
- Paid AI/media execution without approval.
- Platform OAuth posting.
- Browser automation.
- Real video rendering unless the worker is configured and tested.

## Required Human Inputs

- New admin password, entered through `/settings`.
- Decision: rotate/delete temporary viewer account.
- Google Drive OAuth credentials and folder id if Drive storage should go live.
- OpenAI API key and explicit paid-tool approval if real model calls should go live.
- n8n instance URL, webhook URL, and shared secret if Oracle n8n should be tested.
- Local/Oracle media worker endpoint and shared secret if rendering should be tested.

## Success Definition

Folqen is day-3 ready when:

- Live health is `ok` and database is `live`.
- Admin password is no longer the seed password.
- The creator can log in and create at least one draft package.
- The creator can create/download/copy a manual posting package.
- Approvals and audit logs show the work.
- Every unconfigured provider still says `Not connected`.
- No public publishing, paid tools, or browser automation are accidentally enabled.
