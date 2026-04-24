# WEBSITE_BUILDER_HANDOFF

## Objective

Build the missing customer-facing website builder inside the existing FullStack stack instead of continuing to frame the current product as a white-label website builder when it is still primarily an operator-heavy control plane.

This handoff is paired with:

- [website-builder-phased-plan.md](/Users/joeiton/Projects/fsdash/docs/website-builder-phased-plan.md)

Use that file as the product and architecture spec. Use this file as the execution starting point.

## Current reality

What is live now:

- `fsai.pro` and `www.fsai.pro` serve the `fsdash` frontend on Firebase Hosting
- `api.fsai.pro` serves `fs-ai`
- the frontend route shell currently serves:
  - `/` landing page
  - `/access` access/auth gate
  - `/app/*` operator-heavy dashboard

What is not true yet:

- there is no real customer website builder flow
- there is no `site` model
- there is no page/section/theme/domain publishing model for customer sites
- there is no dedicated customer workspace route group
- there is no separate operator host yet such as `ops.fsai.pro`

## Why this work exists

The product was pitched like a white-label website builder, but the implementation currently supports:

- tenant auth
- marketing generation
- prompt management
- billing
- provider routing
- operator administration

The missing layer is the actual builder:

- site creation
- structured page editing
- preview
- publish
- custom domain attachment

## System boundaries

Keep these boundaries intact:

- `fsdash`
  - frontend shell
  - customer workspace UI
  - operator/admin UI
- `fs-ai`
  - tenant auth
  - persistence
  - billing state
  - generation orchestration
  - publish state and domain state
- Firebase Hosting
  - frontend product entry
  - possibly preview/published site serving later
- Stripe
  - subscription and entitlement gate
  - not site rendering

## Product split to implement

Target product shape:

- `fsai.pro`
  - public site
  - pricing
  - signup/login
- `fsai.pro/workspace/*`
  - customer workspace
  - website builder
  - prompt tooling relevant to the tenant
  - billing
- `ops.fsai.pro/*`
  - operator control plane
  - all-tenant and system-level tooling
- `api.fsai.pro`
  - backend only

Do not block the builder on `ops.fsai.pro`. The customer workspace can be built now while operator routes temporarily remain under `/app/*`.

## Existing pieces to reuse

Frontend:

- [App.tsx](/Users/joeiton/Projects/fsdash/src/apps/admin/src/App.tsx:1)
- [surfaces.ts](/Users/joeiton/Projects/fsdash/src/apps/admin/src/data/surfaces.ts:1)
- [ResourceSurfaceView.tsx](/Users/joeiton/Projects/fsdash/src/apps/admin/src/views/ResourceSurfaceView.tsx:1)

Backend:

- tenant/auth/session flows in `fs-ai`
- marketing generation APIs
- prompt storage/versioning
- Stripe billing APIs

Infra:

- Firebase Hosting deployment for frontend
- Cloud Run backend at `api.fsai.pro`

## First implementation slice

Do this first. Do not start with drag-and-drop or custom domains.

### Backend

Add first-class site records in `fs-ai`:

- `sites`
- `site_pages`
- `site_sections`

Implement:

- `GET /api/v1/sites`
- `POST /api/v1/sites`
- `GET /api/v1/sites/{site_id}`
- `PATCH /api/v1/sites/{site_id}`
- `GET /api/v1/sites/{site_id}/pages`
- `POST /api/v1/sites/{site_id}/pages`
- `PATCH /api/v1/sections/{section_id}`

Minimum payload shape:

```json
{
  "site": {
    "id": "site_123",
    "tenant_id": "tenant_123",
    "name": "Acme Wellness",
    "slug": "acme-wellness",
    "status": "draft"
  },
  "pages": [
    {
      "id": "page_home",
      "title": "Home",
      "route_path": "/",
      "is_homepage": true
    }
  ]
}
```

### Frontend

Add a customer route group in `fsdash`:

- `/workspace`
- `/workspace/sites`
- `/workspace/sites/:siteId`
- `/workspace/sites/:siteId/pages/:pageId`

Build these first views:

- `SiteListView`
- `SiteWorkspaceView`
- `SiteEditorView`

The first editor can be simple:

- page list in left rail
- ordered section list
- preview pane
- basic inspector form for selected section

### Section model

Start with a constrained registry:

- `hero`
- `feature-grid`
- `testimonial`
- `cta-band`
- `contact-form`
- `footer`

Store structured JSON, not raw HTML blobs.

## Second implementation slice

Once CRUD and the editor exist:

- connect Marketing Studio generation into page sections
- add `POST /api/v1/sites/{site_id}/generate`
- let users generate homepage hero/features/FAQ content into the section model

This is the first point where the existing vertical becomes obviously valuable.

## Third implementation slice

After generation works:

- add preview URLs
- add publish state and publish versions
- then add Stripe entitlement checks for publish and domain connection

Suggested rule:

- free tier can draft and preview
- paid tier can publish
- higher tier can connect custom domains and manage multiple sites

## Explicit non-goals for the first cut

Do not start with:

- arbitrary drag-and-drop everywhere
- free-form HTML editor
- full custom domain onboarding
- operator dashboard migration
- full analytics suite
- multi-region publish pipeline

Those are later phases.

## Customer use case to optimize for

The first honest customer journey should be:

1. sign up
2. create tenant/workspace
3. create a new website
4. pick a template or starter profile
5. generate homepage copy
6. edit sections
7. preview site
8. upgrade plan if needed
9. publish site

If the product cannot do that flow cleanly, it is still not a website builder.

## Suggested repo placement

Frontend additions:

- `fsdash/src/apps/customer-builder/`

Backend additions:

- `fs-ai/app/sites.py`
- `fs-ai/app/site_services.py`
- `fs-ai/app/site_publish.py`

Or integrate into existing service/layout conventions if those files are split differently during implementation.

## Immediate next task

Start with schema plus API contract.

Specifically:

1. add site/page/section tables
2. add typed request/response models
3. add CRUD endpoints
4. add a basic `/workspace/sites` frontend shell wired to those endpoints

That is the smallest real slice that turns this from product framing into implementation.
