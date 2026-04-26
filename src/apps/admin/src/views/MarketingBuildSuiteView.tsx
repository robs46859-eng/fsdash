import React, { useMemo, useState } from "react";
import { CheckCircle2, Globe2, RefreshCcw, Sparkles, Wallet } from "lucide-react";
import {
  BuildSuiteBrief,
  BuildSuiteIntakePayload,
  BuildSuiteWorkspace,
  createBuildSuiteCheckout,
  createBuildSuiteIntake,
  fetchBuildSuiteWorkspace,
} from "../marketing/buildSuiteApi";
import { cn, ErrorState, LoadingState, StatusBadge } from "../components/common/index";

const initialForm: BuildSuiteIntakePayload = {
  tenant_id: "",
  project_type: "website-and-app",
  business_name: "",
  branding_statement: "",
  audience: "",
  offer_summary: "",
  seo_regions: [],
  email_domains: [],
  required_integrations: [],
  backend_scope: "",
  notes: "",
  checkout_lookup_key: "full-build-suite",
};

function parseCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stringifyList(value: string[]) {
  return value.join(", ");
}

function RecommendationList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) {
    return null;
  }
  return (
    <div className="glass-panel p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">{title}</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex gap-3 text-sm leading-6 text-on-surface-variant">
            <CheckCircle2 size={16} className="mt-1 shrink-0 text-emerald-300" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MarketingBuildSuiteView() {
  const [tenantId, setTenantId] = useState("");
  const [workspace, setWorkspace] = useState<BuildSuiteWorkspace | null>(null);
  const [brief, setBrief] = useState<BuildSuiteBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(initialForm);

  const activePackage =
    workspace?.catalog.packages.find((item) => item.lookup_key === form.checkout_lookup_key) ??
    workspace?.catalog.packages[0];
  const recommendations = (brief?.recommendations ?? {}) as Record<string, unknown>;
  const branding = (recommendations.branding ?? {}) as Record<string, unknown>;
  const businessContext = (recommendations.business_context ?? {}) as Record<string, unknown>;
  const technicalScope = (recommendations.technical_scope ?? []) as string[];
  const emailSetup = (recommendations.email_setup ?? []) as string[];
  const seoPlan = (recommendations.seo_plan ?? []) as string[];
  const deliveryNotes = (recommendations.delivery_notes ?? []) as string[];

  const executiveAiInsights = useMemo(() => {
    const state = (workspace?.executive_ai_state ?? {}) as Record<string, unknown>;
    return Array.isArray(state.business_insights)
      ? (state.business_insights as Array<Record<string, unknown>>)
      : [];
  }, [workspace]);

  const loadWorkspace = async () => {
    if (!tenantId.trim()) {
      setError("Enter a tenant ID first.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const nextWorkspace = await fetchBuildSuiteWorkspace(tenantId.trim());
      setWorkspace(nextWorkspace);
      setForm((current) => ({
          ...current,
          tenant_id: tenantId.trim(),
          business_name:
            current.business_name ||
          String((nextWorkspace.executive_ai_state as Record<string, unknown> | undefined)?.business_name || ""),
      }));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load the build-suite workspace.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof BuildSuiteIntakePayload, value: string | string[]) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submitIntake = async () => {
    if (!form.tenant_id.trim() || !form.business_name.trim() || !form.branding_statement.trim()) {
      setError("Tenant ID, business name, and branding statement are required.");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const result = await createBuildSuiteIntake({
        ...form,
        tenant_id: form.tenant_id.trim(),
        business_name: form.business_name.trim(),
        branding_statement: form.branding_statement.trim(),
      });
      setBrief(result.brief);
      setMessage(
        result.papabase.connected
          ? "Build brief created and tied to the PapaBase business-manager workspace."
          : "Build brief created. Configure PAPABASE_URL in the runtime to sync business-manager context.",
      );
      const nextWorkspace = await fetchBuildSuiteWorkspace(form.tenant_id.trim());
      setWorkspace(nextWorkspace);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to create the build brief.");
    } finally {
      setSubmitting(false);
    }
  };

  const startCheckout = async () => {
    if (!form.tenant_id.trim()) {
      setError("A tenant ID is required before checkout.");
      return;
    }
    setCheckingOut(true);
    setError("");
    try {
      const result = await createBuildSuiteCheckout(form.tenant_id.trim(), form.checkout_lookup_key);
      window.location.href = result.url;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to start checkout.");
      setCheckingOut(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">Marketing Build Suite</p>
            <h1 className="mt-3 font-display text-3xl font-semibold uppercase tracking-tight text-on-surface">
              Prompt-first builder for Stitch-grade layouts and strong branding
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-on-surface-variant">
              Start from a branding statement, pull in PapaBase business-manager context, and turn that into a
              high-quality website or app build brief with backend scope, SEO planning, and launch-system guidance.
            </p>
          </div>
          <div className="glass-panel flex items-center gap-3 px-4 py-3">
            <StatusBadge status={workspace?.connected ? "live" : "missing"} />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
              PapaBase business-manager bridge
            </span>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="glass-panel p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">Workspace</p>
                <h2 className="mt-2 font-display text-xl font-semibold uppercase tracking-tight text-on-surface">
                  Tenant and business-manager context
                </h2>
              </div>
              <button
                type="button"
                onClick={loadWorkspace}
                className="inline-flex items-center gap-2 bg-surface-container-high px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-on-surface"
              >
                <RefreshCcw size={14} />
                Load workspace
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Tenant ID</span>
                <input
                  className="ds-input mt-2 w-full px-0 py-3 text-sm text-on-surface bg-surface-container-highest"
                  value={tenantId}
                  onChange={(event) => setTenantId(event.target.value)}
                  placeholder="tenant_..."
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Business name</span>
                <input
                  className="ds-input mt-2 w-full px-0 py-3 text-sm text-on-surface bg-surface-container-highest"
                  value={form.business_name}
                  onChange={(event) => updateField("business_name", event.target.value)}
                  placeholder="Arkham Prison AI"
                />
              </label>
            </div>

            {loading ? <div className="mt-6"><LoadingState /></div> : null}
            {!loading && error ? <div className="mt-6"><ErrorState error={error} /></div> : null}
            {!loading && message ? (
              <div className="mt-6 border-l-[3px] border-l-emerald-400 bg-emerald-500/5 p-4 text-sm text-emerald-100">
                {message}
              </div>
            ) : null}

            {workspace ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="bg-surface-container-low p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">Executive AI</p>
                  <p className="mt-3 font-display text-lg font-semibold text-on-surface">
                    {String((workspace.executive_ai_state as Record<string, unknown> | undefined)?.business_name || "My Family Business")}
                  </p>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    {String((workspace.executive_ai_state as Record<string, unknown> | undefined)?.strategy_status || "Idle")}
                  </p>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    {String((workspace.executive_ai_state as Record<string, unknown> | undefined)?.revenue_metrics || "No revenue signal")}
                  </p>
                </div>
                <div className="bg-surface-container-low p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">Pipeline links</p>
                  <p className="mt-3 text-sm text-on-surface-variant">
                    Leads in PapaBase: <span className="font-semibold text-on-surface">{workspace.leads.length}</span>
                  </p>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    Stored build briefs: <span className="font-semibold text-on-surface">{workspace.briefs.length}</span>
                  </p>
                </div>
              </div>
            ) : null}
          </section>

          <section className="glass-panel p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">Offer</p>
            <h2 className="mt-2 font-display text-xl font-semibold uppercase tracking-tight text-on-surface">
              High-end full build package
            </h2>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              The builder is priced as a one-time package tiered by token-context and delivery complexity rather than
              lightweight copy-only work.
            </p>
            {workspace?.catalog.pricing_model ? (
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-on-surface-variant">
                {workspace.catalog.pricing_model.note}
              </p>
            ) : null}
            {workspace?.catalog.packages?.length ? (
              <div className="mt-6 grid gap-4">
                {workspace.catalog.packages.map((pkg) => {
                  const selected = pkg.lookup_key === form.checkout_lookup_key;
                  return (
                    <button
                      key={pkg.lookup_key}
                      type="button"
                      onClick={() => updateField("checkout_lookup_key", pkg.lookup_key)}
                      className={cn(
                        "border p-5 text-left transition-colors",
                        selected
                          ? "border-primary bg-primary/10"
                          : "border-white/10 bg-surface-container-low hover:border-white/20",
                      )}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <StatusBadge status={pkg.configured ? "configured" : "missing"} />
                            <span className="text-sm font-semibold text-on-surface">{pkg.title}</span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-on-surface-variant">{pkg.recommended_for}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-2xl font-semibold text-on-surface">
                            ${pkg.price_usd.toLocaleString()}
                          </p>
                          <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-on-surface-variant">
                            {pkg.context_band}
                          </p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-on-surface-variant">
                            {pkg.complexity_band}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        {pkg.deliverables.map((item) => (
                          <div key={item} className="flex gap-3 text-sm leading-6 text-on-surface-variant">
                            <Sparkles size={16} className="mt-1 shrink-0 text-primary" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
                {activePackage ? (
                  <div className="flex items-center justify-between gap-4 border border-white/10 bg-surface-container-low p-4">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">Selected package: {activePackage.title}</p>
                      <p className="mt-1 text-sm text-on-surface-variant">{activePackage.recommended_for}</p>
                    </div>
                    <button
                      type="button"
                      disabled={!activePackage.configured || checkingOut}
                      onClick={startCheckout}
                      className={cn(
                        "inline-flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em]",
                        activePackage.configured
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-high text-on-surface-variant",
                      )}
                    >
                      <Wallet size={14} />
                      {checkingOut ? "Starting checkout..." : "Start one-time checkout"}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        </div>

        <section className="glass-panel p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">Builder brief</p>
          <h2 className="mt-2 font-display text-xl font-semibold uppercase tracking-tight text-on-surface">
            Generate the build brief from a branding statement
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Project type</span>
              <select
                className="ds-input mt-2 w-full px-0 py-3 text-sm text-on-surface bg-surface-container-highest"
                value={form.project_type}
                onChange={(event) => updateField("project_type", event.target.value as BuildSuiteIntakePayload["project_type"])}
              >
                <option value="website">Website</option>
                <option value="app">App</option>
                <option value="website-and-app">Website + App</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Audience</span>
              <input
                className="ds-input mt-2 w-full px-0 py-3 text-sm text-on-surface bg-surface-container-highest"
                value={form.audience}
                onChange={(event) => updateField("audience", event.target.value)}
                placeholder="CIOs, AEC operators, enterprise buyers..."
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Branding statement</span>
            <textarea
              className="ds-input mt-2 min-h-[160px] w-full resize-y px-0 py-3 text-sm text-on-surface bg-surface-container-highest"
              value={form.branding_statement}
              onChange={(event) => updateField("branding_statement", event.target.value)}
              placeholder="Describe the business, its point of view, tone, competitive edge, visual posture, and the kind of technical authority the site or app should project."
            />
          </label>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Offer summary</span>
              <textarea
                className="ds-input mt-2 min-h-[110px] w-full resize-y px-0 py-3 text-sm text-on-surface bg-surface-container-highest"
                value={form.offer_summary}
                onChange={(event) => updateField("offer_summary", event.target.value)}
                placeholder="List offers, pricing logic, service lines, or product motion."
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Backend scope</span>
              <textarea
                className="ds-input mt-2 min-h-[110px] w-full resize-y px-0 py-3 text-sm text-on-surface bg-surface-container-highest"
                value={form.backend_scope}
                onChange={(event) => updateField("backend_scope", event.target.value)}
                placeholder="Auth, billing, dashboards, CRM, email, analytics, search, workflows..."
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">SEO regions</span>
              <input
                className="ds-input mt-2 w-full px-0 py-3 text-sm text-on-surface bg-surface-container-highest"
                value={stringifyList(form.seo_regions)}
                onChange={(event) => updateField("seo_regions", parseCsv(event.target.value))}
                placeholder="Denver, US, North America"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Email domains</span>
              <input
                className="ds-input mt-2 w-full px-0 py-3 text-sm text-on-surface bg-surface-container-highest"
                value={stringifyList(form.email_domains)}
                onChange={(event) => updateField("email_domains", parseCsv(event.target.value))}
                placeholder="hello@brand.com, ops@brand.com"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Integrations</span>
              <input
                className="ds-input mt-2 w-full px-0 py-3 text-sm text-on-surface bg-surface-container-highest"
                value={stringifyList(form.required_integrations)}
                onChange={(event) => updateField("required_integrations", parseCsv(event.target.value))}
                placeholder="Stripe, HubSpot, Firebase Auth"
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Notes</span>
            <textarea
              className="ds-input mt-2 min-h-[100px] w-full resize-y px-0 py-3 text-sm text-on-surface bg-surface-container-highest"
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Any must-have pages, launch deadlines, stack preferences, or technical constraints."
            />
          </label>

          <div className="mt-6">
            <button
              type="button"
              onClick={submitIntake}
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-primary px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-on-primary"
            >
              <Globe2 size={14} />
              {submitting ? "Generating brief..." : "Generate build brief"}
            </button>
          </div>
        </section>

        {brief ? (
          <section className="grid gap-4 xl:grid-cols-2">
            <div className="glass-panel p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">Business context</p>
              <h2 className="mt-2 font-display text-xl font-semibold uppercase tracking-tight text-on-surface">
                {String(businessContext.business_name || brief.business_name)}
              </h2>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                {String(branding.positioning || brief.branding_statement)}
              </p>
              <div className="mt-6 space-y-3 text-sm text-on-surface-variant">
                <p>Audience: <span className="text-on-surface">{String(businessContext.audience || brief.audience || "Not specified")}</span></p>
                <p>Strategy: <span className="text-on-surface">{String(businessContext.strategy_status || "Not specified")}</span></p>
                <p>Revenue signal: <span className="text-on-surface">{String(businessContext.revenue_metrics || "Not specified")}</span></p>
              </div>
              {executiveAiInsights.length ? (
                <div className="mt-6 space-y-3">
                  {executiveAiInsights.map((insight, index) => (
                    <div key={`${String(insight.title)}-${index}`} className="bg-surface-container-low p-4">
                      <p className="text-sm font-semibold text-on-surface">{String(insight.title || "Insight")}</p>
                      <p className="mt-2 text-sm leading-6 text-on-surface-variant">{String(insight.summary || "")}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid gap-4">
              <RecommendationList title="Technical scope" items={technicalScope} />
              <RecommendationList title="Email setup" items={emailSetup} />
              <RecommendationList title="SEO plan" items={seoPlan} />
              <RecommendationList title="Delivery notes" items={deliveryNotes} />
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
