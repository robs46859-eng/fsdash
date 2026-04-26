import React, { useEffect, useState } from "react";
import { Database, RefreshCcw, Plus, Trash2, Globe, Server } from "lucide-react";
import { StatusBadge, cn } from "../../admin/src/components/common/StatusBadge";
import { LoadingState } from "../../admin/src/components/common/LoadingState";
import { ErrorState } from "../../admin/src/components/common/ErrorState";
import { 
  fetchStelaraiWorkspaces, 
  fetchStelaraiWorkspaceSources,
  createStelaraiWorkspaceSource,
  updateStelaraiSource,
  deleteStelaraiSource,
  syncStelaraiSource
} from "../api";
import type { StelaraiConnectedSource, StelaraiWorkspace } from "../types";

export function ConnectedSourcesView() {
  const [workspaces, setWorkspaces] = useState<StelaraiWorkspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
  const [sources, setSources] = useState<StelaraiConnectedSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStelaraiWorkspaces()
      .then(data => {
        setWorkspaces(data.workspaces);
        if (data.workspaces.length > 0) setSelectedWorkspaceId(data.workspaces[0].id);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const refreshSources = () => {
    if (!selectedWorkspaceId) return;
    fetchStelaraiWorkspaceSources(selectedWorkspaceId)
      .then(data => setSources(data.sources))
      .catch(err => setError(err.message));
  };

  useEffect(() => {
    if (selectedWorkspaceId) {
      setLoading(true);
      fetchStelaraiWorkspaceSources(selectedWorkspaceId)
        .then(data => setSources(data.sources))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [selectedWorkspaceId]);

  // Polling for syncing state
  useEffect(() => {
    const syncing = sources.filter(s => s.status === "syncing");
    if (syncing.length === 0) return;

    const timer = setInterval(() => {
      refreshSources();
    }, 2000);

    return () => clearInterval(timer);
  }, [sources]);

  async function handleAddSource() {
    const label = prompt("Source Label (e.g. Production Postgres):");
    if (!label) return;
    
    try {
      const newSrc = await createStelaraiWorkspaceSource(selectedWorkspaceId, {
        source_kind: "postgresql",
        source_label: label,
        sync_mode: "manual",
        metadata: { host: "localhost" }
      });
      setSources(prev => [newSrc, ...prev]);
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleSync(id: string) {
    try {
      const updated = await syncStelaraiSource(id);
      setSources(prev => prev.map(s => s.id === id ? updated : s));
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this source?")) return;
    try {
      await deleteStelaraiSource(id);
      setSources(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading && workspaces.length === 0) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-surface">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-on-surface">Connected Sources</h1>
            <p className="mt-2 text-sm text-on-surface-variant">Manage internal data sources and external ingestion endpoints.</p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={selectedWorkspaceId}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              className="bg-surface-container-high px-4 py-2 rounded text-xs font-bold uppercase tracking-widest text-on-surface outline-none"
            >
              {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <button 
              onClick={handleAddSource}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} /> Add Source
            </button>
          </div>
        </header>

        <div className="grid gap-6">
          {sources.length === 0 ? (
            <div className="glass-panel p-20 text-center flex flex-col items-center justify-center opacity-50">
              <Database size={48} strokeWidth={1} className="mb-4 text-on-surface-variant" />
              <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">No sources mapped yet.</p>
            </div>
          ) : (
            sources.map(src => (
              <div key={src.id} className="glass-panel p-6 flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
                    src.status === "active" ? "bg-primary/10 text-primary" : "bg-surface-container-high text-on-surface-variant"
                  )}>
                    {src.source_kind === "internal" ? <Server size={24} /> : <Globe size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-on-surface">{src.source_label}</h3>
                      <StatusBadge status={src.status} />
                    </div>
                    <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mt-1">
                      {src.source_kind} • {src.sync_mode} • {src.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => handleSync(src.id)}
                    disabled={src.status === "syncing"}
                    className="flex items-center gap-2 px-4 py-2 rounded bg-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/20 disabled:opacity-50"
                  >
                    <RefreshCcw size={14} className={cn(src.status === "syncing" && "animate-spin")} />
                    {src.status === "syncing" ? "Syncing..." : "Sync Now"}
                  </button>
                  <button 
                    onClick={() => handleDelete(src.id)}
                    className="p-2 text-on-surface-variant hover:text-error"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
