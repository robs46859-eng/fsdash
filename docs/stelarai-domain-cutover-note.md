# StelarAI Domain Cutover Note

Date: 2026-04-24

## Why this repo matters

`fsdash` is the frontend repo for the Hosting-backed sites in this cutover.

Current site targets in `.firebaserc`:

- `fullstack` -> `fsai-pro`
- `stelarai` -> `stelarai-tech`
- `solamaze` -> `solamaze-com`
- `getsemu` -> `getsemu-com`

## Intended routing

- `fsai.pro` and `www.fsai.pro` -> Firebase Hosting
- `stelarai.tech` and `www.stelarai.tech` -> Firebase Hosting
- `solamaze.com` and `www.solamaze.com` -> Firebase Hosting
- `getsemu.com` and `www.getsemu.com` -> Firebase Hosting

API hosts do not belong on Firebase Hosting:

- `api.fsai.pro` -> Google load balancer -> `fs-ai`
- `api.stelarai.tech` -> Google load balancer -> `fs-ai`

## Registrar nameservers

- `stelarai.tech`
  - `ns-cloud-d1.googledomains.com`
  - `ns-cloud-d2.googledomains.com`
  - `ns-cloud-d3.googledomains.com`
  - `ns-cloud-d4.googledomains.com`
- `solamaze.com`
  - `ns-cloud-b1.googledomains.com`
  - `ns-cloud-b2.googledomains.com`
  - `ns-cloud-b3.googledomains.com`
  - `ns-cloud-b4.googledomains.com`
- `getsemu.com`
  - `ns-cloud-a1.googledomains.com`
  - `ns-cloud-a2.googledomains.com`
  - `ns-cloud-a3.googledomains.com`
  - `ns-cloud-a4.googledomains.com`

## Current project-side state

- Firebase Hosting sites created:
  - `stelarai-tech`
  - `solamaze-com`
  - `getsemu-com`
- Cloud DNS records have been written for the frontend domains.
- Firebase custom-domain resources have been created and are waiting on public DNS ownership and certificate convergence.

## What to verify next

1. Registrar NS must match the values above.
2. Firebase custom domains must become `OWNERSHIP_ACTIVE`.
3. Firebase certificates must become `CERT_ACTIVE`.
4. Only after that should frontend deploy verification be treated as final.
