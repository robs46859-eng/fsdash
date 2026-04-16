import React, { FormEvent, useCallback, useEffect, useState } from "react";
import { ArrowRight, Plus, Search, Users, X } from "lucide-react";
import { buildEndpoint } from "../../../../lib/platform";
import { getOperatorAuthHeaders, getOperatorRequestCredentials } from "../../../../lib/operatorAuth";
import { StatusBadge } from "../components/common/StatusBadge";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TenantSummary {
  id: string;
  name: string;
  slug: string;
  status: string;
  billing_plan: string;
  monthly_budget_usd: number;
  member_count: number;
  api_key_count: number;
  created_at: string;
  archived_at: string | null;
}

interface TenantMember {
  id: string;
  tenant_id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface TenantDetail extends TenantSummary {
  seat_price_usd: number;
  usage_cap_requests: number | null;
  notes: string | null;
  members: TenantMember[];
  updated_at: string;
}

interface ProviderOption {
  id: string;
  name: string;
  display_name: string;
  api_format: string;
  enabled: boolean;
  models: string[];
}

interface TenantRoutingPrefs {
  tenant_id: string;
  provider_id: string | null;
  provider: { id: string; name: string; display_name: string } | null;
  model: string | null;
  fallback_enabled: boolean;
  fallback_provider_ids: string[];
}

// ── API helper ────────────────────────────────────────────────────────────────

async function apiCall<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const endpoint = buildEndpoint(path);
  if (!endpoint) throw new Error(`No endpoint configured for ${path}`);
  const response = await fetch(endpoint, {
    method: options.method ?? "GET",
    credentials: getOperatorRequestCredentials(),
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...getOperatorAuthHeaders(),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
  const data = await response.json().catch(() => undefined);
  if (!response.ok) {
    throw new Error(
      (data as { error?: { message?: string } } | undefined)?.error?.message ??
        `Request failed (HTTP ${response.status})`,
    );
  }
  return data as T;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Shared layout primitives ──────────────────────────────────────────────────

function SidePanel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 z-50 h-screen w-[480px] overflow-y-auto border-l border-outline-variant/15 bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-outline-variant/15 bg-surface-container-low px-6 py-5">
          <p className="font-display text-base font-semibold uppercase tracking-tight text-on-surface">
            {title}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:bg-surface-container-high"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </>
  );
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
        {label}
        {hint && (
          <span className="ml-2 font-normal normal-case tracking-normal text-on-surface-variant">
            ({hint})
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass-panel p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{label}</p>
      <p className="mt-3 font-display text-2xl font-semibold text-on-surface">{value}</p>
    </div>
  );
}

// ── Create Tenant panel ───────────────────────────────────────────────────────

function CreateTenantPanel({
  onCreated,
  onClose,
}: {
  onCreated: (tenant: TenantDetail) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [plan, setPlan] = useState("starter");
  const [budget, setBudget] = useState("0");
  const [usageCap, setUsageCap] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(toSlug(value));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const tenant = await apiCall<TenantDetail>("/api/v1/tenants", {
        method: "POST",
        body: {
          name,
          slug,
          billing_plan: plan,
          monthly_budget_usd: parseFloat(budget) || 0,
          ...(usageCap ? { usage_cap_requests: parseInt(usageCap, 10) } : {}),
          ...(notes ? { notes } : {}),
        },
      });
      onCreated(tenant);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create tenant.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SidePanel title="Provision Tenant" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Name">
          <input
            className="ds-input"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Slug" hint="URL-safe identifier">
          <input
            className="ds-input font-mono"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            required
            pattern="[a-z0-9-]+"
            title="Lowercase letters, numbers, and hyphens only"
          />
        </FormField>
        <FormField label="Billing Plan">
          <select
            className="ds-input"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
          >
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="studio">Studio</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </FormField>
        <FormField label="Monthly Budget (USD)">
          <input
            className="ds-input"
            type="number"
            min="0"
            step="0.01"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </FormField>
        <FormField label="Usage Cap" hint="requests, optional">
          <input
            className="ds-input"
            type="number"
            min="0"
            value={usageCap}
            onChange={(e) => setUsageCap(e.target.value)}
            placeholder="Unlimited"
          />
        </FormField>
        <FormField label="Notes" hint="optional">
          <textarea
            className="ds-input min-h-[80px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </FormField>
        {error && <p className="text-sm text-on-surface-variant">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary inline-flex w-full items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.22em]"
        >
          {submitting ? "Provisioning…" : "Provision Tenant"}
          <ArrowRight size={14} />
        </button>
      </form>
    </SidePanel>
  );
}

// ── Tenant Detail panel ───────────────────────────────────────────────────────

function TenantDetailPanel({
  tenantId,
  onUpdated,
  onArchived,
  onClose,
}: {
  tenantId: string;
  onUpdated: (tenant: TenantDetail) => void;
  onArchived: (tenantId: string) => void;
  onClose: () => void;
}) {
  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("member");
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [archiving, setArchiving] = useState(false);

  // Provider preference state
  const [providerPrefs, setProviderPrefs] = useState<TenantRoutingPrefs | null>(null);
  const [availableProviders, setAvailableProviders] = useState<ProviderOption[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsError, setPrefsError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      apiCall<TenantDetail>(`/api/v1/tenants/${tenantId}`),
      apiCall<TenantRoutingPrefs>(`/api/v1/tenants/${tenantId}/provider-prefs`),
      apiCall<{ providers: ProviderOption[] }>("/api/v1/providers"),
    ])
      .then(([tenantData, prefs, providersData]) => {
        if (active) {
          setTenant(tenantData);
          setProviderPrefs(prefs);
          setAvailableProviders(providersData.providers.filter((p) => p.enabled));
          setSelectedProviderId(prefs.provider_id ?? "");
          setSelectedModel(prefs.model ?? "");
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load tenant.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [tenantId]);

  async function handleAddMember(e: FormEvent) {
    e.preventDefault();
    setAddingMember(true);
    setMemberError("");
    try {
      await apiCall(`/api/v1/tenants/${tenantId}/members`, {
        method: "POST",
        body: { email: memberEmail, role: memberRole },
      });
      const updated = await apiCall<TenantDetail>(`/api/v1/tenants/${tenantId}`);
      setTenant(updated);
      onUpdated(updated);
      setMemberEmail("");
    } catch (err) {
      setMemberError(err instanceof Error ? err.message : "Failed to add member.");
    } finally {
      setAddingMember(false);
    }
  }

  async function handleSaveProviderPrefs(e: FormEvent) {
    e.preventDefault();
    setSavingPrefs(true);
    setPrefsError("");
    try {
      const updated = await apiCall<TenantRoutingPrefs>(
        `/api/v1/tenants/${tenantId}/provider-prefs`,
        {
          method: "PUT",
          body: {
            provider_id: selectedProviderId || null,
            model: selectedModel || null,
            fallback_enabled: false,
            fallback_provider_ids: [],
          },
        },
      );
      setProviderPrefs(updated);
    } catch (err) {
      setPrefsError(err instanceof Error ? err.message : "Failed to save preferences.");
    } finally {
      setSavingPrefs(false);
    }
  }

  async function handleArchive() {
    if (!window.confirm(`Archive "${tenant?.name}"? This cannot be undone.`)) return;
    setArchiving(true);
    try {
      await apiCall(`/api/v1/tenants/${tenantId}/archive`, { method: "POST" });
      onArchived(tenantId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Archive failed.");
      setArchiving(false);
    }
  }

  const title = tenant?.name ?? "Tenant";

  return (
    <SidePanel title={title} onClose={onClose}>
      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-48 bg-surface-container-high" />
          <div className="h-24 bg-surface-container-high" />
          <div className="h-24 bg-surface-container-high" />
        </div>
      ) : error ? (
        <p className="text-sm text-on-surface-variant">{error}</p>
      ) : tenant ? (
        <div className="space-y-8">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { label: "Slug", value: tenant.slug },
              { label: "Status", value: tenant.status },
              { label: "Plan", value: tenant.billing_plan },
              { label: "Budget", value: `$${tenant.monthly_budget_usd}/mo` },
              { label: "Usage Cap", value: tenant.usage_cap_requests ?? "Unlimited" },
              { label: "API Keys", value: String(tenant.api_key_count) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-surface-container-low p-4 outline outline-1 -outline-offset-1 outline-outline-variant/15"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  {label}
                </p>
                <p className="mt-2 font-mono text-sm text-on-surface">{String(value)}</p>
              </div>
            ))}
          </div>

          {tenant.notes && (
            <div className="bg-surface-container-low p-4 outline outline-1 -outline-offset-1 outline-outline-variant/15">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Notes
              </p>
              <p className="text-sm leading-6 text-on-surface-variant">{tenant.notes}</p>
            </div>
          )}

          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Members ({tenant.member_count})
            </p>
            {tenant.members.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No members yet.</p>
            ) : (
              <div className="divide-y divide-outline-variant/15 border border-outline-variant/15">
                {tenant.members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{m.email}</p>
                      <p className="text-xs text-on-surface-variant">
                        {m.role} · {m.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddMember} className="mt-4 flex gap-2">
              <input
                className="ds-input flex-1 text-sm"
                type="email"
                placeholder="member@example.com"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                required
              />
              <select
                className="ds-input w-28 text-sm"
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value)}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
              <button
                type="submit"
                disabled={addingMember}
                className="btn-primary text-xs font-bold uppercase tracking-[0.2em]"
              >
                {addingMember ? "…" : "Add"}
              </button>
            </form>
            {memberError && (
              <p className="mt-2 text-sm text-on-surface-variant">{memberError}</p>
            )}
          </div>

          {/* Provider preferences */}
          <div className="border-t border-outline-variant/15 pt-6">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              AI Provider
            </p>
            {providerPrefs?.provider && (
              <div className="mb-4 flex items-center gap-3 rounded-sm bg-primary/5 px-4 py-3 outline outline-1 -outline-offset-1 outline-primary/20">
                <div className="text-xs text-on-surface-variant">Currently using</div>
                <div className="font-semibold text-sm text-on-surface">
                  {providerPrefs.provider.display_name}
                  {providerPrefs.model && (
                    <span className="ml-2 font-mono text-[11px] text-on-surface-variant">
                      {providerPrefs.model}
                    </span>
                  )}
                </div>
              </div>
            )}
            <form onSubmit={handleSaveProviderPrefs} className="space-y-4">
              <FormField label="Provider">
                <select
                  className="ds-input w-full text-sm"
                  value={selectedProviderId}
                  onChange={(e) => {
                    setSelectedProviderId(e.target.value);
                    setSelectedModel("");
                  }}
                >
                  <option value="">— Use platform default —</option>
                  {availableProviders.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.display_name}
                    </option>
                  ))}
                </select>
              </FormField>
              {selectedProviderId && (
                <FormField label="Model" hint="leave blank for provider default">
                  {(() => {
                    const provider = availableProviders.find((p) => p.id === selectedProviderId);
                    const models = provider?.models ?? [];
                    return models.length > 0 ? (
                      <select
                        className="ds-input w-full text-sm"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                      >
                        <option value="">— Default —</option>
                        {models.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="ds-input w-full text-sm font-mono"
                        placeholder="model-id"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                      />
                    );
                  })()}
                </FormField>
              )}
              {prefsError && (
                <p className="text-sm text-on-surface-variant">{prefsError}</p>
              )}
              {availableProviders.length === 0 && (
                <p className="text-xs text-on-surface-variant">
                  No providers are enabled. Enable providers in the Providers section first.
                </p>
              )}
              <button
                type="submit"
                disabled={savingPrefs}
                className="btn-primary text-xs font-bold uppercase tracking-[0.2em]"
              >
                {savingPrefs ? "Saving…" : "Save provider"}
              </button>
            </form>
          </div>

          {tenant.status !== "archived" && (
            <div className="border-t border-outline-variant/15 pt-6">
              <button
                type="button"
                disabled={archiving}
                onClick={handleArchive}
                className="px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant outline outline-1 outline-outline-variant/40 transition-colors hover:bg-surface-container-high"
              >
                {archiving ? "Archiving…" : "Archive Tenant"}
              </button>
              <p className="mt-2 text-xs text-on-surface-variant">
                Archived tenants are hidden from the active list.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </SidePanel>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export const TenantsView = () => {
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");
  const [panel, setPanel] = useState<"closed" | "create" | "detail">("closed");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadTenants = useCallback(() => {
    setLoading(true);
    apiCall<TenantSummary[]>("/api/v1/tenants")
      .then((data) => {
        setTenants(data);
        setLoading(false);
      })
      .catch((err) => {
        setFetchError(err instanceof Error ? err.message : "Failed to load tenants.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const filtered = tenants.filter(
    (t) =>
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.includes(search.toLowerCase()),
  );

  const activeCount = tenants.filter((t) => t.status === "active").length;
  const totalMembers = tenants.reduce((sum, t) => sum + (t.member_count ?? 0), 0);

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 flex items-end justify-between">
          <div>
            <h1 className="mb-3 font-display text-2xl font-semibold uppercase tracking-tight text-on-surface">
              Tenants
            </h1>
            <p className="font-medium text-on-surface-variant">
              Manage organizational isolation and governance boundaries.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPanel("create")}
            className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em]"
          >
            <Plus size={16} />
            Provision Tenant
          </button>
        </header>

        <div className="mb-8 grid grid-cols-3 gap-6">
          <StatCard label="Total Tenants" value={loading ? "—" : tenants.length} />
          <StatCard label="Active" value={loading ? "—" : activeCount} />
          <StatCard label="Total Members" value={loading ? "—" : totalMembers} />
        </div>

        <div className="glass-panel overflow-hidden">
          <div className="flex items-center gap-4 border-b border-outline-variant/15 bg-surface-container-low p-5">
            <div className="relative flex-1">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              />
              <input
                type="text"
                placeholder="Filter by name or slug…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ds-input w-full pl-9 text-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="animate-pulse divide-y divide-outline-variant/15">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 px-8 py-6" />
              ))}
            </div>
          ) : fetchError ? (
            <div className="px-8 py-10 text-sm text-on-surface-variant">{fetchError}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 px-8 py-16 text-on-surface-variant">
              <Users size={40} strokeWidth={1} />
              <p className="text-sm font-bold uppercase tracking-widest">
                {search ? "No matching tenants" : "No tenants yet"}
              </p>
              {!search && (
                <button
                  type="button"
                  onClick={() => setPanel("create")}
                  className="btn-primary text-xs font-bold uppercase tracking-[0.22em]"
                >
                  Provision First Tenant
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-surface-container-low">
                    {["Organization", "Slug", "Plan", "Status", "Members", "API Keys"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15">
                  {filtered.map((tenant) => (
                    <tr
                      key={tenant.id}
                      onClick={() => {
                        setSelectedId(tenant.id);
                        setPanel("detail");
                      }}
                      className="cursor-pointer transition-colors duration-150 hover:bg-surface-container-low/60"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center border border-outline-variant/15 bg-surface-container-high text-xs font-bold text-on-surface">
                            {tenant.name[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-on-surface">
                            {tenant.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-mono text-xs text-primary">{tenant.slug}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs uppercase tracking-widest text-on-surface-variant">
                          {tenant.billing_plan}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={tenant.status} />
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-on-surface">{tenant.member_count}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-on-surface">{tenant.api_key_count}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {panel === "create" && (
        <CreateTenantPanel
          onCreated={(tenant) => {
            setTenants((prev) => [tenant, ...prev]);
            setPanel("closed");
          }}
          onClose={() => setPanel("closed")}
        />
      )}
      {panel === "detail" && selectedId !== null && (
        <TenantDetailPanel
          tenantId={selectedId}
          onUpdated={(updated) => {
            setTenants((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          }}
          onArchived={(id) => {
            setTenants((prev) =>
              prev.map((t) => (t.id === id ? { ...t, status: "archived" } : t)),
            );
          }}
          onClose={() => setPanel("closed")}
        />
      )}
    </div>
  );
};
