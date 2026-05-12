# Governance, Approval and Safety Control Layer

## Purpose

Folqen's Governance layer is the execution control department for the autonomous creator organization. It evaluates whether agents, workflows, providers, queues, media renderers, platform operations, paid tools, and publishing-adjacent actions are allowed, blocked, approval-gated, or sandbox-only.

This layer does not make dangerous actions live. It creates policy decisions, approval records, audit logs, incidents/escalations, queue metadata, and sandbox simulations so future live providers have a central safety gate to call before execution.

## Runtime Shape

```text
Department service / UI action
  -> Governance policy engine
  -> approval checkpoint if needed
  -> audit/event log
  -> governance/sandbox queue metadata
  -> blocked, needs approval, sandbox only, or allowed decision
```

## Core Systems

- Approval Workflow System
- Role & Permission System
- Execution Policy Engine
- Safety Enforcement Layer
- Audit Logging System
- Incident Escalation System
- Cost Governance Layer
- Provider Access Governance
- Sandbox Execution Layer
- Compliance Monitoring Layer

## Policy Actions

The policy engine currently evaluates:

- Public publishing
- Provider execution
- Live workflow execution
- Account access
- Automation triggers
- Media rendering
- Paid tools
- Provider activation
- Queue live mode
- Retry execution
- Sandbox tests

Dangerous actions default to `Blocked` or `Needs approval`. Sandbox tests remain mock-safe and isolated.

## Approval Actions

Governance approval actions support:

- `approve`
- `reject`
- `escalate`
- `retry`
- `revoke`

These actions update approval/audit/event records and queue metadata only. They do not publish, activate providers, run n8n, use paid tools, access accounts, render media, or execute workflows.

## Role Matrix

The governance registry defines operational roles:

- `EXECUTIVE`
- `DEPARTMENT_MANAGER`
- `OPERATOR`
- `WORKER`
- `VIEWER`
- `SYSTEM`

The current app maps real users into the existing `ADMIN`, `OPERATOR`, and `VIEWER` roles at the API access layer. Executive/department/worker roles are governance-planning roles for future agent and organizational permissions.

## Queues

The orchestration queue registry now includes:

- `folqen.governance`
- `folqen.sandbox`

When Redis/BullMQ live mode is disabled, queue jobs return mock metadata. Live queue processing remains blocked unless explicit environment flags and worker setup are added in a future approved phase.

## Persistence

No schema migration was added.

The layer uses existing models:

- `Approval` for human decision gates.
- `AuditLog` for governance decisions and approval actions.
- `EventLog` for policy, escalation, and sandbox events.
- Existing queue metadata for mock-safe execution tracking.

Cost governance, role matrix, provider governance, and execution controls are currently typed read models. Future normalized tables can be added after approval if this becomes a production compliance workflow.

## APIs

- `GET /api/governance/overview`
- `POST /api/governance/policy/evaluate`
- `POST /api/governance/approvals/request`
- `POST /api/governance/approvals/action`
- `POST /api/governance/sandbox`

All mutations require authentication, admin/operator permission, Folqen mutation marker, same-origin/rate-limit guard, Zod validation, and audit/event logging.

## Frontend Integration

The `/approvals` page now includes a Governance Department panel:

- execution policy simulator
- approval request action
- sandbox test action
- approval queue visibility
- cost governance
- provider governance
- compliance monitor
- role and permission matrix

## Safety Boundary

Approval and policy infrastructure are not equivalent to live permission to execute.

Future provider, publishing, workflow, media, and account adapters must call the policy engine immediately before execution and must still verify:

- environment flags
- explicit approval state
- role permission
- budget limits
- retry limits
- queue limits
- provider capability
- content safety
- copyright status
- review status
- audit logging
- rollback/recovery path

No future service should treat approval existence alone as enough to execute a dangerous action.
