# WEBSITE_BUILDER_PHASED_PLAN

## Goal

Turn the current FullStack product into a real tenant-scoped white-label website builder without discarding the existing verticals.

This plan assumes:

- `fsai.pro` remains the primary product entry
- `api.fsai.pro` remains the backend API
- the existing `fsdash` frontend becomes the foundation for both customer workspace and operator surfaces
- `fs-ai` remains the system of record for tenants, auth, billing, prompt orchestration, and publishing state

## What the customer should actually use this for

The customer-facing product should let a tenant:

- create a branded marketing site for their business
- pick a template or start from a guided scaffold
- generate landing page copy with Marketing Studio
- edit page sections, branding, navigation, CTAs, forms, and SEO fields
- preview the site on a tenant preview URL
- publish to a hosted site and later connect a custom domain
- manage subscription and plan in Stripe

This is a website builder product if and only if the customer can go from:

1. sign up
2. create workspace
3. create site
4. generate/edit pages
5. publish

without touching operator-only controls.

## Product split

Recommended runtime split:

- `fsai.pro`
  - public marketing site
  - pricing
  - docs/help
  - customer login/signup entry
- `fsai.pro/workspace/*`
  - customer workspace
  - website builder
  - billing
  - prompt/content tools relevant to the tenant
- `ops.fsai.pro/*`
  - operator/admin control plane
  - tenants
  - global API keys
  - platform health
  - requests/logs/traces
- `api.fsai.pro`
  - backend only

## Existing assets to reuse

Do not rebuild these from scratch:

- tenant model and auth flows in `fs-ai`
- Stripe billing endpoints and tenant linkage
- Marketing Studio generation flows
- Prompt Library
- provider routing and model selection
- Firebase Hosting deployment path

Use the website builder as a new vertical that plugs into the existing platform instead of replacing it.

## Phase 1: Define the domain model

Add a first-class `site` model to `fs-ai`.

Minimum entities:

- `sites`
- `site_pages`
- `site_sections`
- `site_themes`
- `site_domains`
- `site_publishes`
- `site_assets`

Suggested SQLite/Postgres migration shape:

```sql
CREATE TABLE sites (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  template_key TEXT,
  theme_id TEXT,
  homepage_page_id TEXT,
  preview_subdomain TEXT,
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE site_pages (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  route_path TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_homepage INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE site_sections (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL,
  section_type TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  props_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

Backend rule:

- every `site` belongs to exactly one tenant
- all builder actions are tenant-scoped
- operators can impersonate or inspect, but normal customers only see their own tenant sites

## Phase 2: Add the backend contract

Create new API surfaces in `fs-ai`:

- `GET /api/v1/sites`
- `POST /api/v1/sites`
- `GET /api/v1/sites/{site_id}`
- `PATCH /api/v1/sites/{site_id}`
- `DELETE /api/v1/sites/{site_id}`
- `GET /api/v1/sites/{site_id}/pages`
- `POST /api/v1/sites/{site_id}/pages`
- `PATCH /api/v1/pages/{page_id}`
- `PATCH /api/v1/sections/{section_id}`
- `POST /api/v1/sites/{site_id}/generate`
- `POST /api/v1/sites/{site_id}/publish`
- `GET /api/v1/sites/{site_id}/publish-status`
- `POST /api/v1/sites/{site_id}/domains`

FastAPI stub shape:

```python
@router.get("/sites")
def list_sites(
    tenant_id: str = Query(...),
    _: Any = Depends(auth_dependency),
    connection: sqlite3.Connection = Depends(db_dependency),
):
    return get_sites(connection, tenant_id=tenant_id)


@router.post("/sites/{site_id}/generate")
def generate_site_page(
    site_id: str,
    payload: SiteGenerateRequest,
    _: Any = Depends(auth_dependency),
    connection: sqlite3.Connection = Depends(db_dependency),
):
    return generate_site_sections(connection, site_id=site_id, payload=payload)
```

`generate_site_sections(...)` should call the same provider/prompt plumbing already used by Marketing Studio, but write the result into `site_sections.props_json` instead of draft-only marketing rows.

## Phase 3: Create the customer workspace shell

The current app shell is operator-heavy. Add a customer-facing route group.

Recommended route split inside `fsdash`:

- `/workspace`
- `/workspace/sites`
- `/workspace/sites/:siteId`
- `/workspace/sites/:siteId/pages/:pageId`
- `/workspace/billing`
- `/workspace/prompts`

Keep operator routes under `/app/*` or move them later to `ops.fsai.pro`.

Minimal route parser extension:

```ts
type RouteState =
  | { kind: "landing" }
  | { kind: "access" }
  | { kind: "workspace"; section: "sites" | "billing" | "prompts" }
  | { kind: "app"; section: AppSectionId };
```

Do not expose platform-wide surfaces to customer users by default.

## Phase 4: Build the site builder UI

The builder needs four panes:

- site/page tree
- canvas preview
- section list
- inspector panel

Suggested React state shape:

```ts
interface SiteEditorState {
  site: SiteRecord;
  pages: SitePageRecord[];
  activePageId: string;
  sections: SiteSectionRecord[];
  selectedSectionId?: string;
  dirty: boolean;
}
```

Core components to add:

- `SiteWorkspaceView`
- `SiteListView`
- `SiteEditorView`
- `PageTree`
- `SectionPalette`
- `SectionInspector`
- `SiteCanvas`
- `ThemePanel`
- `PublishPanel`

Suggested folder:

```text
src/apps/customer-builder/
  components/
  views/
  api/
  types.ts
```

## Phase 5: Define the section system

Do not start with arbitrary HTML editing. Start with a constrained section registry.

Initial section types:

- `hero`
- `feature-grid`
- `logo-strip`
- `testimonial`
- `cta-band`
- `faq`
- `contact-form`
- `footer`

Suggested section registry:

```ts
export const siteSectionRegistry = {
  hero: HeroSection,
  "feature-grid": FeatureGridSection,
  testimonial: TestimonialSection,
  "contact-form": ContactFormSection,
} as const;
```

Suggested stored payload:

```json
{
  "headline": "Build trust fast.",
  "subheadline": "Launch a branded service website in hours, not weeks.",
  "primaryCta": { "label": "Book a Demo", "href": "/contact" },
  "secondaryCta": { "label": "See Pricing", "href": "/pricing" },
  "media": { "imageAssetId": "asset_123" }
}
```

That gives you structured editing, AI generation, and stable rendering.

## Phase 6: Tie it into Marketing Studio

This is where the existing vertical becomes useful.

Marketing Studio should generate website content in a builder-aware shape:

- homepage hero copy
- services page sections
- about page story
- FAQ set
- CTA variants
- SEO metadata

Add generator types like:

- `website-homepage`
- `website-services-page`
- `website-about-page`
- `website-faq`

Example generation request:

```json
{
  "site_id": "site_abc",
  "page_id": "page_home",
  "generator": "website-homepage",
  "inputs": {
    "business_name": "Acme Wellness",
    "industry": "wellness clinic",
    "tone": "credible and modern",
    "offer": "same-week appointments"
  }
}
```

Marketing Studio remains the AI authoring engine. The website builder becomes the structured destination for those outputs.

## Phase 7: Tie it into Prompt Library

Prompt Library should become the configuration layer for site generation.

Use it for:

- per-industry website prompts
- reusable hero/CTA prompt variants
- per-tenant brand voice templates
- optional tenant overrides

That lets advanced customers or operators tune generation quality without touching application code.

## Phase 8: Tie it into Stripe

Stripe should control access to builder capabilities, not just show billing posture.

Suggested entitlement model:

- `free`
  - 1 draft site
  - preview only
  - no custom domain
- `pro`
  - 1 published site
  - custom domain
  - AI generation limits
- `studio`
  - multiple sites
  - more seats
  - advanced templates
  - higher generation allowance

Enforcement points:

- on `POST /sites`
- on `POST /sites/{site_id}/publish`
- on `POST /sites/{site_id}/domains`

Example gate:

```python
if effective_billing_plan(tenant_row) not in {"Premium", "Ultra"}:
    raise AppError(
        status_code=402,
        code="site_publish_plan_required",
        message="Publishing requires a paid website-builder plan.",
    )
```

## Phase 9: Add preview and publish

Split preview from publish.

Preview:

- each site gets a preview URL
- example: `tenant-slug.preview.fsai.pro`
- render latest draft sections from API data

Publish:

- compile site JSON into a static build artifact
- write artifact manifest to storage
- serve published site via Hosting or CDN-backed static runtime

Published manifest shape:

```json
{
  "site_id": "site_abc",
  "version": 12,
  "pages": [
    { "path": "/", "title": "Home", "sections": ["sec_1", "sec_2"] },
    { "path": "/about", "title": "About", "sections": ["sec_5"] }
  ],
  "theme": {
    "font_heading": "Space Grotesk",
    "font_body": "Inter",
    "color_primary": "#FF7043"
  }
}
```

Do not make publish depend on the live operator dashboard. Publish should be deterministic and versioned.

## Phase 10: Theme and white-label controls

A white-label website builder needs branding controls, not just copy generation.

Minimum theme controls:

- logo
- brand colors
- heading/body fonts
- button style
- navigation style
- footer/legal text
- social links

Add a `site_themes` table and a typed theme payload:

```ts
interface SiteTheme {
  logoAssetId?: string;
  colorPrimary: string;
  colorAccent: string;
  headingFont: string;
  bodyFont: string;
  radiusStyle: "sharp" | "soft";
}
```

If you want this to stay aligned to the current industrial FullStack visual system, use it only for the operator shell. Customer-published sites need their own brand theme layer.

## Phase 11: Domain onboarding

Customer value is weak until they can connect a real domain.

Add domain workflow:

- customer adds domain
- platform returns DNS instructions
- backend verifies domain ownership
- publish target is attached to that domain
- SSL status is tracked in `site_domains`

Suggested fields:

- `hostname`
- `verification_status`
- `ssl_status`
- `dns_target`
- `last_checked_at`

This domain flow should reuse the Firebase/GCP lessons already learned on `fsai.pro`, but should be productized for tenant sites instead of handled manually.

## Phase 12: Customer-safe permissions

Before launch, separate roles clearly:

- `operator`
  - full platform visibility
- `tenant_admin`
  - manage sites, branding, billing, team for one tenant
- `tenant_editor`
  - edit pages and prompts, no billing/domain access
- `tenant_viewer`
  - preview only

Customer users should never see:

- all-tenant CRUD
- platform health internals
- raw backend traces
- global provider credentials

## Phase 13: Delivery order

Recommended implementation order:

1. backend schema and CRUD for sites/pages/sections
2. customer route group and site list
3. basic section-based editor
4. site preview renderer
5. Marketing Studio generation into sections
6. Stripe entitlement gates
7. publish pipeline
8. custom domain onboarding
9. advanced templates and theme variations

## Phase 14: First shippable milestone

The first version should be intentionally narrow.

Ship this:

- one tenant can create one site
- site can have:
  - home page
  - about page
  - contact page
- six section types
- AI generation for hero/features/FAQ
- preview URL
- publish to managed hosted URL
- paid plans unlock publishing and custom domain

Do not ship first:

- raw drag-and-drop everywhere
- arbitrary code injection
- full marketplace
- multi-site analytics suite
- operator-grade domain edge cases

## Phase 15: Concrete repo changes

Frontend:

- add customer workspace routes in `fsdash`
- add new builder module under `src/apps/customer-builder`
- add API client bindings for sites/pages/sections/publish
- keep operator surfaces intact

Backend:

- add schema migrations in `fs-ai`
- add site services, serializers, and routes
- add publish service
- add entitlement checks using tenant billing state
- add domain verification lifecycle

Infrastructure:

- keep `fsai.pro` as the main product entry
- keep `api.fsai.pro` as API
- later add `ops.fsai.pro` for operator/admin
- add preview/publish host strategy for tenant sites

## Decision rule

If a feature helps a tenant build, brand, edit, preview, publish, or bill for their own website, it belongs in the customer workspace.

If a feature manages all tenants, platform posture, or system internals, it belongs in the operator workspace.

That separation is what turns the current product from an operator-heavy AI dashboard into an honest white-label website builder.
