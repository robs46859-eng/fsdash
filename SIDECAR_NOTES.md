# SIDECAR_NOTES

## What Arkham does in this architecture

Arkham is treated as an operational sidecar to the FullStack build. It can provide adjacent services such as security enforcement, policy execution, telemetry, or specialized runtime controls, but it is not the primary product brand and it does not own the main user-facing navigation.

## How Arkham is isolated from the FullStack core

- Main branding remains `FullStack`
- Primary routes remain `fullstack.arkhamprison.com`, `/`, `/access`, and `/app/*`
- Arkham appears only in:
  - runtime configuration
  - system health probes
  - deployment and sidecar documentation
- Arkham-specific origins are isolated through:
  - `VITE_ARKHAM_SIDECAR_BASE_URL`
  - `VITE_ARKHAM_SIDECAR_HEALTH_PATH`
  - `VITE_ARKHAM_SIDECAR_ENABLED`

## Config and services Arkham depends on

- A reachable Arkham runtime or service endpoint
- Optional sidecar health endpoint
- Network access from the frontend host or reverse proxy to the Arkham service
- If cross-origin requests are used, the same credential and CORS posture considerations as the main platform apply

## Current implementation boundary

Because `fs-ai` does not currently expose any checked-in backend integrations, the frontend only treats Arkham as a health-probed sidecar. Additional sidecar controls should be added only after:

1. A concrete backend contract exists in source control
2. The dependency is clearly operationally adjacent to FullStack
3. The UI can surface it without shifting the product identity away from FullStack
