import React, { FormEvent, useCallback, useEffect, useState } from "react";
import { 
  FileCode, Plus, Search, X, Clock, User, Building, 
  History, Play, ChevronRight, Save, Layers, Settings, Tag
} from "lucide-react";
import { buildEndpoint } from "../../../../lib/platform";
import { getOperatorAuthHeaders, getOperatorRequestCredentials } from "../../../../lib/operatorAuth";
import { StatusBadge } from "../components/common/StatusBadge";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PromptVersion {
  id: string;
  prompt_id: string;
  version_number: number;
  label: string | null;
  system_prompt: string | null;
  user_prompt_template: string;
  provider_id: string | null;
  model: string | null;
  parameters: Record<string, any>;
  created_by: string;
  created_at: string;
}

interface Prompt {
  id: string;
  tenant_id: string | null;
  name: string;
  description: string | null;
  tags: string[];
  current_version_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  versions?: PromptVersion[];
}

interface Tenant {
  id: string;
  name: string;
}

interface Provider {
  id: string;
  display_name: string;
  models: string[];
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
      <div className="fixed right-0 top-0 z-50 h-screen w-[720px] overflow-y-auto border-l border-outline-variant/15 bg-surface shadow-2xl">
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

// ── Create Prompt Panel ───────────────────────────────────────────────────────

function CreatePromptPanel({
  tenants,
  providers,
  onCreated,
  onClose,
}: {
  tenants: Tenant[];
  providers: Provider[];
  onCreated: (prompt: Prompt) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userPromptTemplate, setUserPromptTemplate] = useState("");
  const [providerId, setProviderId] = useState("");
  const [model, setModel] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const prompt = await apiCall<Prompt>("/api/v1/prompts", {
        method: "POST",
        body: {
          name,
          tenant_id: tenantId || null,
          description: description || null,
          initial_version: {
            system_prompt: systemPrompt || null,
            user_prompt_template: userPromptTemplate,
            provider_id: providerId || null,
            model: model || null,
          },
        },
      });
      onCreated(prompt);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create prompt.");
    } finally {
      setSubmitting(false);
    }
  }

  const activeProvider = providers.find(p => p.id === providerId);

  return (
    <SidePanel title="Create New Prompt" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Name</label>
            <input 
              className="ds-input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              placeholder="e.g. Lead Qualification"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Tenant</label>
            <select className="ds-input" value={tenantId} onChange={e => setTenantId(e.target.value)}>
              <option value="">— Platform Global —</option>
              {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Description</label>
          <input 
            className="ds-input" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="What is this prompt for?"
          />
        </div>

        <div className="space-y-1.5 pt-4 border-t border-outline-variant/15">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">System Instructions</label>
          <textarea 
            className="ds-input min-h-[100px] text-xs leading-5" 
            value={systemPrompt} 
            onChange={e => setSystemPrompt(e.target.value)} 
            placeholder="Persona and constraints..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">User Prompt Template</label>
          <textarea 
            className="ds-input min-h-[160px] text-xs font-mono leading-6" 
            value={userPromptTemplate} 
            onChange={e => setUserPromptTemplate(e.target.value)} 
            required
            placeholder="Use {{variable_name}} for dynamic injection..."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Default Provider</label>
            <select className="ds-input" value={providerId} onChange={e => setProviderId(e.target.value)}>
              <option value="">— Platform Default —</option>
              {providers.map(p => <option key={p.id} value={p.id}>{p.display_name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Default Model</label>
            <select className="ds-input" value={model} onChange={e => setModel(e.target.value)}>
              <option value="">— Provider Default —</option>
              {activeProvider?.models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-primary font-bold">{error}</p>}
        
        <button 
          type="submit" 
          disabled={submitting}
          className="btn-primary w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.22em]"
        >
          {submitting ? "Creating…" : "Save to Library"}
          <Save size={16} />
        </button>
      </form>
    </SidePanel>
  );
}

// ── Prompt Detail Panel ──────────────────────────────────────────────────────

function PromptDetailPanel({
  promptId,
  providers,
  onUpdated,
  onClose,
}: {
  promptId: string;
  providers: Provider[];
  onUpdated: (prompt: Prompt) => void;
  onClose: () => void;
}) {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"detail" | "history" | "test">("detail");

  const loadPrompt = useCallback(() => {
    setLoading(true);
    apiCall<Prompt>(`/api/v1/prompts/${promptId}`)
      .then(data => {
        setPrompt(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [promptId]);

  useEffect(() => {
    loadPrompt();
  }, [loadPrompt]);

  if (loading) return <SidePanel title="Loading Prompt..." onClose={onClose}><div className="animate-pulse space-y-4"><div className="h-40 bg-surface-container-high" /><div className="h-40 bg-surface-container-high" /></div></SidePanel>;
  if (!prompt) return <SidePanel title="Error" onClose={onClose}><p className="text-on-surface-variant">{error}</p></SidePanel>;

  const currentVersion = prompt.versions?.find(v => v.id === prompt.current_version_id) || prompt.versions?.[0];

  return (
    <SidePanel title={prompt.name} onClose={onClose}>
      <div className="flex gap-1 mb-8 border-b border-outline-variant/15">
        {[
          { id: "detail", label: "Template", icon: FileCode },
          { id: "history", label: "History", icon: History },
          { id: "test", label: "Test Run", icon: Play },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${
              activeTab === tab.id 
                ? "text-primary border-b-2 border-primary -mb-px" 
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "detail" && currentVersion && (
        <div className="space-y-6">
          <div className="bg-surface-container-low p-4 outline outline-1 outline-outline-variant/15">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">System Persona</span>
              <span className="text-[10px] font-mono text-on-surface-variant">v{currentVersion.version_number}</span>
            </div>
            <p className="text-xs leading-5 text-on-surface-variant whitespace-pre-wrap">
              {currentVersion.system_prompt || "No system prompt configured."}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Template Body</span>
            <div className="bg-surface-container-low p-5 outline outline-1 outline-outline-variant/15 font-mono text-xs leading-6 text-on-surface">
              {currentVersion.user_prompt_template}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-surface-container-low p-4">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Provider</span>
                <span className="text-sm font-semibold text-on-surface">{providers.find(p => p.id === currentVersion.provider_id)?.display_name || "Default"}</span>
             </div>
             <div className="bg-surface-container-low p-4">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Model</span>
                <span className="text-sm font-semibold text-on-surface">{currentVersion.model || "Default"}</span>
             </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-4">
          {prompt.versions?.map(v => (
            <div key={v.id} className="group border border-outline-variant/15 bg-surface-container-low p-5 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center bg-surface-container-high text-primary font-bold text-xs border border-outline-variant/15">
                    {v.version_number}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{v.label || "Untitled Version"}</p>
                    <p className="text-[10px] text-on-surface-variant flex items-center gap-2">
                      <User size={10} /> {v.created_by} • {new Date(v.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {v.id === prompt.current_version_id && <StatusBadge status="active" label="Current" />}
              </div>
              <div className="line-clamp-2 text-xs text-on-surface-variant font-mono bg-black/5 p-2 mb-3">
                {v.user_prompt_template}
              </div>
              <div className="flex justify-end">
                <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:opacity-80">
                  Restore this version
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "test" && (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant opacity-50">
          <Play size={40} strokeWidth={1} className="mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest">Test Runner Interface</p>
          <p className="text-xs mt-2 italic">Connect to Playground API pending...</p>
        </div>
      )}
    </SidePanel>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export const PromptLibraryView = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [panel, setPanel] = useState<"closed" | "create" | "detail">("closed");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      apiCall<Prompt[]>("/api/v1/prompts"),
      apiCall<Tenant[]>("/api/v1/tenants"),
      apiCall<{ providers: Provider[] }>("/api/v1/providers"),
    ])
      .then(([pData, tData, provData]) => {
        setPrompts(pData);
        setTenants(tData);
        setProviders(provData.providers.filter(p => p.enabled));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = prompts.filter(p => 
    !search || 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 flex items-end justify-between">
          <div>
            <h1 className="mb-3 font-display text-2xl font-semibold uppercase tracking-tight text-on-surface">
              Prompt Library
            </h1>
            <p className="font-medium text-on-surface-variant">
              System templates, versioned persona, and reusable AI instructions.
            </p>
          </div>
          <button
            onClick={() => setPanel("create")}
            className="btn-primary flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em]"
          >
            <Plus size={16} />
            New Prompt
          </button>
        </header>

        <div className="glass-panel overflow-hidden">
          <div className="flex items-center gap-4 border-b border-outline-variant/15 bg-surface-container-low p-5">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                className="ds-input w-full pl-9 text-sm"
                placeholder="Search prompt name or tags..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
             <div className="animate-pulse divide-y divide-outline-variant/15">
               {[1, 2, 3].map(i => <div key={i} className="h-20 px-8 py-6" />)}
             </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 px-8 py-20 text-on-surface-variant opacity-60">
              <Layers size={48} strokeWidth={1} />
              <p className="text-sm font-bold uppercase tracking-widest">{search ? "No matches found" : "Library is empty"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low">
                    {["Prompt Name", "Tenant", "Tags", "Last Updated", ""].map(h => (
                      <th key={h} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-primary">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15">
                  {filtered.map(p => (
                    <tr 
                      key={p.id} 
                      onClick={() => { setSelectedId(p.id); setPanel("detail"); }}
                      className="cursor-pointer group hover:bg-surface-container-low/60 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-on-surface">{p.name}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">{p.description || "No description"}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs uppercase tracking-widest text-on-surface-variant">
                          {tenants.find(t => t.id === p.tenant_id)?.name || "Global"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1.5">
                          {p.tags.map(t => (
                            <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-surface-container-high text-[9px] font-bold uppercase tracking-tighter text-on-surface-variant border border-outline-variant/15">
                              <Tag size={8} /> {t}
                            </span>
                          ))}
                          {p.tags.length === 0 && <span className="text-xs text-on-surface-variant italic">—</span>}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs text-on-surface">{new Date(p.updated_at).toLocaleDateString()}</p>
                        <p className="text-[10px] text-on-surface-variant">by {p.created_by}</p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <ChevronRight size={18} className="inline text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
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
        <CreatePromptPanel
          tenants={tenants}
          providers={providers}
          onCreated={p => setPrompts(prev => [p, ...prev])}
          onClose={() => setPanel("closed")}
        />
      )}

      {panel === "detail" && selectedId && (
        <PromptDetailPanel
          promptId={selectedId}
          providers={providers}
          onUpdated={p => setPrompts(prev => prev.map(item => item.id === p.id ? p : item))}
          onClose={() => setPanel("closed")}
        />
      )}
    </div>
  );
};
