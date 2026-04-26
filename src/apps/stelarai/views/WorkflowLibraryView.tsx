import React, { useEffect, useState } from "react";
import { Library, Copy, Search, Filter } from "lucide-react";
import { StatusBadge } from "../../admin/src/components/common/StatusBadge";
import { LoadingState } from "../../admin/src/components/common/LoadingState";
import { 
  fetchStelaraiWorkspaces, 
  fetchStelaraiWorkspaceWorkflows,
  duplicateStelaraiWorkflow
} from "../api";
import type { StelaraiWorkflow, StelaraiWorkspace } from "../types";

export function WorkflowLibraryView() {
  const [workspaces, setWorkspaces] = useState<StelaraiWorkspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
  const [workflows, setWorkflows] = useState<StelaraiWorkflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStelaraiWorkspaces().then(data => {
      setWorkspaces(data.workspaces);
      if (data.workspaces.length > 0) setSelectedWorkspaceId(data.workspaces[0].id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedWorkspaceId) {
      setLoading(true);
      fetchStelaraiWorkspaceWorkflows(selectedWorkspaceId)
        .then(data => setWorkflows(data.workflows))
        .finally(() => setLoading(false));
    }
  }, [selectedWorkspaceId]);

  async function handleClone(id: string) {
    try {
      await duplicateStelaraiWorkflow(id);
      alert("Workflow cloned to workspace.");
      // Refresh list
      fetchStelaraiWorkspaceWorkflows(selectedWorkspaceId).then(data => setWorkflows(data.workflows));
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading && workflows.length === 0) return <LoadingState />;

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-surface">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-on-surface">Workflow Library</h1>
              <p className="mt-2 text-sm text-on-surface-variant">Templates and persisted workflow blueprints.</p>
            </div>
            <select 
              value={selectedWorkspaceId}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              className="bg-surface-container-high px-4 py-2 rounded text-xs font-bold uppercase tracking-widest text-on-surface outline-none"
            >
              {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {workflows.map(wf => (
            <div key={wf.id} className="glass-panel p-6 group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Library size={20} />
                </div>
                <StatusBadge status={wf.status === "active" ? "active" : "default"} />
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-1">{wf.name}</h3>
              <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-6">{wf.module_key} • {wf.id}</p>
              
              <div className="flex items-center justify-between pt-6 border-t border-outline-variant/10">
                <span className="text-xs text-on-surface-variant">{wf.provider_lane} lane</span>
                <button 
                  onClick={() => handleClone(wf.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded bg-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/20 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Copy size={14} /> Clone
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
