# FullStack Dashboard

FullStack is the primary operator UI for the `fs-ai` platform. Arkham is treated as a
sidecar runtime, not as the main product identity.

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
