import { buildEndpoint } from "../../../../lib/platform";
import {
  getOperatorAuthHeaders,
  getOperatorRequestCredentials,
} from "../../../../lib/operatorAuth";

type ApiErrorShape = {
  error?: {
    message?: string;
  };
};

export interface BuildSuiteCatalogPackage {
  lookup_key:
    | "starter-brand-site"
    | "growth-site-systems"
    | "full-build-suite"
    | "complex-product-build";
  title: string;
  mode: "payment";
  category: "service";
  configured: boolean;
  price_id: string | null;
  price_usd: number;
  project_types: string[];
  context_band: string;
  complexity_band: string;
  recommended_for: string;
  deliverables: string[];
}

export interface BuildSuiteBrief {
  id: string;
  tenant_id: string;
  papabase_lead_id?: string | null;
  project_type: string;
  business_name: string;
  branding_statement: string;
  audience?: string | null;
  offer_summary?: string | null;
  seo_regions: string[];
  email_domains: string[];
  required_integrations: string[];
  backend_scope?: string | null;
  notes?: string | null;
  recommendations: Record<string, unknown>;
  executive_ai_snapshot: Record<string, unknown>;
  checkout_lookup_key: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BuildSuiteWorkspace {
  connected: boolean;
  notes?: string;
  catalog: {
    packages: BuildSuiteCatalogPackage[];
    pricing_model?: {
      basis: string;
      note: string;
    };
  };
  briefs: BuildSuiteBrief[];
  health?: Record<string, unknown>;
  executive_ai_state?: Record<string, unknown> | null;
  leads: Array<Record<string, unknown>>;
}

export interface BuildSuiteIntakePayload {
  tenant_id: string;
  lead_id?: string;
  project_type: "website" | "app" | "website-and-app";
  business_name: string;
  branding_statement: string;
  audience?: string;
  offer_summary?: string;
  seo_regions: string[];
  email_domains: string[];
  required_integrations: string[];
  backend_scope?: string;
  notes?: string;
  checkout_lookup_key:
    | "starter-brand-site"
    | "growth-site-systems"
    | "full-build-suite"
    | "complex-product-build";
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const endpoint = buildEndpoint(path);
  if (!endpoint) {
    throw new Error(`No endpoint configured for ${path}.`);
  }

  const response = await fetch(endpoint, {
    credentials: getOperatorRequestCredentials(),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...getOperatorAuthHeaders(),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const payload = (await response.json().catch(() => undefined)) as T | ApiErrorShape | undefined;
  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "error" in payload
        ? payload.error?.message
        : `The platform returned HTTP ${response.status}.`;
    throw new Error(message || `The platform returned HTTP ${response.status}.`);
  }
  return payload as T;
}

export function fetchBuildSuiteWorkspace(tenantId: string) {
  return requestJson<BuildSuiteWorkspace>(
    `/api/v1/marketing/build-suite/workspace?tenant_id=${encodeURIComponent(tenantId)}`,
  );
}

export function createBuildSuiteIntake(payload: BuildSuiteIntakePayload) {
  return requestJson<{
    brief: BuildSuiteBrief;
    catalog: { packages: BuildSuiteCatalogPackage[] };
    papabase: {
      connected: boolean;
      lead_id?: string | null;
      executive_ai_state?: Record<string, unknown> | null;
    };
  }>("/api/v1/marketing/build-suite/intake", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createBuildSuiteCheckout(
  tenantId: string,
  lookupKey: BuildSuiteCatalogPackage["lookup_key"],
) {
  return requestJson<{ url: string }>("/api/v1/billing/checkout", {
    method: "POST",
    body: JSON.stringify({
      tenant_id: tenantId,
      lookup_key: lookupKey,
      quantity: 1,
    }),
  });
}
