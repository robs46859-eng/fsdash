import React, { useEffect, useState } from "react";
import { 
  Box, 
  Save, 
  Play, 
  Plus, 
  Trash2, 
  Activity, 
  DollarSign, 
  Clock,
  CheckCircle2,
  ChevronRight,
  Layers,
  Copy
} from "lucide-react";
import { StatusBadge, cn } from "../../admin/src/components/common/StatusBadge";
import { LoadingState } from "../../admin/src/components/common/LoadingState";
import { ErrorState } from "../../admin/src/components/common/ErrorState";
import { 
  fetchStelaraiWorkspaces, 
  fetchStelaraiWorkspaceWorkflows,
  updateStelaraiWorkflow,
  simulateStelaraiWorkflow,
  duplicateStelaraiWorkflow
} from "../api";
import type { 
  StelaraiWorkflow, 
  StelaraiWorkspace, 
  StelaraiSimulationResponse 
} from "../types";

export function CanvasBuilderView() {
  const [workspaces, setWorkspaces] = useState<StelaraiWorkspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
  const [workflows, setWorkflows] = useState<StelaraiWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<StelaraiWorkflow | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState("");
  
  const [simulationResult, setSimulationResult] = useState<StelaraiSimulationResponse | null>(null);

  useEffect(() => {
    fetchStelaraiWorkspaces()
      .then(data => {
        setWorkspaces(data.workspaces);
        if (data.workspaces.length > 0) {
          setSelectedWorkspaceId(data.workspaces[0].id);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedWorkspaceId) {
      setLoading(true);
      fetchStelaraiWorkspaceWorkflows(selectedWorkspaceId)
        .then(data => {
          setWorkflows(data.workflows);
          if (data.workflows.length > 0) {
            setSelectedWorkflow(data.workflows[0]);
          } else {
            setSelectedWorkflow(null);
          }
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [selectedWorkspaceId]);

  async function handleSave() {
    if (!selectedWorkflow) return;
    setSaving(true);
    try {
      const updated = await updateStelaraiWorkflow(selectedWorkflow.id, {
        workflow: selectedWorkflow.workflow,
        provider_lane: selectedWorkflow.provider_lane
      });
      setSelectedWorkflow(updated);
      setWorkflows(prev => prev.map(w => w.id === updated.id ? updated : w));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDuplicate() {
    if (!selectedWorkflow) return;
    setSaving(true);
    try {
      const copy = await duplicateStelaraiWorkflow(selectedWorkflow.id);
      setWorkflows(prev => [copy, ...prev]);
      setSelectedWorkflow(copy);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSimulate() {
    if (!selectedWorkflow) return;
    setSimulating(true);
    setSimulationResult(null);
    try {
      const result = await simulateStelaraiWorkflow(selectedWorkflow.id);
      setSimulationResult(result);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSimulating(false);
    }
  }

  function addNode() {
    if (!selectedWorkflow) return;
    const newNode = {
      id: `n${Date.now()}`,
      type: "llm",
      label: "New Node",
      config: {}
    };
    const updatedWorkflow = {
      ...selectedWorkflow.workflow,
      nodes: [...(selectedWorkflow.workflow.nodes || []), newNode]
    };
    setSelectedWorkflow({ ...selectedWorkflow, workflow: updatedWorkflow });
  }

  if (loading && workspaces.length === 0) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Sub-header */}
      <div className="h-14 border-b border-outline-variant/10 px-8 flex items-center justify-between bg-surface-container-lowest">
        <div className="flex items-center gap-6">
          <select 
            value={selectedWorkspaceId}
            onChange={(e) => setSelectedWorkspaceId(e.target.value)}
            className="bg-transparent text-xs font-bold uppercase tracking-widest text-on-surface outline-none cursor-pointer"
          >
            {workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <div className="h-4 w-[1px] bg-outline-variant/20" />
          <select 
            value={selectedWorkflow?.id || ""}
            onChange={(e) => setSelectedWorkflow(workflows.find(w => w.id === e.target.value) || null)}
            className="bg-transparent text-xs font-bold uppercase tracking-widest text-primary outline-none cursor-pointer"
          >
            {workflows.length === 0 && <option value="">No Workflows</option>}
            {workflows.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleDuplicate}
            disabled={!selectedWorkflow || saving}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface-container-high text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-50"
          >
            <Copy size={14} /> Duplicate
          </button>
          <button 
            onClick={handleSave}
            disabled={!selectedWorkflow || saving}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
          </button>
          <button 
            onClick={handleSimulate}
            disabled={!selectedWorkflow || simulating}
            className="flex items-center gap-2 px-4 py-1.5 rounded bg-primary text-[10px] font-bold uppercase tracking-widest text-on-primary hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            <Play size={14} fill="currentColor" /> {simulating ? "Simulating..." : "Run Simulation"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto p-8 border-r border-outline-variant/10">
          {!selectedWorkflow ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-on-surface-variant italic">Select or create a workflow to begin building.</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-display font-bold text-on-surface">Canvas Editor</h2>
                  <p className="text-xs text-on-surface-variant mt-1 uppercase tracking-wider font-mono">
                    {selectedWorkflow.module_key} • {selectedWorkflow.id}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Provider Lane</span>
                  <select 
                    value={selectedWorkflow.provider_lane}
                    onChange={(e) => setSelectedWorkflow({...selectedWorkflow, provider_lane: e.target.value as any})}
                    className="bg-surface-container-high px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest text-primary outline-none"
                  >
                    <option value="free">Free Lane</option>
                    <option value="cheap">Cheap Lane</option>
                    <option value="balanced">Balanced Lane</option>
                    <option value="premium">Premium Lane</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {(selectedWorkflow.workflow.nodes || []).map((node: any, idx: number) => (
                  <div key={node.id} className="glass-panel p-6 flex items-center gap-6 group">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Layers size={18} />
                    </div>
                    <div className="flex-1 grid grid-cols-[1fr_1fr_auto] gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Node Label</label>
                        <input 
                          type="text"
                          value={node.label}
                          onChange={(e) => {
                            const newNodes = [...selectedWorkflow.workflow.nodes];
                            newNodes[idx] = { ...node, label: e.target.value };
                            setSelectedWorkflow({ ...selectedWorkflow, workflow: { ...selectedWorkflow.workflow, nodes: newNodes } });
                          }}
                          className="bg-transparent border-b border-outline-variant/20 focus:border-primary text-sm font-semibold text-on-surface outline-none py-1"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Type</label>
                        <select 
                          value={node.type}
                          onChange={(e) => {
                            const newNodes = [...selectedWorkflow.workflow.nodes];
                            newNodes[idx] = { ...node, type: e.target.value };
                            setSelectedWorkflow({ ...selectedWorkflow, workflow: { ...selectedWorkflow.workflow, nodes: newNodes } });
                          }}
                          className="bg-transparent border-b border-outline-variant/20 focus:border-primary text-sm font-medium text-on-surface outline-none py-1 cursor-pointer"
                        >
                          <option value="input">User Input</option>
                          <option value="llm">AI Inference</option>
                          <option value="transform">Data Transform</option>
                          <option value="output">Final Export</option>
                        </select>
                      </div>
                      <button 
                        onClick={() => {
                          const newNodes = selectedWorkflow.workflow.nodes.filter((_: any, i: number) => i !== idx);
                          setSelectedWorkflow({ ...selectedWorkflow, workflow: { ...selectedWorkflow.workflow, nodes: newNodes } });
                        }}
                        className="p-2 text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-all self-end mb-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={addNode}
                  className="w-full py-4 border-2 border-dashed border-outline-variant/20 rounded-xl flex items-center justify-center gap-2 text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all group font-bold text-xs uppercase tracking-widest"
                >
                  <Plus size={16} className="group-hover:scale-125 transition-transform" /> Add Node to Canvas
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar / Results Area */}
        <div className="w-96 bg-surface-container-low/30 overflow-y-auto">
          {simulationResult ? (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-primary">Simulation Trace</h3>
                <button onClick={() => setSimulationResult(null)} className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface">Clear</button>
              </div>

              <div className="glass-panel p-6 mb-8 border-l-2 border-primary">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign size={14} className="text-primary" />
                    <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Estimated Cost</span>
                  </div>
                  <span className="text-lg font-display font-bold text-primary">${simulationResult.cost_preview_usd.toFixed(4)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-on-surface-variant" />
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Provider Lane</span>
                  </div>
                  <span className="text-[10px] font-bold text-on-surface uppercase tracking-widest">{simulationResult.provider_lane}</span>
                </div>
              </div>

              <div className="space-y-6">
                {simulationResult.trace.map((step, i) => (
                  <div key={step.node_id} className="relative pl-6">
                    {i !== simulationResult.trace.length - 1 && (
                      <div className="absolute left-[7px] top-5 bottom-[-24px] w-[1px] bg-outline-variant/30" />
                    )}
                    <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-on-surface uppercase tracking-wide">{step.node_label}</p>
                        <span className="text-[9px] font-mono text-on-surface-variant">{step.duration_ms}ms</span>
                      </div>
                      <div className="mt-2 p-3 bg-surface-container-high rounded text-[11px] leading-relaxed text-on-surface-variant font-mono">
                        {step.output_preview}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-4 bg-green/5 border border-green/10 rounded-lg flex items-start gap-3">
                <CheckCircle2 size={16} className="text-green shrink-0 mt-0.5" />
                <p className="text-[10px] text-green/80 font-medium leading-relaxed">
                  Simulation complete. This run used the dry-run path and did not trigger any connected accounts or production jobs.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 h-full flex flex-col items-center justify-center text-center opacity-40">
              <Activity size={48} strokeWidth={1} className="mb-4 text-on-surface-variant" />
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">No Simulation Data</h3>
              <p className="text-[11px] text-on-surface-variant mt-2 max-w-[200px]">
                Click "Run Simulation" to see a dry-run execution trace and cost preview.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
