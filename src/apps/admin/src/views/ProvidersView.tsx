import React, { FormEvent, useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Cpu,
  Globe,
  KeyRound,
  Layers,
  Plus,
  Search,
  Settings2,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { buildEndpoint } from "../../../../lib/platform";
import { getOperatorAuthHeaders, getOperatorRequestCredentials } from "../../../../lib/operatorAuth";
import { StatusBadge } from "../components/common/StatusBadge";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Provider {
  id: string;
  name: string;
  display_name: string;
  api_format: "openai-compatible" | "anthropic";
  base_url: string;
  path: string;
  auth_header: string;
  auth_scheme: string;
  models: string[];
  capabilities: string[];
  enabled: boolean;
  is_builtin: boolean;
  api_key_configured: boolean;
  timeout_seconds: number;
  retries: number;
  created_at: string;
  updated_at: string;
}

interface ProvidersResponse {
  providers: Provider[];
  total: number;
  enabled_count: number;
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
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => undefined);
  if (!response.ok) {
    throw new Error(
      (data as { error?: { message?: string } } | undefined)?.error?.message ??
        `HTTP ${response.status}`,
    );
  }
  return data as T;
}

// ── Capability chips ─────────────────────────────────────────────────────────

const CAPABILITY_LABELS: Record<string, string> = {
  chat: "Chat",
  vision: "Vision",
  "function-calling": "Tools",
  "json-mode": "JSON Mode",
  "extended-thinking": "Thinking",
  "long-context": "Long Context",
  "web-search": "Web Search",
  citations: "Citations",
  rag: "RAG",
  coding: "Coding",
  reasoning: "Reasoning",
  "ultra-fast-inference": "Ultra Fast",
  "fast-inference": "Fast",
  "gpu-accelerated": "GPU",
  "open-source": "Open Source",
  local: "Local",
  offline: "Offline",
  aggregator: "Aggregator",
  "model-routing": "Multi-Model",
  enterprise: "Enterprise",
  search: "Search",
};

function CapabilityChip({ cap }: { cap: string }) {
  const label = CAPABILITY_LABELS[cap] ?? cap;
  return (
    <span className="inline-flex items-center rounded-sm bg-surface-container px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant outline outline-1 -outline-offset-1 outline-outline-variant/20">
      {label}
    </span>
  );
}

// ── Provider icon (initials) ──────────────────────────────────────────────────

const PROVIDER_COLORS: Record<string, string> = {
  openai: "bg-emerald-500/15 text-emerald-400",
  anthropic: "bg-amber-500/15 text-amber-400",
  "google-gemini": "bg-blue-500/15 text-blue-400",
  mistral: "bg-violet-500/15 text-violet-400",
  groq: "bg-orange-500/15 text-orange-400",
  "together-ai": "bg-cyan-500/15 text-cyan-400",
  perplexity: "bg-teal-500/15 text-teal-400",
  cohere: "bg-rose-500/15 text-rose-400",
  deepseek: "bg-sky-500/15 text-sky-400",
  "fireworks-ai": "bg-red-500/15 text-red-400",
  openrouter: "bg-purple-500/15 text-purple-400",
  xai: "bg-zinc-500/15 text-zinc-300",
  "nvidia-nim": "bg-green-500/15 text-green-400",
  "azure-openai": "bg-blue-700/15 text-blue-300",
  ollama: "bg-stone-500/15 text-stone-300",
};

function ProviderIcon({ provider }: { provider: Provider }) {
  const colorClass = PROVIDER_COLORS[provider.name] ?? "bg-surface-container text-on-surface-variant";
  const initials = provider.display_name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-sm text-xs font-bold ${colorClass}`}
    >
      {initials}
    </div>
  );
}

// ── Side panel shell ─────────────────────────────────────────────────────────

function SidePanel({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative ml-auto flex h-full w-full max-w-xl flex-col bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-outline-variant/15 px-6 py-5">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center text-on-surface-variant hover:text-on-surface"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ── Form helpers ─────────────────────────────────────────────────────────────

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
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-on-surface-variant/60">{hint}</p>}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-sm border-0 bg-surface-container px-3 py-2 font-mono text-sm text-on-surface outline outline-1 -outline-offset-1 outline-outline-variant/20 placeholder:text-on-surface-variant/40 focus:outline-primary"
    />
  );
}

// ── Provider detail / edit panel ─────────────────────────────────────────────

interface ProviderPanelProps {
  provider: Provider;
  onClose: () => void;
  onUpdated: (p: Provider) => void;
  onDeleted: (id: string) => void;
}

function ProviderDetailPanel({ provider, onClose, onUpdated, onDeleted }: ProviderPanelProps) {
  const [displayName, setDisplayName] = useState(provider.display_name);
  const [baseUrl, setBaseUrl] = useState(provider.base_url);
  const [path, setPath] = useState(provider.path);
  const [authHeader, setAuthHeader] = useState(provider.auth_header);
  const [authScheme, setAuthScheme] = useState(provider.auth_scheme);
  const [apiKey, setApiKey] = useState("");
  const [modelsText, setModelsText] = useState(provider.models.join("\n"));
  const [capabilitiesText, setCapabilitiesText] = useState(provider.capabilities.join(", "));
  const [timeoutSeconds, setTimeoutSeconds] = useState(String(provider.timeout_seconds));
  const [retries, setRetries] = useState(String(provider.retries));
  const [apiFormat, setApiFormat] = useState<"openai-compatible" | "anthropic">(provider.api_format);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        display_name: displayName,
        api_format: apiFormat,
        base_url: baseUrl,
        path,
        auth_header: authHeader,
        auth_scheme: authScheme,
        models: modelsText.split("\n").map((m) => m.trim()).filter(Boolean),
        capabilities: capabilitiesText.split(",").map((c) => c.trim()).filter(Boolean),
        timeout_seconds: Number(timeoutSeconds),
        retries: Number(retries),
      };
      if (apiKey.trim()) body.api_key = apiKey.trim();
      const updated = await apiCall<Provider>(`/api/v1/providers/${provider.id}`, {
        method: "PATCH",
        body,
      });
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle() {
    setToggling(true);
    setError(null);
    try {
      const action = provider.enabled ? "disable" : "enable";
      const updated = await apiCall<Provider>(`/api/v1/providers/${provider.id}/${action}`, {
        method: "POST",
      });
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Toggle failed");
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${provider.display_name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await apiCall<void>(`/api/v1/providers/${provider.id}`, { method: "DELETE" });
      onDeleted(provider.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-0">
      {/* Header area */}
      <div className="border-b border-outline-variant/15 p-6">
        <div className="flex items-start gap-4">
          <ProviderIcon provider={provider} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-on-surface">{provider.display_name}</p>
            <p className="mt-0.5 font-mono text-[11px] text-on-surface-variant">{provider.name}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <StatusBadge status={provider.enabled ? "active" : "disabled"} />
              <span className="inline-flex items-center gap-1 rounded-sm bg-surface-container px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant outline outline-1 -outline-offset-1 outline-outline-variant/20">
                {provider.api_format}
              </span>
              {provider.is_builtin && (
                <span className="inline-flex items-center rounded-sm bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  Built-in
                </span>
              )}
              {provider.api_key_configured && (
                <span className="inline-flex items-center gap-1 rounded-sm bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                  <KeyRound size={10} /> Key set
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Enable/disable toggle */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={toggling}
          className="mt-4 flex w-full items-center justify-between rounded-sm bg-surface-container px-4 py-3 text-sm text-on-surface outline outline-1 -outline-offset-1 outline-outline-variant/20 hover:bg-surface-container-high disabled:opacity-50"
        >
          <span className="font-medium">{provider.enabled ? "Provider enabled" : "Provider disabled"}</span>
          {provider.enabled ? (
            <ToggleRight size={20} className="text-primary" />
          ) : (
            <ToggleLeft size={20} className="text-on-surface-variant" />
          )}
        </button>
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-5 p-6">
        <FormField label="Display name">
          <TextInput value={displayName} onChange={setDisplayName} required />
        </FormField>

        <FormField label="API format">
          <select
            value={apiFormat}
            onChange={(e) => setApiFormat(e.target.value as "openai-compatible" | "anthropic")}
            className="w-full rounded-sm bg-surface-container px-3 py-2 text-sm text-on-surface outline outline-1 -outline-offset-1 outline-outline-variant/20"
          >
            <option value="openai-compatible">OpenAI Compatible</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </FormField>

        <FormField label="Base URL" hint="e.g. https://api.openai.com">
          <TextInput value={baseUrl} onChange={setBaseUrl} placeholder="https://..." />
        </FormField>

        <FormField label="Path" hint="Completion endpoint path">
          <TextInput value={path} onChange={setPath} placeholder="/v1/chat/completions" />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Auth header">
            <TextInput value={authHeader} onChange={setAuthHeader} placeholder="Authorization" />
          </FormField>
          <FormField label="Auth scheme">
            <TextInput value={authScheme} onChange={setAuthScheme} placeholder="Bearer" />
          </FormField>
        </div>

        <FormField
          label="API key"
          hint={provider.api_key_configured ? "Key is set — enter a new value to replace it" : "Enter your API key to enable this provider"}
        >
          <TextInput
            value={apiKey}
            onChange={setApiKey}
            type="password"
            placeholder={provider.api_key_configured ? "••••••••••••••••" : "sk-..."}
          />
        </FormField>

        <FormField label="Models" hint="One model ID per line — first model is the default">
          <textarea
            value={modelsText}
            onChange={(e) => setModelsText(e.target.value)}
            rows={4}
            className="w-full rounded-sm bg-surface-container px-3 py-2 font-mono text-sm text-on-surface outline outline-1 -outline-offset-1 outline-outline-variant/20 placeholder:text-on-surface-variant/40 focus:outline-primary"
            placeholder="gpt-4o&#10;gpt-4o-mini"
          />
        </FormField>

        <FormField label="Capabilities" hint="Comma-separated tags (e.g. chat, vision, function-calling)">
          <TextInput
            value={capabilitiesText}
            onChange={setCapabilitiesText}
            placeholder="chat, vision, function-calling"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Timeout (seconds)">
            <TextInput value={timeoutSeconds} onChange={setTimeoutSeconds} type="number" />
          </FormField>
          <FormField label="Retries">
            <TextInput value={retries} onChange={setRetries} type="number" />
          </FormField>
        </div>

        {error && (
          <p className="rounded-sm bg-error/10 px-4 py-2 text-sm text-error">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-[0.15em] text-on-primary hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>

        {!provider.is_builtin && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center justify-center gap-2 text-sm text-error hover:text-error/80 disabled:opacity-50"
          >
            <Trash2 size={14} />
            {deleting ? "Deleting…" : "Delete provider"}
          </button>
        )}
      </div>
    </form>
  );
}

// ── Add provider panel ────────────────────────────────────────────────────────

interface CreateProviderPanelProps {
  onClose: () => void;
  onCreated: (p: Provider) => void;
}

function CreateProviderPanel({ onClose, onCreated }: CreateProviderPanelProps) {
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [apiFormat, setApiFormat] = useState<"openai-compatible" | "anthropic">("openai-compatible");
  const [baseUrl, setBaseUrl] = useState("");
  const [path, setPath] = useState("/v1/chat/completions");
  const [authHeader, setAuthHeader] = useState("Authorization");
  const [authScheme, setAuthScheme] = useState("Bearer");
  const [apiKey, setApiKey] = useState("");
  const [modelsText, setModelsText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const created = await apiCall<Provider>("/api/v1/providers", {
        method: "POST",
        body: {
          name: name.trim().toLowerCase().replace(/\s+/g, "-"),
          display_name: displayName.trim(),
          api_format: apiFormat,
          base_url: baseUrl.trim(),
          path: path.trim(),
          auth_header: authHeader.trim(),
          auth_scheme: authScheme.trim(),
          api_key: apiKey.trim() || undefined,
          models: modelsText.split("\n").map((m) => m.trim()).filter(Boolean),
        },
      });
      onCreated(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
      <FormField label="Provider name" hint="Unique slug — lowercase, hyphens only">
        <TextInput
          value={name}
          onChange={(v) => {
            setName(v);
            if (!displayName) setDisplayName(v);
          }}
          placeholder="my-provider"
          required
        />
      </FormField>

      <FormField label="Display name">
        <TextInput value={displayName} onChange={setDisplayName} placeholder="My Provider" required />
      </FormField>

      <FormField label="API format">
        <select
          value={apiFormat}
          onChange={(e) => {
            const fmt = e.target.value as "openai-compatible" | "anthropic";
            setApiFormat(fmt);
            if (fmt === "anthropic") {
              setPath("/v1/messages");
              setAuthHeader("x-api-key");
              setAuthScheme("");
            } else {
              setPath("/v1/chat/completions");
              setAuthHeader("Authorization");
              setAuthScheme("Bearer");
            }
          }}
          className="w-full rounded-sm bg-surface-container px-3 py-2 text-sm text-on-surface outline outline-1 -outline-offset-1 outline-outline-variant/20"
        >
          <option value="openai-compatible">OpenAI Compatible</option>
          <option value="anthropic">Anthropic</option>
        </select>
      </FormField>

      <FormField label="Base URL">
        <TextInput value={baseUrl} onChange={setBaseUrl} placeholder="https://..." required />
      </FormField>

      <FormField label="Path">
        <TextInput value={path} onChange={setPath} placeholder="/v1/chat/completions" required />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Auth header">
          <TextInput value={authHeader} onChange={setAuthHeader} />
        </FormField>
        <FormField label="Auth scheme">
          <TextInput value={authScheme} onChange={setAuthScheme} placeholder="Bearer" />
        </FormField>
      </div>

      <FormField label="API key">
        <TextInput value={apiKey} onChange={setApiKey} type="password" placeholder="sk-..." />
      </FormField>

      <FormField label="Models" hint="One model ID per line">
        <textarea
          value={modelsText}
          onChange={(e) => setModelsText(e.target.value)}
          rows={3}
          className="w-full rounded-sm bg-surface-container px-3 py-2 font-mono text-sm text-on-surface outline outline-1 -outline-offset-1 outline-outline-variant/20 placeholder:text-on-surface-variant/40"
          placeholder="model-id-1&#10;model-id-2"
        />
      </FormField>

      {error && (
        <p className="rounded-sm bg-error/10 px-4 py-2 text-sm text-error">{error}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="flex items-center justify-center gap-2 bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-[0.15em] text-on-primary hover:bg-primary/90 disabled:opacity-50"
      >
        <Plus size={14} />
        {saving ? "Adding…" : "Add provider"}
      </button>
    </form>
  );
}

// ── Provider card ─────────────────────────────────────────────────────────────

function ProviderCard({
  provider,
  onClick,
}: {
  provider: Provider;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full text-left glass-panel overflow-hidden p-5 transition-all hover:bg-surface-container/60"
    >
      {/* Enabled indicator strip */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-0.5 ${provider.enabled ? "bg-primary" : "bg-outline-variant/30"}`}
      />

      <div className="flex items-start gap-3">
        <ProviderIcon provider={provider} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-on-surface truncate">{provider.display_name}</p>
            <ChevronRight
              size={14}
              className="shrink-0 text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-100"
            />
          </div>
          <p className="mt-0.5 font-mono text-[11px] text-on-surface-variant">{provider.name}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <StatusBadge status={provider.enabled ? "active" : "disabled"} />
            {provider.api_key_configured && (
              <span className="inline-flex items-center gap-1 rounded-sm bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                <KeyRound size={9} /> Key set
              </span>
            )}
            {!provider.api_key_configured && (
              <span className="inline-flex items-center gap-1 rounded-sm bg-warning/10 px-1.5 py-0.5 text-[10px] font-semibold text-warning">
                No key
              </span>
            )}
          </div>

          {provider.models.length > 0 && (
            <p className="mt-2 truncate text-[11px] text-on-surface-variant">
              {provider.models.length === 1
                ? provider.models[0]
                : `${provider.models[0]} +${provider.models.length - 1} more`}
            </p>
          )}

          <div className="mt-2 flex flex-wrap gap-1">
            {provider.capabilities.slice(0, 3).map((cap) => (
              <React.Fragment key={cap}>
                <CapabilityChip cap={cap} />
              </React.Fragment>
            ))}
            {provider.capabilities.length > 3 && (
              <span className="text-[10px] text-on-surface-variant/50">
                +{provider.capabilities.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="glass-panel p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center bg-surface-container-low text-primary outline outline-1 -outline-offset-1 outline-outline-variant/15">
        <Icon size={18} strokeWidth={1.7} />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-on-surface">{value}</p>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

type PanelState =
  | { type: "closed" }
  | { type: "create" }
  | { type: "detail"; provider: Provider };

export function ProvidersView() {
  const [data, setData] = useState<ProvidersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterEnabled, setFilterEnabled] = useState<"all" | "enabled" | "disabled">("all");
  const [panel, setPanel] = useState<PanelState>({ type: "closed" });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall<ProvidersResponse>("/api/v1/providers");
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load providers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const providers = data?.providers ?? [];

  const filtered = providers.filter((p) => {
    const matchesSearch =
      !search ||
      p.display_name.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.capabilities.some((c) => c.includes(search.toLowerCase()));
    const matchesFilter =
      filterEnabled === "all" ||
      (filterEnabled === "enabled" && p.enabled) ||
      (filterEnabled === "disabled" && !p.enabled);
    return matchesSearch && matchesFilter;
  });

  const builtinCount = providers.filter((p) => p.is_builtin).length;
  const customCount = providers.filter((p) => !p.is_builtin).length;

  function handleCreated(p: Provider) {
    setData((prev) =>
      prev
        ? { ...prev, providers: [...prev.providers, p], total: prev.total + 1 }
        : { providers: [p], total: 1, enabled_count: 1 },
    );
    setPanel({ type: "detail", provider: p });
  }

  function handleUpdated(updated: Provider) {
    setData((prev) => {
      if (!prev) return prev;
      const providers = prev.providers.map((p) => (p.id === updated.id ? updated : p));
      return {
        ...prev,
        providers,
        enabled_count: providers.filter((p) => p.enabled).length,
      };
    });
    setPanel({ type: "detail", provider: updated });
  }

  function handleDeleted(id: string) {
    setData((prev) => {
      if (!prev) return prev;
      const providers = prev.providers.filter((p) => p.id !== id);
      return {
        ...prev,
        providers,
        total: prev.total - 1,
        enabled_count: providers.filter((p) => p.enabled).length,
      };
    });
    setPanel({ type: "closed" });
  }

  const panelOpen = panel.type !== "closed";

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-10 flex items-start justify-between gap-6">
          <div>
            <h1 className="mb-2 font-display text-2xl font-semibold uppercase tracking-tight text-on-surface">
              AI Providers
            </h1>
            <p className="font-medium text-on-surface-variant">
              Configure and enable AI providers. Tenants can select their preferred provider from the enabled catalog.
            </p>
          </div>
          <button
            onClick={() => setPanel({ type: "create" })}
            className="flex shrink-0 items-center gap-2 bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-[0.15em] text-on-primary hover:bg-primary/90"
          >
            <Plus size={14} />
            Add provider
          </button>
        </header>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <StatCard label="Total providers" value={data?.total ?? 0} icon={Cpu} />
          <StatCard label="Enabled" value={data?.enabled_count ?? 0} icon={CheckCircle2} />
          <StatCard label="Built-in catalog" value={builtinCount} icon={Layers} />
          <StatCard label="Custom" value={customCount} icon={Settings2} />
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-52">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search providers or capabilities…"
              className="w-full rounded-sm bg-surface-container py-2 pl-9 pr-4 text-sm text-on-surface outline outline-1 -outline-offset-1 outline-outline-variant/20 placeholder:text-on-surface-variant/50"
            />
          </div>
          <div className="flex rounded-sm outline outline-1 -outline-offset-1 outline-outline-variant/20">
            {(["all", "enabled", "disabled"] as const).map((val) => (
              <button
                key={val}
                onClick={() => setFilterEnabled(val)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] capitalize transition-colors ${
                  filterEnabled === val
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading && (
          <div className="flex items-center justify-center py-24 text-sm text-on-surface-variant">
            Loading providers…
          </div>
        )}

        {error && !loading && (
          <div className="rounded-sm bg-error/10 px-6 py-4 text-sm text-error">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Sparkles size={32} className="mb-4 text-on-surface-variant/30" />
            <p className="font-semibold text-on-surface">No providers match</p>
            <p className="mt-1 text-sm text-on-surface-variant">
              {search ? "Try a different search term" : "Add a custom provider to get started"}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((provider) => (
              <React.Fragment key={provider.id}>
                <ProviderCard
                  provider={provider}
                  onClick={() => setPanel({ type: "detail", provider })}
                />
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Side panels */}
      <SidePanel
        open={panelOpen}
        onClose={() => setPanel({ type: "closed" })}
        title={panel.type === "create" ? "Add provider" : panel.type === "detail" ? panel.provider.display_name : ""}
      >
        {panel.type === "create" && (
          <CreateProviderPanel
            onClose={() => setPanel({ type: "closed" })}
            onCreated={handleCreated}
          />
        )}
        {panel.type === "detail" && (
          <React.Fragment key={panel.provider.id}>
            <ProviderDetailPanel
              provider={panel.provider}
              onClose={() => setPanel({ type: "closed" })}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          </React.Fragment>
        )}
      </SidePanel>
    </div>
  );
}
