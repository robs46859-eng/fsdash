import React, { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";
import {
  EndpointResult,
  buildEndpoint,
  fetchEndpointData,
} from "../../../../lib/platform";
import { RuntimeConfig } from "../../../../lib/runtime";
import {
  getOperatorAuthHeaders,
  getOperatorRequestCredentials,
} from "../../../../lib/operatorAuth";
import { StatusBadge } from "../components/common/StatusBadge";
import { SurfaceDefinition } from "../data/surfaces";

interface ResourceSurfaceViewProps {
  icon: LucideIcon;
  runtime: RuntimeConfig;
  surface: SurfaceDefinition;
}

function renderScalar(value: unknown): string {
  if (value == null) {
    return "—";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}

function DataPreview({ data }: { data: unknown }) {
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return (
        <div className="border border-outline-variant/15 bg-surface-container-low px-4 py-5 text-sm text-on-surface-variant">
          The platform returned an empty collection.
        </div>
      );
    }

    const rows = data.slice(0, 8);
    const columns = Array.from(
      new Set(
        rows.flatMap((row) =>
          row && typeof row === "object" ? Object.keys(row as Record<string, unknown>) : [],
        ),
      ),
    ).slice(0, 6);

    if (columns.length === 0) {
      return (
        <pre className="overflow-x-auto border border-outline-variant/15 bg-surface-container-low p-4 text-xs leading-6 text-on-surface-variant">
          {JSON.stringify(rows, null, 2)}
        </pre>
      );
    }

    return (
      <div className="overflow-x-auto border border-outline-variant/15 bg-surface-container-high">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-container-low">
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-surface-container-low/80">
                {columns.map((column) => (
                  <td key={column} className="px-4 py-3 text-sm text-on-surface-variant">
                    {renderScalar(
                      row && typeof row === "object" ? (row as Record<string, unknown>)[column] : row,
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data && typeof data === "object") {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {Object.entries(data as Record<string, unknown>).map(([key, value]) => (
          <div key={key} className="border border-outline-variant/15 bg-surface-container-low p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{key}</p>
            <p className="mt-2 break-words text-sm leading-6 text-on-surface">{renderScalar(value)}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="border border-outline-variant/15 bg-surface-container-low px-4 py-5 text-sm text-on-surface-variant">
      {renderScalar(data)}
    </div>
  );
}

interface BillingCatalogItem {
  lookup_key: string;
  label: string;
  category: "plan" | "credits";
  mode: "subscription" | "payment";
  configured: boolean;
}

interface BillingTenant {
  tenant_id: string;
  tenant_name: string;
  billing_plan: string;
  billing_plan_source: string;
  billing_plan_setting: string;
  active_members: number;
  estimated_monthly_total: number;
  stripe?: {
    customer_id?: string;
    subscription_id?: string;
    status?: string;
    price_id?: string;
    product_id?: string;
    plan_label?: string;
  };
}

interface BillingSummary {
  currency: string;
  integration: {
    provider?: string | null;
    supported: boolean;
    publishable_key_configured: boolean;
    checkout_supported?: boolean;
    notes: string;
  };
  catalog?: BillingCatalogItem[];
  estimated_monthly_total: number;
  tenants: BillingTenant[];
}

function isBillingSummary(data: unknown): data is BillingSummary {
  if (!data || typeof data !== "object") {
    return false;
  }
  const candidate = data as Record<string, unknown>;
  return Array.isArray(candidate.tenants) && !!candidate.integration;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

async function postBillingAction<TPayload extends object>(
  path: string,
  payload: TPayload,
): Promise<string> {
  const endpoint = buildEndpoint(path);
  if (!endpoint) {
    throw new Error("The billing action endpoint is not configured.");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    credentials: getOperatorRequestCredentials(),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...getOperatorAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  const body = (await response.json().catch(() => undefined)) as
    | { url?: string; error?: { message?: string } }
    | undefined;
  if (!response.ok) {
    throw new Error(body?.error?.message || `Billing action failed with HTTP ${response.status}.`);
  }
  if (!body?.url) {
    throw new Error("The platform did not return a Stripe URL.");
  }
  return body.url;
}

function BillingDataPreview({ data }: { data: BillingSummary }) {
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const plans = (data.catalog ?? []).filter((item) => item.category === "plan");
  const credits = (data.catalog ?? []).filter((item) => item.category === "credits");

  async function launchCheckout(tenantId: string, lookupKey: string) {
    const actionKey = `checkout:${tenantId}:${lookupKey}`;
    setPendingAction(actionKey);
    setActionError(null);
    try {
      const url = await postBillingAction("/api/v1/billing/checkout", {
        tenant_id: tenantId,
        lookup_key: lookupKey,
      });
      window.location.assign(url);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Stripe checkout failed.");
      setPendingAction(null);
    }
  }

  async function launchPortal(tenantId: string) {
    const actionKey = `portal:${tenantId}`;
    setPendingAction(actionKey);
    setActionError(null);
    try {
      const url = await postBillingAction("/api/v1/billing/portal", {
        tenant_id: tenantId,
      });
      window.location.assign(url);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Stripe portal launch failed.");
      setPendingAction(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="border border-outline-variant/15 bg-surface-container-low p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Stripe posture
          </p>
          <p className="mt-3 text-sm leading-6 text-on-surface-variant">
            {data.integration.notes}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="bg-surface-container-high px-3 py-2 text-xs uppercase tracking-[0.16em] text-on-surface">
              Provider: {data.integration.provider ?? "none"}
            </span>
            <span className="bg-surface-container-high px-3 py-2 text-xs uppercase tracking-[0.16em] text-on-surface">
              Checkout: {data.integration.checkout_supported ? "ready" : "not ready"}
            </span>
            <span className="bg-surface-container-high px-3 py-2 text-xs uppercase tracking-[0.16em] text-on-surface">
              Publishable key: {data.integration.publishable_key_configured ? "configured" : "missing"}
            </span>
          </div>
        </div>

        <div className="border border-outline-variant/15 bg-surface-container-low p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Estimated monthly total
          </p>
          <p className="mt-3 font-display text-3xl text-on-surface">
            {formatCurrency(data.estimated_monthly_total, data.currency)}
          </p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Local operator estimate from tenant settings and active member counts.
          </p>
        </div>
      </div>

      {actionError ? (
        <div className="border border-outline-variant/15 bg-surface-container-low px-4 py-4 text-sm text-on-surface-variant">
          {actionError}
        </div>
      ) : null}

      <div className="border border-outline-variant/15 bg-surface-container-low p-5">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          Configured Stripe catalog
        </p>
        <div className="space-y-3">
          {[["Plans", plans], ["Credit packs", credits] as const].map(([label, items]) => (
            <div key={label}>
              <p className="mb-2 text-xs uppercase tracking-[0.16em] text-on-surface-variant">{label}</p>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <span
                    key={item.lookup_key}
                    className="bg-surface-container-high px-3 py-2 text-xs uppercase tracking-[0.16em] text-on-surface"
                  >
                    {item.label} · {item.configured ? "configured" : "missing"}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {data.tenants.map((tenant) => (
          <div key={tenant.tenant_id} className="border border-outline-variant/15 bg-surface-container-low p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-xl text-on-surface">{tenant.tenant_name}</p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Plan: {tenant.billing_plan} · Source: {tenant.billing_plan_source}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  Est. monthly
                </p>
                <p className="mt-1 text-sm text-on-surface">
                  {formatCurrency(tenant.estimated_monthly_total, data.currency)}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="bg-surface-container-high p-4 text-sm text-on-surface-variant">
                Active members: {tenant.active_members}
              </div>
              <div className="bg-surface-container-high p-4 text-sm text-on-surface-variant">
                Stripe customer: {tenant.stripe?.customer_id ? "linked" : "not linked"}
              </div>
            </div>

            {tenant.stripe ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="bg-surface-container-high p-4 text-sm text-on-surface-variant">
                  Subscription: {tenant.stripe.subscription_id ?? "none"}
                </div>
                <div className="bg-surface-container-high p-4 text-sm text-on-surface-variant">
                  Status: {tenant.stripe.status ?? "unknown"}
                </div>
              </div>
            ) : null}

            <div className="mt-5 space-y-4">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.16em] text-on-surface-variant">
                  Start subscription checkout
                </p>
                <div className="flex flex-wrap gap-2">
                  {plans.map((plan) => {
                    const actionKey = `checkout:${tenant.tenant_id}:${plan.lookup_key}`;
                    return (
                      <button
                        key={plan.lookup_key}
                        type="button"
                        disabled={!plan.configured || pendingAction !== null}
                        onClick={() => launchCheckout(tenant.tenant_id, plan.lookup_key)}
                        className="bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-black disabled:cursor-not-allowed disabled:bg-surface-container-high disabled:text-on-surface-variant"
                      >
                        {pendingAction === actionKey ? "Opening..." : plan.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.16em] text-on-surface-variant">
                  Sell credit packs
                </p>
                <div className="flex flex-wrap gap-2">
                  {credits.map((pack) => {
                    const actionKey = `checkout:${tenant.tenant_id}:${pack.lookup_key}`;
                    return (
                      <button
                        key={pack.lookup_key}
                        type="button"
                        disabled={!pack.configured || pendingAction !== null}
                        onClick={() => launchCheckout(tenant.tenant_id, pack.lookup_key)}
                        className="bg-surface-container-high px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface disabled:cursor-not-allowed disabled:text-on-surface-variant"
                      >
                        {pendingAction === actionKey ? "Opening..." : pack.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!tenant.stripe?.customer_id || pendingAction !== null}
                  onClick={() => launchPortal(tenant.tenant_id)}
                  className="bg-surface-container-high px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface disabled:cursor-not-allowed disabled:text-on-surface-variant"
                >
                  {pendingAction === `portal:${tenant.tenant_id}` ? "Opening..." : "Manage in Stripe"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResourceSurfaceView({
  icon: Icon,
  runtime,
  surface,
}: ResourceSurfaceViewProps) {
  const [result, setResult] = useState<EndpointResult>({
    state: "loading",
    message: "Checking platform support...",
  });

  useEffect(() => {
    let active = true;
    const routePath = surface.routeKey ? runtime.api[surface.routeKey] : undefined;

    fetchEndpointData(routePath).then((response) => {
      if (active) {
        setResult(response);
      }
    });

    return () => {
      active = false;
    };
  }, [runtime, surface]);

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center bg-surface-container-low text-primary outline outline-1 -outline-offset-1 outline-outline-variant/15">
              <Icon size={22} strokeWidth={1.6} />
            </div>
            <h1 className="mb-3 font-display text-2xl font-semibold uppercase tracking-tight text-on-surface">{surface.title}</h1>
            <p className="max-w-3xl font-medium text-on-surface-variant">{surface.description}</p>
          </div>
          <div className="border border-outline-variant/15 bg-surface-container-high px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Source route</p>
            <p className="mt-1 font-mono text-sm text-on-surface">
              {surface.routeKey ? runtime.api[surface.routeKey] ?? "Not mapped" : "Runtime shell"}
            </p>
          </div>
        </header>

        <div className="mb-8 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Integration state</p>
              <StatusBadge status={result.state === "ready" ? "active" : result.state} />
            </div>
            <p className="text-sm leading-6 text-on-surface-variant">{result.message}</p>
            {result.endpoint && <p className="mt-4 break-words font-mono text-xs text-primary">{result.endpoint}</p>}
          </div>

          <div className="glass-panel p-6">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Boundaries</p>
            <div className="space-y-3">
              {surface.notes.map((note) => (
                <div
                  key={note}
                  className="border border-outline-variant/15 bg-surface-container-low px-4 py-4 text-sm leading-6 text-on-surface-variant"
                >
                  {note}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel p-6">
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Live payload</p>
          {result.state === "loading" ? (
            <div className="animate-pulse space-y-3">
              <div className="h-6 w-40 bg-surface-container-high" />
              <div className="h-24 bg-surface-container-high" />
              <div className="h-24 bg-surface-container-high" />
            </div>
          ) : surface.id === "usage-billing" &&
            result.data &&
            typeof result.data === "object" &&
            "billing" in (result.data as Record<string, unknown>) &&
            isBillingSummary((result.data as Record<string, unknown>).billing) ? (
            <BillingDataPreview data={(result.data as { billing: BillingSummary }).billing} />
          ) : surface.id === "usage-billing" && result.data && isBillingSummary(result.data) ? (
            <BillingDataPreview data={result.data} />
          ) : result.data !== undefined ? (
            <DataPreview data={result.data} />
          ) : (
            <div className="border border-dashed border-outline-variant/40 bg-surface-container-low px-5 py-8 text-sm leading-7 text-on-surface-variant">
              {result.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
