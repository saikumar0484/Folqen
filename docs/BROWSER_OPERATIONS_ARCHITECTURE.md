# Browser Operations Department

## Purpose

Browser Operations is Folqen's governed web-interaction department. It prepares the system for future Playwright-driven observation while staying dry-run only in this slice.

```text
Folqen Agent
  -> Browser Operations Layer
  -> Playwright Controller
  -> Isolated Browser Session Plan
  -> Governed Web Interaction Trace
```

## Current Capability

- Browser Session Manager: creates dry-run session records with target URL, domain policy status, health, and redacted screenshot placeholder.
- Browser Workflow Engine: validates workflows for page observation, DOM inspection, structured extraction, screenshot audit, and safe navigation rehearsal.
- Browser Queue System: uses `folqen.browser` and `folqen.browser.trace` through the existing BullMQ adapter. In preview/default mode these return mock queue metadata.
- Browser Governance Layer: enforces sandbox mode, dry-run-only execution, allow/blocked domain lists, approval requirement, timeout limits, and kill switch.
- Browser Observation System: produces simulated observations and structured extraction placeholders without contacting websites.
- Browser Action Validation: validates open, navigate, click, type, scroll, upload, screenshot, DOM inspection, and extraction actions.
- Browser Audit Logging: records session/workflow/control actions through existing `AuditLog` when a database is configured.
- Browser Quarantine System: can quarantine a session or rollback all Browser Operations state to dry-run.
- Browser Recovery System: records recovery controls without launching automation.
- Browser Trace Observability: stores in-memory recent runs and exposes them through `/api/browser-ops/overview`.

## Public Interfaces

- `GET /api/browser-ops/overview`
- `POST /api/browser-ops/session`
- `POST /api/browser-ops/workflow`
- `POST /api/browser-ops/control`
- `/browser-operations`

All mutations require authentication, admin/operator permission, same-origin and Folqen mutation-header checks, and rate limits.

## Safety State

- No Playwright browser process is launched.
- No website is contacted.
- No cookies or account sessions are used.
- No scraping, uploads, form submissions, credential entry, browser extension use, or platform automation occurs.
- Secret-like typed values are masked and blocked.
- File upload actions are blocked in preview.
- `ALLOW_BROWSER_AUTOMATION=false` remains mandatory.

## Future Activation Requirements

Before live browser execution can exist, Folqen needs a separate approval-gated phase with:

- isolated browser worker service
- ephemeral sessions and storage isolation
- explicit domain allowlists per workflow
- credential/session vault policy
- screenshot artifact storage and retention policy
- legal/policy review for each target site
- queue cancellation and kill switch tests
- production incident rollback procedure

Until that phase is approved, Browser Operations is a preview/observability system only.
