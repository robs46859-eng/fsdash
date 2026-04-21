export type AppSectionId =
  | "overview"
  | "marketing-studio"
  | "marketing-economics"
  | "playground"
  | "prompt-library"
  | "tenants"
  | "api-keys"
  | "usage-billing"
  | "providers-routing"
  | "cache-performance"
  | "requests-logs-traces"
  | "security-policy-pii"
  | "system-health"
  | "settings";

export interface SurfaceDefinition {
  id: AppSectionId;
  title: string;
  navLabel: string;
  path: string;
  description: string;
  routeKey?:
    | "tenantsPath"
    | "apiKeysPath"
    | "usageBillingPath"
    | "providersRoutingPath"
    | "cachePerformancePath"
    | "requestsLogsTracesPath"
    | "securityPolicyPath"
    | "settingsPath";
  notes: string[];
}

export const surfaceDefinitions: SurfaceDefinition[] = [
  {
    id: "marketing-studio",
    title: "Marketing Studio",
    navLabel: "Marketing Studio",
    path: "/app/marketing-studio",
    description: "Independent content generation workspace for campaign and messaging drafts, separate from CRM records and pipeline state.",
    notes: [
      "Includes six standalone generators with independent schema, prompt orchestration, draft state, version history, and export actions.",
      "Does not auto-sync outputs into CRM objects or imply account-record persistence.",
      "Architecture is prepared for later vertical templates, brand kits, and approval workflows without altering existing CRM surfaces.",
    ],
  },
  {
    id: "marketing-economics",
    title: "Marketing Economics",
    navLabel: "Economics",
    path: "/app/marketing-economics",
    description: "Unit economics for Marketing Studio activity, rolled up from real server-side generation, acceptance, and export events.",
    notes: [
      "Shows cost per draft, cost per accepted asset, and cost per channel package from the backend ledger.",
      "Uses server-side marketing activity records instead of local UI estimates.",
      "Remains isolated from CRM objects and pipeline metrics.",
    ],
  },
  {
    id: "playground",
    title: "AI Playground",
    navLabel: "Playground",
    path: "/app/playground",
    description: "Interactive environment to test and compare prompts across multiple AI providers and models.",
    notes: [
      "Support for OpenAI-compatible and Anthropic models with custom parameters.",
      "Live multi-turn chat testing for system prompts and message flows.",
      "Direct visualization of token usage and provider response metadata.",
    ],
  },
  {
    id: "prompt-library",
    title: "Prompt Library",
    navLabel: "Prompts",
    path: "/app/prompts",
    description: "Manage, version, and deploy system prompts and templates across the platform.",
    notes: [
      "Full version history with rollback capabilities.",
      "Variable injection support using {{variable}} syntax.",
      "Tenant-scoped or platform-wide prompt visibility.",
    ],
  },
  {
    id: "overview",
    title: "Overview",
    navLabel: "Overview",
    path: "/app/overview",
    description: "Operator-facing posture, environment wiring, and deployment readiness for the FullStack control plane.",
    notes: [
      "Summarizes runtime configuration instead of inventing metrics.",
      "Reflects whether backend surfaces are actually mapped in fs-ai or deployment env vars.",
    ],
  },
  {
    id: "tenants",
    title: "Tenants",
    navLabel: "Tenants",
    path: "/app/tenants",
    description: "Full tenant CRUD and membership management backed by live fs-ai routes.",
    routeKey: "tenantsPath",
    notes: [
      "Supports create, view, archive, and member management via POST /api/v1/tenants and related routes.",
      "Membership roles are operator-assignable per tenant; archive is a soft-delete (status change, not DELETE).",
    ],
  },
  {
    id: "api-keys",
    title: "API Keys",
    navLabel: "API Keys",
    path: "/app/api-keys",
    description: "Key inventory, rotation, and revocation once the platform exposes key management routes.",
    routeKey: "apiKeysPath",
    notes: [
      "Designed for create, rotate, revoke, and disable flows.",
      "Actions remain intentionally absent until fs-ai implements the underlying endpoints.",
    ],
  },
  {
    id: "usage-billing",
    title: "Usage and Billing",
    navLabel: "Usage + Billing",
    path: "/app/usage-billing",
    description: "Real usage summaries and billing signals when the platform starts emitting them.",
    routeKey: "usageBillingPath",
    notes: [
      "No synthetic revenue or usage charts are rendered.",
      "If configured, the raw endpoint response is surfaced directly.",
    ],
  },
  {
    id: "providers-routing",
    title: "Providers and Routing",
    navLabel: "Providers",
    path: "/app/providers-routing",
    description: "Full provider catalog management — 15 built-in providers, custom provider support, per-tenant model selection.",
    routeKey: "providersRoutingPath",
    notes: [
      "Operators configure API keys and enable providers; tenants select their preferred provider and model.",
      "Routing enforces tenant preferences at generation time with env-based fallback.",
    ],
  },
  {
    id: "cache-performance",
    title: "Cache and Performance",
    navLabel: "Cache",
    path: "/app/cache-performance",
    description: "Cache posture, latency envelopes, and performance visibility sourced from the platform.",
    routeKey: "cachePerformancePath",
    notes: [
      "Avoids fake hit rates or latency graphs.",
      "Can display real payloads from platform cache or performance endpoints when available.",
    ],
  },
  {
    id: "requests-logs-traces",
    title: "Requests, Logs, and Traces",
    navLabel: "Requests",
    path: "/app/requests-logs-traces",
    description: "Traceability for request flow, operator actions, and backend execution history.",
    routeKey: "requestsLogsTracesPath",
    notes: [
      "Built for request history, traces, and logs once fs-ai provides those records.",
      "The view shows raw records rather than invented trace lines.",
    ],
  },
  {
    id: "security-policy-pii",
    title: "Security, Policy, and PII",
    navLabel: "Security",
    path: "/app/security-policy-pii",
    description: "Policy enforcement, PII boundaries, and security controls for operator workflows.",
    routeKey: "securityPolicyPath",
    notes: [
      "This is where policy and privacy routes should land when implemented in fs-ai.",
      "Arkham-specific policy concerns are scoped as sidecar dependencies, not primary branding.",
    ],
  },
  {
    id: "system-health",
    title: "System Health",
    navLabel: "Health",
    path: "/app/system-health",
    description: "Live probes for FullStack platform readiness and Arkham sidecar availability.",
    notes: [
      "Uses configured health and readiness endpoints rather than local mock data.",
      "This is the main surface where Arkham appears in the product UI.",
    ],
  },
  {
    id: "settings",
    title: "Settings",
    navLabel: "Settings",
    path: "/app/settings",
    description: "Deployment, auth, CORS, and runtime assumptions for the FullStack operator environment.",
    routeKey: "settingsPath",
    notes: [
      "Exposes deployment assumptions and env wiring rather than pretend toggle controls.",
      "Pairs with DEPLOYMENT_NOTES.md and SIDECAR_NOTES.md for production rollout.",
    ],
  },
];

export const surfaceDefinitionMap = Object.fromEntries(
  surfaceDefinitions.map((surface) => [surface.id, surface]),
) as Record<AppSectionId, SurfaceDefinition>;
