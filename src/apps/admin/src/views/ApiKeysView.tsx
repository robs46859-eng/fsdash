import React, { FormEvent, useCallback, useEffect, useState } from "react";
import { Copy, KeyRound, Plus, RefreshCw, Search, Trash2, X, Check, Eye, EyeOff } from "lucide-react";
import { buildEndpoint } from "../../../../lib/platform";
import { getOperatorAuthHeaders, getOperatorRequestCredentials } from "../../../../lib/operatorAuth";
import { StatusBadge } from "../components/common/StatusBadge";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ApiKey {
  id: string;
  tenant_id: string | null;
  label: string;
  key_prefix: string;
  status: "active" | "disabled" | "revoked";
  created_by: string;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
  scopes: string[];
  plaintext_key?: string; // Only present on create/rotate
}

interface TenantOption {
  id: string;
  name: string;
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

// ── Create API Key panel ───────────────────────────────────────────────────────

function CreateApiKeyPanel({
  tenants,
  onCreated,
  onClose,
}: {
  tenants: TenantOption[];
  onCreated: (key: ApiKey) => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [scopes, setScopes] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdKey, setCreatedKey] = useState<ApiKey | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const key = await apiCall<ApiKey>("/api/v1/api-keys", {
        method: "POST",
        body: {
          label,
          tenant_id: tenantId || null,
          scopes,
          expires_at: expiresAt || null,
        },
      });
      setCreatedKey(key);
      onCreated(key);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create API key.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopy() {
    if (createdKey?.plaintext_key) {
      navigator.clipboard.writeText(createdKey.plaintext_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (createdKey) {
    return (
      <SidePanel title="Key Created" onClose={onClose}>
        <div className="space-y-6">
          <div className="rounded-sm bg-primary/10 p-5 outline outline-1 -outline-offset-1 outline-primary/20">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Plaintext Key
            </p>
            <p className="mt-2 text-xs text-on-surface-variant">
              Copy this key now. It will not be shown again.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 truncate bg-surface-container-high p-3 font-mono text-sm text-on-surface">
                {createdKey.plaintext_key}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex h-10 w-10 items-center justify-center bg-primary text-black transition-opacity hover:opacity-90"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-surface-container-low p-4 outline outline-1 -outline-offset-1 outline-outline-variant/15">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Label</p>
              <p className="mt-1 text-sm text-on-surface">{createdKey.label}</p>
            </div>
            <div className="bg-surface-container-low p-4 outline outline-1 -outline-offset-1 outline-outline-variant/15">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">ID</p>
              <p className="mt-1 font-mono text-xs text-on-surface">{createdKey.id}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-primary w-full text-xs font-bold uppercase tracking-[0.22em]"
          >
            I have saved the key
          </button>
        </div>
      </SidePanel>
    );
  }

  return (
    <SidePanel title="Generate API Key" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Label" hint="e.g. Production Web App">
          <input
            className="ds-input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            placeholder="Production Web App"
          />
        </FormField>
        <FormField label="Tenant Association" hint="optional">
          <select
            className="ds-input"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
          >
            <option value="">— Platform Key (No tenant) —</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Expires At" hint="ISO-8601, optional">
          <input
            className="ds-input"
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </FormField>
        {error && <p className="text-sm text-on-surface-variant">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary inline-flex w-full items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.22em]"
        >
          {submitting ? "Generating…" : "Generate API Key"}
          <KeyRound size={14} />
        </button>
      </form>
    </SidePanel>
  );
}

// ── API Key Detail panel ───────────────────────────────────────────────────────

function ApiKeyDetailPanel({
  keyId,
  onUpdated,
  onClose,
}: {
  keyId: string;
  onUpdated: (key: ApiKey) => void;
  onClose: () => void;
}) {
  const [key, setKey] = useState<ApiKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionPending, setActionPending] = useState(false);
  const [rotatedKey, setRotatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiCall<ApiKey>(`/api/v1/api-keys/${keyId}`)
      .then((data) => {
        if (active) {
          setKey(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load key.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [keyId]);

  async function handleStatusChange(status: "active" | "disabled" | "revoked") {
    const action = status === "revoked" ? "revoke" : status === "disabled" ? "disable" : "enable";
    if (status === "revoked" && !window.confirm("Revoke this key? It cannot be reactivated.")) return;
    
    setActionPending(true);
    try {
      const updated = await apiCall<ApiKey>(`/api/v1/api-keys/${keyId}/${action}`, { method: "POST" });
      setKey(updated);
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setActionPending(false);
    }
  }

  async function handleRotate() {
    if (!window.confirm("Rotate this key? The existing key will remain valid until the prefix changes.")) return;
    setActionPending(true);
    try {
      const updated = await apiCall<ApiKey>(`/api/v1/api-keys/${keyId}/rotate`, { method: "POST" });
      setKey(updated);
      setRotatedKey(updated.plaintext_key ?? null);
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rotation failed.");
    } finally {
      setActionPending(false);
    }
  }

  function handleCopy() {
    if (rotatedKey) {
      navigator.clipboard.writeText(rotatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <SidePanel title={key?.label ?? "API Key"} onClose={onClose}>
      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-48 bg-surface-container-high" />
          <div className="h-24 bg-surface-container-high" />
        </div>
      ) : error ? (
        <p className="text-sm text-on-surface-variant">{error}</p>
      ) : key ? (
        <div className="space-y-8">
          {rotatedKey && (
            <div className="rounded-sm bg-primary/10 p-5 outline outline-1 -outline-offset-1 outline-primary/20">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                New Plaintext Key
              </p>
              <p className="mt-2 text-xs text-on-surface-variant">
                Copy this new key now.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 truncate bg-surface-container-high p-3 font-mono text-sm text-on-surface">
                  {rotatedKey}
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex h-10 w-10 items-center justify-center bg-primary text-black transition-opacity hover:opacity-90"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            {[
              { label: "ID", value: key.id },
              { label: "Prefix", value: `${key.key_prefix}...` },
              { label: "Status", value: key.status },
              { label: "Tenant ID", value: key.tenant_id ?? "Platform" },
              { label: "Created By", value: key.created_by },
              { label: "Last Used", value: key.last_used_at ?? "Never" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-surface-container-low p-4 outline outline-1 -outline-offset-1 outline-outline-variant/15"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  {label}
                </p>
                <p className="mt-2 font-mono text-xs text-on-surface">{value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Actions</p>
            
            <div className="flex flex-wrap gap-3">
              {key.status === "active" ? (
                <button
                  type="button"
                  disabled={actionPending}
                  onClick={() => handleStatusChange("disabled")}
                  className="bg-surface-container-high px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-on-surface hover:bg-surface-container-low"
                >
                  Disable Key
                </button>
              ) : key.status === "disabled" ? (
                <button
                  type="button"
                  disabled={actionPending}
                  onClick={() => handleStatusChange("active")}
                  className="bg-primary px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black"
                >
                  Enable Key
                </button>
              ) : null}

              {key.status !== "revoked" && (
                <>
                  <button
                    type="button"
                    disabled={actionPending}
                    onClick={handleRotate}
                    className="flex items-center gap-2 bg-surface-container-high px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-on-surface hover:bg-surface-container-low"
                  >
                    <RefreshCw size={14} className={actionPending ? "animate-spin" : ""} />
                    Rotate
                  </button>
                  <button
                    type="button"
                    disabled={actionPending}
                    onClick={() => handleStatusChange("revoked")}
                    className="flex items-center gap-2 bg-surface-container-high px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant hover:bg-surface-container-low"
                  >
                    <Trash2 size={14} />
                    Revoke
                  </button>
                </>
              )}
            </div>
            {key.status === "revoked" && (
              <p className="text-sm text-on-surface-variant">
                This key has been revoked and can no longer be used.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </SidePanel>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export const ApiKeysView = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");
  const [panel, setPanel] = useState<"closed" | "create" | "detail">("closed");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      apiCall<ApiKey[]>("/api/v1/api-keys"),
      apiCall<TenantOption[]>("/api/v1/tenants"),
    ])
      .then(([keysData, tenantsData]) => {
        setKeys(keysData);
        setTenants(tenantsData);
        setLoading(false);
      })
      .catch((err) => {
        setFetchError(err instanceof Error ? err.message : "Failed to load API keys.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = keys.filter(
    (k) =>
      !search ||
      k.label.toLowerCase().includes(search.toLowerCase()) ||
      k.id.includes(search.toLowerCase()) ||
      k.tenant_id?.includes(search.toLowerCase()),
  );

  const activeCount = keys.filter((k) => k.status === "active").length;
  const platformKeys = keys.filter((k) => !k.tenant_id).length;

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 flex items-end justify-between">
          <div>
            <h1 className="mb-3 font-display text-2xl font-semibold uppercase tracking-tight text-on-surface">
              API Keys
            </h1>
            <p className="font-medium text-on-surface-variant">
              Manage platform and tenant-scoped access credentials.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPanel("create")}
            className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em]"
          >
            <Plus size={16} />
            Generate Key
          </button>
        </header>

        <div className="mb-8 grid grid-cols-3 gap-6">
          <StatCard label="Total Keys" value={loading ? "—" : keys.length} />
          <StatCard label="Active" value={loading ? "—" : activeCount} />
          <StatCard label="Platform Scoped" value={loading ? "—" : platformKeys} />
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
                placeholder="Filter by label, ID, or tenant…"
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
              <KeyRound size={40} strokeWidth={1} />
              <p className="text-sm font-bold uppercase tracking-widest">
                {search ? "No matching keys" : "No API keys yet"}
              </p>
              {!search && (
                <button
                  type="button"
                  onClick={() => setPanel("create")}
                  className="btn-primary text-xs font-bold uppercase tracking-[0.22em]"
                >
                  Generate First Key
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-surface-container-low">
                    {["Label", "Prefix", "Tenant", "Status", "Last Used", "Created"].map((h) => (
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
                  {filtered.map((k) => (
                    <tr
                      key={k.id}
                      onClick={() => {
                        setSelectedId(k.id);
                        setPanel("detail");
                      }}
                      className="cursor-pointer transition-colors duration-150 hover:bg-surface-container-low/60"
                    >
                      <td className="px-6 py-5">
                        <span className="text-sm font-semibold text-on-surface">
                          {k.label}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="font-mono text-xs text-primary">{k.key_prefix}...</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs uppercase tracking-widest text-on-surface-variant">
                          {tenants.find(t => t.id === k.tenant_id)?.name ?? (k.tenant_id ? k.tenant_id : "Platform")}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={k.status} />
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-on-surface">
                          {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "Never"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-on-surface">
                          {new Date(k.created_at).toLocaleDateString()}
                        </span>
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
        <CreateApiKeyPanel
          tenants={tenants}
          onCreated={(key) => {
            setKeys((prev) => [key, ...prev]);
          }}
          onClose={() => setPanel("closed")}
        />
      )}
      {panel === "detail" && selectedId !== null && (
        <ApiKeyDetailPanel
          keyId={selectedId}
          onUpdated={(updated) => {
            setKeys((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
          }}
          onClose={() => setPanel("closed")}
        />
      )}
    </div>
  );
};
