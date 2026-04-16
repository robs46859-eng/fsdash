# Env Automation

This project treats environment management as a versioned system instead of a loose `.env` file convention.

## Files

- `env.schema.json`
  - source of truth for required variables, defaults, sensitivity, and Render sync eligibility
- `scripts/validate-env.js`
  - validates schema shape or a concrete environment payload
- `scripts/sync-render-env.js`
  - validates an environment payload and pushes it to Render through the Render API
- `.github/workflows/validate-env-schema.yml`
  - validates the schema on push and pull request
- `.github/workflows/render-env-sync.yml`
  - branch-guarded Render sync workflow using GitHub Environment secrets and vars

## Local usage

Validate the schema only:

```bash
npm run env:schema
```

Validate real values from your shell:

```bash
VITE_FULLSTACK_API_BASE_URL=https://staging-api.fullstack.arkhamprison.com \
npm run env:validate -- --env staging
```

Validate values from a file:

```bash
npm run env:validate -- --env local --file .env --allow-missing-secrets
```

Dry-run a Render sync:

```bash
RENDER_API_KEY=rnd_... \
RENDER_SERVICE_ID=srv-... \
npm run env:sync:render -- --env staging --dry-run
```

## GitHub Actions model

The `render-env-sync.yml` workflow expects GitHub Environments named `staging` and `production`.

Automation model:

- pushes to `main` automatically sync `staging`
- manual dispatch from `main` can sync either `staging` or `production`
- the workflow hard-fails if triggered from any ref other than `main`

### GitHub Environment secrets

Set these as secrets in each GitHub Environment:

- `RENDER_API_KEY`
- `RENDER_SERVICE_ID`

### GitHub Environment vars

Set these as GitHub Environment vars when you want to override schema defaults:

- `PORT`
- `VITE_FULLSTACK_PUBLIC_BASE_URL`
- `VITE_FULLSTACK_APP_BASE_PATH`
- `VITE_FULLSTACK_API_BASE_URL`
- `VITE_FULLSTACK_AUTH_MODE`
- `VITE_FULLSTACK_TRUST_UPSTREAM_AUTH`
- `VITE_FULLSTACK_SESSION_PROBE_PATH`
- `VITE_ARKHAM_SIDECAR_ENABLED`
- `VITE_ARKHAM_SIDECAR_BASE_URL`
- `VITE_ARKHAM_SIDECAR_HEALTH_PATH`

If an environment var is omitted, the schema default is used.

## Note on VITE_ variables

All `VITE_FULLSTACK_*` and `VITE_ARKHAM_*` variables are **build-time** — Vite inlines them into the JS bundle during `npm run build`. They must be present in the Render environment and set correctly before a build is triggered.

## Note on fs-ai pairing

fsdash is the frontend half of the FullStack platform. The `VITE_FULLSTACK_API_BASE_URL` variable must point at the correct fs-ai instance for the target environment. The fs-ai repo has its own `env.schema.json` and matching workflows.

## Operational pattern

1. Update `env.schema.json` when the application gains a new variable.
2. Add or rotate the corresponding GitHub Environment var.
3. Merge to `main` to keep `staging` synced automatically.
4. For production, run `Sync Render Environment` manually from `main`.
5. Use `dry_run = true` first when changing production config.
6. Run it again with `dry_run = false`.
7. Deploy the service after the sync completes.
