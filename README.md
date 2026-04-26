# FullStack Dashboard

FullStack is the primary operator UI for the `fs-ai` platform. Arkham is treated as a
sidecar runtime, not as the main product identity.

## Multi-Product Architecture & Domain Switching

This repository serves multiple product identities from a single deployment:

### App Selector
The `src/main.tsx` file includes an `AppSelector` that detects the current hostname:
- **StelarAI**: Hostnames ending in `stelarai.tech`, `solamaze.com`, or `getsemu.com` load the `StelaraiApp`.
- **FullStack Admin**: All other hostnames (e.g., `fsai.pro`) load the standard `AdminApp`.

### StelarAI Workspace
The StelarAI application lives in `src/apps/stelarai/` and provides a dedicated workspace shell for customers, including:
- **Canvas Builder**: Workflow authoring.
- **Intelligence Modules**: Predictive Niche (Digital IT Girl), Software Tracker (Public Beta).
- **Automation**: Industry Automation (AutoPitch).
- **Connections**: Account and source management.

## Local development

1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env.local` and set the platform and sidecar URLs you actually have
3. Run the app with `npm run dev`

The app serves a public landing page at `/`, an access gate at `/access`, and the operator
dashboard at `/app/*`.

## Deployment notes

See:

- `INTEGRATION_NOTES.md`
- `DEPLOYMENT_NOTES.md`
- `SIDECAR_NOTES.md`
