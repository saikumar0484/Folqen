# Route Map

All required MVP routes exist as Phase 2 placeholders under the app shell.

| Route | Purpose | Current State |
| --- | --- | --- |
| `/dashboard` | Command overview | Mock |
| `/agent` | Full agent chat | Mock |
| `/calendar` | Content calendar | Mock |
| `/pipeline` | Content workflow pipeline | Mock |
| `/library` | Content and asset library | Mock |
| `/approvals` | Human approval center | Needs approval |
| `/platforms` | Social platform manager | Not connected |
| `/tools` | Tool registry and limits | Not connected |
| `/settings` | Safe system settings | Configured shell |
| `/analytics` | Performance analytics | Mock |
| `/monetization` | Monetization readiness | Needs approval |
| `/brand` | Brand controls | Mock |
| `/errors` | Error and recovery center | Mock |
| `/audit` | Audit trail | Mock |
| `/workflows` | n8n/workflow hub | Not connected |
| `/files` | File manager | Mock |
| `/notifications` | Signal center | Mock |
| `/upgrades` | Self-improvement proposals | Needs approval |

The public landing page remains at `/`.

## API Routes

| Route | Purpose | Current State |
| --- | --- | --- |
| `GET /api/health` | App, safety, and integration status | Dynamic status |
| `GET /api/integrations/status` | Database, Vercel, worker, n8n, ComfyUI, and FFmpeg status | Dynamic status |
| `POST /api/integrations/n8n/test` | Sends a safe connection-test event to configured n8n webhook | Not connected until env is configured |
| `GET /login` | Secure login screen | Live, waits for database |
| `POST /api/auth/login` | Password login and session cookie creation | Requires database |
| `POST /api/auth/logout` | Clears session cookie | Live |
| `GET /api/auth/me` | Returns current authenticated user | Requires session and database |
