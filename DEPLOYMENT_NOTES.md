# DEPLOYMENT_NOTES

## Target

- Public host: `fullstack.arkhamprison.com`
- Product label everywhere user-facing: `FullStack`
- Arkham visibility: operational sidecar only

## Build and run

1. Install dependencies with `npm install`
2. Configure `.env.local` or deployment environment variables
3. Build with `npm run build`
4. Serve the compiled app with `NODE_ENV=production node server.ts` or package the `dist/` output behind your preferred web runtime

## Expected API base URL handling

- Use `VITE_FULLSTACK_API_BASE_URL` when the frontend calls the platform over a different origin
- Leave `VITE_FULLSTACK_API_BASE_URL` empty when a reverse proxy exposes platform routes on the same host
- Health and readiness probes are derived from `VITE_FULLSTACK_HEALTH_PATH` and `VITE_FULLSTACK_READINESS_PATH`
- Feature surfaces read from route-specific `VITE_FULLSTACK_*_PATH` variables

## Auth and request assumptions

- If production auth is handled upstream, set:
  - `VITE_FULLSTACK_AUTH_MODE=external`
  - `VITE_FULLSTACK_TRUST_UPSTREAM_AUTH=true`
- If the frontend uses bootstrap auth for operator access, set:
  - `VITE_FULLSTACK_AUTH_MODE=external`
  - `VITE_FULLSTACK_SESSION_PROBE_PATH` to a backend route that returns `200` for an active session and `401/403` otherwise
- Operator traffic should be bearer-first:
  - `POST /api/v1/session/bootstrap` returns `bearer_token`
  - store the token in browser storage for the operator shell
  - send `Authorization: Bearer ...` on all later operator requests
  - do not rely on `fullstack_session` cookies for production smoke or operator automation
- Browser requests omit cookies once a bearer token is available
- Cross-origin deployments only require cookie support when you intentionally depend on a cookie path:
  - backend `Access-Control-Allow-Origin` matching the frontend origin
  - backend `Access-Control-Allow-Credentials: true`
  - cookies marked appropriately for the deployment topology, typically `Secure` and `SameSite=None` when crossing origins

## Reverse proxy assumptions

Recommended production shape:

- `fullstack.arkhamprison.com` serves the frontend
- Reverse proxy forwards `/api/*`, `/health`, and `/ready` to the `fs-ai` platform
- Reverse proxy can optionally forward `/sidecar/arkham/*` to the Arkham service, or Arkham can stay on its own internal origin with `VITE_ARKHAM_SIDECAR_BASE_URL`

## TLS and headers

- Enforce TLS for both frontend and backend origins
- Preserve `X-Forwarded-Proto`, `X-Forwarded-Host`, and any upstream auth headers your session model depends on
- If auth is delegated to an identity-aware proxy, ensure the protected `/app/*` routes and session probe agree on the same trust boundary

## Arkham sidecar runtime assumptions

- Arkham is not the public app identity
- Arkham may run as:
  - a sibling service on the same network
  - a sidecar container in the same pod/task
  - an internal-only service behind the same reverse proxy
- The dashboard expects at most a health endpoint from Arkham by default
- Additional Arkham-specific controls or telemetry should stay isolated to dedicated operational modules rather than leaking into primary FullStack navigation labels

## Google Cloud production hosting path

For the controlled production run, use Firebase Hosting for the SPA and rewrite backend routes to Cloud Run:

- Hosting site: `fullstack-arkhamprison-com`
- Public host: `fullstack.arkhamprison.com`
- Rewrites:
  - `/api/**` -> Cloud Run `fs-ai`
  - `/health` -> Cloud Run `fs-ai`
  - `/ready` -> Cloud Run `fs-ai`
  - `**` -> `/index.html` (SPA fallback)

Deployment artifacts:

- `firebase.json`
- `.firebaserc`
- `deploy/deploy-frontend-firebase.sh`
- `.env.production.example`

This keeps frontend and backend on one HTTPS origin and avoids cross-origin cookie/CORS complexity for the primary run. Bearer-first operator auth remains the canonical smoke and troubleshooting path even on same-origin production.

## Custom domain (Firebase Hosting)

Custom domain `fullstack.arkhamprison.com` is registered on Hosting site `fullstack-arkhamprison-com`. A **checked-in snapshot** of the Firebase Hosting API response (host/ownership/cert) lives at `deploy/firebase-custom-domain.fullstack.arkhamprison.com.json` — refresh that file after DNS changes by re-running the `curl` below.

Until DNS matches Firebase’s checks, the domain stays `HOST_UNHOSTED` / `OWNERSHIP_MISSING` and TLS stays in `CERT_VALIDATING`.

**Add these records at the DNS host for `arkhamprison.com`** (there is no Cloud DNS managed zone for this domain in project `arkham-492414`, so records cannot be created via `gcloud` here—you must add them where the domain’s nameservers are managed):

| Host / name | Type | Value |
| --- | --- | --- |
| `fullstack` | CNAME | `fullstack-arkhamprison-com.web.app` |
| `_acme-challenge.fullstack` | TXT | `7wooaEud9-q2x8HYugk470fGq3dUP4stTosEJwMR9FQ` |

If Firebase rotates the ACME TXT during provisioning, replace the TXT value with the current one from **Firebase console → Hosting → Domains → fullstack.arkhamprison.com**, or from the API field `cert.verification.dns.desired`.

After the records propagate, Firebase should move to hosted + certificate active (often ~5–30+ minutes after DNS is correct). Check status:

```bash
TOKEN=$(gcloud auth print-access-token)
curl -sS \
  "https://firebasehosting.googleapis.com/v1beta1/projects/arkham-492414/sites/fullstack-arkhamprison-com/customDomains/fullstack.arkhamprison.com" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "x-goog-user-project: arkham-492414" | jq '.hostState, .ownershipState, .cert.state'
```

Without `jq`:

```bash
TOKEN=$(gcloud auth print-access-token)
curl -sS \
  "https://firebasehosting.googleapis.com/v1beta1/projects/arkham-492414/sites/fullstack-arkhamprison-com/customDomains/fullstack.arkhamprison.com" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "x-goog-user-project: arkham-492414" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('hostState'), d.get('ownershipState'), d.get('cert',{}).get('state'))"
```

Then verify in the browser: `https://fullstack.arkhamprison.com/health` (Hosting rewrite to Cloud Run) should return **JSON with HTTP 200**.

Wait until `hostState` reflects hosting active, `ownershipState` is verified, and the certificate is no longer stuck on validation.

## Controlled beta signal (keep scope narrow)

Use one path end-to-end so margin and error rates stay interpretable:

- **One provider route:** a single `FULLSTACK_MARKETING_PROVIDER_BASE_URL` + `FULLSTACK_MARKETING_PROVIDER_PATH` + `FULLSTACK_MARKETING_PROVIDER_MODEL` (and one auth style: API key or auth token) on Cloud Run. Do not rotate providers during the beta window.
- **One operator account:** one bootstrap email/password (or one upstream actor) for all sessions. For bootstrap mode, use the returned bearer token on every later operator request.
- **One or two generators only:** e.g. `ad-copy` and optionally `social-posts` from the catalog. Avoid exercising every generator during the run.

## Where to see success, economics, and stability

**Generation success**

- **UI:** Marketing Studio → run a draft; confirm content appears and no error surface.
- **API:** `POST /api/v1/marketing/generate` returns **201** with a `draft` object and `provider_execution` metadata. Failures are usually **503** (`marketing_provider_unconfigured`) or **502** (provider HTTP/JSON errors).

**Economics ledger**

- **UI:** `/app/marketing-economics` for rollups.
- **API:** `GET /api/v1/marketing/economics` — compare `totals` and activity rows before/after a fixed sequence (generate → save → export).

**Cloud Run stability (logs)**

```bash
gcloud run services logs read fs-ai --region us-central1 --project arkham-492414 --limit 100
```

For a cleaner stream during the beta:

```bash
gcloud run services logs tail fs-ai --region us-central1 --project arkham-492414
```

Watch for HTTP **5xx**, timeouts, and repeated `marketing_provider_*` errors. In Cloud Console: **Logging** → query resource type `cloud_run_revision` and `resource.labels.service_name="fs-ai"` for error counts over time.
