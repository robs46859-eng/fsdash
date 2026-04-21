import React, { useEffect, useState } from "react";
import { Shield, Lock, EyeOff, Globe, AlertTriangle, ShieldCheck, Fingerprint } from "lucide-react";
import { buildEndpoint } from "../../../../lib/platform";
import { getOperatorAuthHeaders, getOperatorRequestCredentials } from "../../../../lib/operatorAuth";
import { StatusBadge } from "../components/common/StatusBadge";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SecuritySummary {
  auth_mode: string;
  trust_upstream_auth: boolean;
  pii_redaction_enabled: boolean;
  secure_cookies: boolean;
  same_site: string;
  allowed_origins: string[];
  provider_secret_exposure: string;
  unsupported: {
    inline_dlp_scanning: boolean;
    managed_kms: boolean;
  };
}

// ── API helper ────────────────────────────────────────────────────────────────

async function apiCall<T>(path: string): Promise<T> {
  const endpoint = buildEndpoint(path);
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

function SecurityCard({ 
  title, 
  value, 
  status, 
  icon: Icon,
  description 
}: { 
  title: string; 
  value: string | boolean; 
  status?: "active" | "disabled" | "error";
  icon: React.ElementType;
  description: string;
}) {
  return (
    <div className="glass-panel p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex h-10 w-10 items-center justify-center bg-surface-container-high text-primary outline outline-1 outline-outline-variant/15">
          <Icon size={18} />
        </div>
        {status && <StatusBadge status={status} />}
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{title}</p>
      <p className="mt-2 font-display text-xl font-semibold text-on-surface">
        {typeof value === "boolean" ? (value ? "Enabled" : "Disabled") : value}
      </p>
      <p className="mt-2 text-xs leading-5 text-on-surface-variant">{description}</p>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export const SecurityView = () => {
  const [security, setSecurity] = useState<SecuritySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiCall<SecuritySummary>("/api/v1/security")
      .then((data) => {
        if (active) {
          setSecurity(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load security posture.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-10">
        <div className="mx-auto max-w-6xl animate-pulse space-y-8">
          <div className="h-20 w-1/2 bg-surface-container-high" />
          <div className="grid grid-cols-3 gap-6">
            <div className="h-40 bg-surface-container-high" />
            <div className="h-40 bg-surface-container-high" />
            <div className="h-40 bg-surface-container-high" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !security) {
    return (
      <div className="flex-1 p-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-on-surface-variant">{error || "Security posture unavailable."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12">
          <h1 className="mb-3 font-display text-2xl font-semibold uppercase tracking-tight text-on-surface">
            Security & Policy
          </h1>
          <p className="font-medium text-on-surface-variant">
            Platform-wide security posture, auth policy, and data redaction controls.
          </p>
        </header>

        {/* Top Posture Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <SecurityCard 
            title="Auth Mode" 
            value={security.auth_mode} 
            icon={Lock}
            status={security.auth_mode === "external" ? "active" : "disabled"}
            description="Controls how operator sessions are authenticated and validated."
          />
          <SecurityCard 
            title="PII Redaction" 
            value={security.pii_redaction_enabled} 
            icon={EyeOff}
            status={security.pii_redaction_enabled ? "active" : "disabled"}
            description="Automatic masking of sensitive tokens and data in request logs."
          />
          <SecurityCard 
            title="CORS Policy" 
            value={`${security.allowed_origins.length} Origins`} 
            icon={Globe}
            status="active"
            description="Whitelisted origins allowed to interface with the FullStack API."
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            {/* Auth Posture Section */}
            <div className="glass-panel p-8">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck size={20} className="text-primary" />
                <h2 className="font-display text-lg font-semibold uppercase tracking-tight text-on-surface">Auth Posture</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-outline-variant/15 pb-4">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">Trust Upstream Auth</p>
                    <p className="text-xs text-on-surface-variant">Rely on proxy/gateway headers for operator identity.</p>
                  </div>
                  <StatusBadge status={security.trust_upstream_auth ? "active" : "disabled"} />
                </div>
                <div className="flex items-center justify-between border-b border-outline-variant/15 pb-4">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">Secure Cookies</p>
                    <p className="text-xs text-on-surface-variant">Session cookies require HTTPS and SameSite enforcement.</p>
                  </div>
                  <StatusBadge status={security.secure_cookies ? "active" : "disabled"} />
                </div>
                <div className="flex items-center justify-between pb-2">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">SameSite Policy</p>
                    <p className="text-xs text-on-surface-variant">Strictness level for cross-site cookie transmission.</p>
                  </div>
                  <span className="font-mono text-xs uppercase text-primary">{security.same_site}</span>
                </div>
              </div>
            </div>

            {/* Data Privacy & Redaction */}
            <div className="glass-panel p-8">
              <div className="flex items-center gap-3 mb-6">
                <Fingerprint size={20} className="text-primary" />
                <h2 className="font-display text-lg font-semibold uppercase tracking-tight text-on-surface">Data Privacy</h2>
              </div>
              <div className="bg-surface-container-low p-5 outline outline-1 -outline-offset-1 outline-outline-variant/15 mb-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">Secret Exposure Policy</p>
                <p className="text-sm text-on-surface-variant italic">"{security.provider_secret_exposure}"</p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="border border-outline-variant/15 p-4 bg-surface-container-low">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2">DLP Scanning</p>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-on-surface-variant" />
                    <span className="text-xs text-on-surface-variant">Inline Scanning Not Available</span>
                  </div>
                </div>
                <div className="border border-outline-variant/15 p-4 bg-surface-container-low">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2">Managed KMS</p>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-on-surface-variant" />
                    <span className="text-xs text-on-surface-variant">Local Key Management Only</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operator Guidance */}
          <div className="glass-panel p-8 bg-surface-container-low">
            <h2 className="mb-6 font-display text-lg font-semibold uppercase tracking-tight text-on-surface">Operator Guidance</h2>
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Key Rotation</p>
                <p className="text-xs leading-5 text-on-surface-variant">
                  Platform API keys should be rotated every 90 days. Check the API Keys surface for keys created before {new Date(Date.now() - 90*24*60*60*1000).toLocaleDateString()}.
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Auth Best Practices</p>
                <p className="text-xs leading-5 text-on-surface-variant">
                  If running in production, ensure <code className="text-primary">FULLSTACK_AUTH_MODE=external</code> and 
                  <code className="text-primary">TRUST_UPSTREAM_AUTH=true</code> are configured behind a secure identity proxy.
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Redaction Scope</p>
                <p className="text-xs leading-5 text-on-surface-variant">
                  Current redaction rules mask fields matching <code className="text-primary">token, secret, key, password</code> in all request summaries and trace logs.
                </p>
              </div>
              <div className="pt-6 border-t border-outline-variant/15">
                <p className="text-xs text-on-surface-variant mb-4">
                  Need to update these settings? Policies are driven by environment variables in the <code className="text-primary">fs-ai</code> backend.
                </p>
                <a 
                  href="/app/settings" 
                  className="inline-block bg-primary px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-black"
                >
                  View Env Vars
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
