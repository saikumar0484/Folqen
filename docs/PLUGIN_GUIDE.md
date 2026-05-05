# Plugin Guide

Folqen plugins should extend providers, workflows, content formats, prompts, analytics, or publishing fallbacks without rewriting the app shell.

## Plugin Rules

- Do not bypass safety guards.
- Do not expose secrets to client components.
- Do not mark a provider live until it is tested.
- Prefer manual fallback packages when APIs are unavailable.
- Add audit events for sensitive plugin actions.
- Add rollback notes for risky plugin upgrades.

## Suggested Plugin Shape

```ts
type FolqenPlugin = {
  id: string;
  name: string;
  version: string;
  providers: string[];
  requiredEnv: string[];
  requiredApprovals: string[];
  setupGuide: string;
};
```

Plugins that touch credentials, paid tools, public publishing, browser automation, security settings, or database migrations require human approval before activation.
