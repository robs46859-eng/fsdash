import React, { useCallback, useEffect, useState } from "react";
import { Search, ScrollText, X, Clock, User, Building, Activity, ChevronRight } from "lucide-react";
import { buildEndpoint } from "../../../../lib/platform";
import { getOperatorAuthHeaders, getOperatorRequestCredentials } from "../../../../lib/operatorAuth";
import { StatusBadge } from "../components/common/StatusBadge";

// ── Types ─────────────────────────────────────────────────────────────────────

interface RequestTraceStage {
  stage: string;
  time: number;
  status_code?: number;
}

interface RequestLog {
  id: string;
  occurred_at: string;
  method: string;
  path: string;
  query_string: string | null;
  route_name: string | null;
  status_code: number;
  duration_ms: number;
  actor_email: string | null;
  tenant_id: string | null;
  request_summary: string | null;
  trace: RequestTraceStage[];
}

interface TenantOption {
  id: string;
  name: string;
}

// ── API helper ────────────────────────────────────────────────────────────────

async function apiCall<T>(
  path: string,
  params: Record<string, string | number | null> = {},
): Promise<T> {
  const query = Object.entries(params)
    .filter(([_, v]) => v !== null && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");
  
  const fullPath = query ? `${path}?${query}` : path;
  const endpoint = buildEndpoint(fullPath);
  if (!endpoint) throw new Error(`No endpoint configured for ${path}`);
  
  const response = await fetch(endpoint, {
    method: "GET",
    credentials: getOperatorRequestCredentials(),
    headers: {
      Accept: "application/json",
      ...getOperatorAuthHeaders(),
    },
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
      <div className="fixed right-0 top-0 z-50 h-screen w-[640px] overflow-y-auto border-l border-outline-variant/15 bg-surface shadow-2xl">
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

// ── Request Detail panel ───────────────────────────────────────────────────────

function RequestDetailPanel({
  requestId,
  onClose,
}: {
  requestId: string;
  onClose: () => void;
}) {
  const [request, setRequest] = useState<RequestLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiCall<RequestLog>(`/api/v1/requests/${requestId}`)
      .then((data) => {
        if (active) {
          setRequest(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load request detail.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [requestId]);

  return (
    <SidePanel title={`Request Detail: ${requestId}`} onClose={onClose}>
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-surface-container-high" />
          <div className="h-64 bg-surface-container-high" />
        </div>
      ) : error ? (
        <p className="text-sm text-on-surface-variant">{error}</p>
      ) : request ? (
        <div className="space-y-8">
          {/* Summary Row */}
          <div className="flex items-center gap-6 border border-outline-variant/15 bg-surface-container-low p-6">
            <div className={`flex h-12 w-12 items-center justify-center font-bold text-black ${
              request.status_code < 300 ? "bg-primary" : "bg-on-surface-variant"
            }`}>
              {request.status_code}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm font-bold text-on-surface truncate">
                {request.method} {request.path}
              </p>
              <p className="mt-1 text-xs text-on-surface-variant">
                {new Date(request.occurred_at).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Duration</p>
              <p className="mt-1 font-mono text-sm text-on-surface">{request.duration_ms}ms</p>
            </div>
          </div>

          {/* Context Grid */}
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { label: "Tenant ID", value: request.tenant_id ?? "Platform", icon: Building },
              { label: "Actor", value: request.actor_email ?? "Anonymous", icon: User },
              { label: "Route Name", value: request.route_name ?? "None", icon: Activity },
              { label: "Query", value: request.query_string ?? "Empty", icon: Search },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="bg-surface-container-low p-4 outline outline-1 -outline-offset-1 outline-outline-variant/15"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={12} className="text-primary" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    {label}
                  </p>
                </div>
                <p className="font-mono text-xs text-on-surface break-all">{value}</p>
              </div>
            ))}
          </div>

          {/* Trace Pipeline */}
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Execution Trace</p>
            <div className="relative space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-outline-variant/30">
              {request.trace.map((stage, idx) => (
                <div key={idx} className="relative pl-8">
                  <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full border border-outline-variant/30 bg-surface flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div className="flex items-center justify-between border border-outline-variant/15 bg-surface-container-low p-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-on-surface">{stage.stage}</span>
                    <span className="font-mono text-[10px] text-on-surface-variant">+{stage.time}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payload Summary */}
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Request Summary (PII Redacted)</p>
            <div className="bg-surface-container-low p-5 outline outline-1 -outline-offset-1 outline-outline-variant/15">
              <pre className="font-mono text-xs leading-6 text-on-surface-variant whitespace-pre-wrap">
                {request.request_summary || "No payload logged."}
              </pre>
            </div>
          </div>
        </div>
      ) : null}
    </SidePanel>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export const RequestsView = () => {
  const [requests, setRequests] = useState<RequestLog[]>([]);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filters
  const [tenantFilter, setTenantFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [limit, setLimit] = useState(50);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      apiCall<RequestLog[]>("/api/v1/requests", {
        tenant_id: tenantFilter,
        status_code: statusFilter,
        limit,
      }),
      apiCall<TenantOption[]>("/api/v1/tenants"),
    ])
      .then(([reqData, tenantData]) => {
        setRequests(reqData);
        setTenants(tenantData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load requests.");
        setLoading(false);
      });
  }, [tenantFilter, statusFilter, limit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12">
          <h1 className="mb-3 font-display text-2xl font-semibold uppercase tracking-tight text-on-surface">
            Requests
          </h1>
          <p className="font-medium text-on-surface-variant">
            Traceability for request flow, operator actions, and backend execution history.
          </p>
        </header>

        {/* Filters */}
        <div className="mb-8 glass-panel overflow-hidden">
          <div className="flex flex-wrap items-center gap-4 border-b border-outline-variant/15 bg-surface-container-low p-5">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Tenant
              </label>
              <select
                className="ds-input text-sm"
                value={tenantFilter}
                onChange={(e) => setTenantFilter(e.target.value)}
              >
                <option value="">All Tenants</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="w-40">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Status
              </label>
              <select
                className="ds-input text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="200">200 OK</option>
                <option value="201">201 Created</option>
                <option value="401">401 Unauthorized</option>
                <option value="403">403 Forbidden</option>
                <option value="404">404 Not Found</option>
                <option value="422">422 Validation Error</option>
                <option value="500">500 Server Error</option>
              </select>
            </div>
            <div className="w-24">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Limit
              </label>
              <select
                className="ds-input text-sm"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
              </select>
            </div>
            <div className="flex items-end self-end h-[38px]">
              <button
                type="button"
                onClick={loadData}
                className="bg-surface-container-high px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-on-surface hover:bg-surface-container-low transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="animate-pulse divide-y divide-outline-variant/15">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 px-8 py-6" />
              ))}
            </div>
          ) : error ? (
            <div className="px-8 py-10 text-sm text-on-surface-variant">{error}</div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center gap-4 px-8 py-16 text-on-surface-variant">
              <ScrollText size={40} strokeWidth={1} />
              <p className="text-sm font-bold uppercase tracking-widest">No requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-surface-container-low">
                    {["Method", "Path", "Tenant", "Status", "Duration", "Occurred"].map((h) => (
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
                  {requests.map((req) => (
                    <tr
                      key={req.id}
                      onClick={() => setSelectedId(req.id)}
                      className="cursor-pointer group transition-colors duration-150 hover:bg-surface-container-low/60"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-on-surface">{req.method}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 max-w-[300px]">
                          <span className="truncate font-mono text-xs text-primary">{req.path}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs uppercase tracking-widest text-on-surface-variant">
                          {tenants.find(t => t.id === req.tenant_id)?.name ?? (req.tenant_id || "Platform")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={req.status_code < 300 ? "active" : req.status_code >= 500 ? "error" : "disabled"} label={String(req.status_code)} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-on-surface">{req.duration_ms}ms</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-on-surface">
                            {new Date(req.occurred_at).toLocaleTimeString()}
                          </span>
                          <ChevronRight size={16} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedId !== null && (
        <RequestDetailPanel
          requestId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
};
