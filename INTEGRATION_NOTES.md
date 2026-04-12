# INTEGRATION_NOTES

## fs-ai endpoint mapping

`robs46859-eng/fs-ai` now exposes a real backend contract for the prepared FullStack admin surfaces. Canonical routes live under `/api/v1/*`, with compatibility aliases under `/api/*` and top-level probes at `/health` and `/ready`.

## Fully live in fsdash

- Public FullStack landing page at `/`
- Access/session gate at `/access`
- Auth-aware app routing under `/app/*`
- Env-driven platform adapter layer in `src/lib/runtime.ts` and `src/lib/platform.ts`
- Live platform health probe support via `/health` and `/ready`
- Live Arkham sidecar probe support when `VITE_ARKHAM_SIDECAR_*` variables are configured
- Honest unsupported/error/unauthorized/empty states for backend-dependent surfaces when routes are missing or auth is not present

## Backend surfaces now available

- Tenants
- API Keys
- Usage and Billing
- Providers and Routing
- Cache and Performance
- Requests, Logs, and Traces
- Security, Policy, and PII
- Settings

These surfaces are now backed by `fs-ai` and can be bound through the existing env variables:

- `VITE_FULLSTACK_TENANTS_PATH=/api/v1/tenants`
- `VITE_FULLSTACK_API_KEYS_PATH=/api/v1/api-keys`
- `VITE_FULLSTACK_USAGE_BILLING_PATH=/api/v1/usage-billing`
- `VITE_FULLSTACK_PROVIDERS_ROUTING_PATH=/api/v1/providers-routing`
- `VITE_FULLSTACK_CACHE_PERFORMANCE_PATH=/api/v1/cache-performance`
- `VITE_FULLSTACK_REQUESTS_LOGS_TRACES_PATH=/api/v1/requests-logs-traces`
- `VITE_FULLSTACK_SECURITY_POLICY_PATH=/api/v1/security-policy`
- `VITE_FULLSTACK_SETTINGS_PATH=/api/v1/settings`

## Marketing Studio note

`fs-ai` exposes separate Marketing Studio routes and `fsdash` now uses them directly for:

- generator metadata
- draft generation
- draft/version persistence
- draft history loading
- export action logging
- marketing economics rollups

The prompt orchestration layer remains frontend-local, but storage has moved out of `storage.ts` and into the backend’s isolated marketing module.

## Required environment variables

- `VITE_FULLSTACK_PUBLIC_BASE_URL`
- `VITE_FULLSTACK_APP_BASE_PATH`
- `VITE_FULLSTACK_API_BASE_URL`
- `VITE_FULLSTACK_AUTH_MODE`
- `VITE_FULLSTACK_TRUST_UPSTREAM_AUTH`
- `VITE_FULLSTACK_SESSION_PROBE_PATH`
- `VITE_FULLSTACK_LOGIN_URL`
- `VITE_FULLSTACK_SIGNUP_URL`
- `VITE_FULLSTACK_DEMO_REQUEST_URL`
- `VITE_FULLSTACK_OPERATOR_ACCESS_URL`
- `VITE_FULLSTACK_DEPLOYMENT_DOCS_URL`
- `VITE_FULLSTACK_HEALTH_PATH`
- `VITE_FULLSTACK_READINESS_PATH`
- `VITE_FULLSTACK_TENANTS_PATH`
- `VITE_FULLSTACK_API_KEYS_PATH`
- `VITE_FULLSTACK_USAGE_BILLING_PATH`
- `VITE_FULLSTACK_PROVIDERS_ROUTING_PATH`
- `VITE_FULLSTACK_CACHE_PERFORMANCE_PATH`
- `VITE_FULLSTACK_REQUESTS_LOGS_TRACES_PATH`
- `VITE_FULLSTACK_SECURITY_POLICY_PATH`
- `VITE_FULLSTACK_SETTINGS_PATH`
- `VITE_ARKHAM_SIDECAR_ENABLED`
- `VITE_ARKHAM_SIDECAR_BASE_URL`
- `VITE_ARKHAM_SIDECAR_HEALTH_PATH`
