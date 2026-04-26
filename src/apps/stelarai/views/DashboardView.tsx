import React, { useEffect, useState } from "react";
import { Orbit, WalletCards, Activity, Zap, Cpu, TrendingUp } from "lucide-react";
import { StatusBadge } from "../../admin/src/components/common/StatusBadge";
import { LoadingState } from "../../admin/src/components/common/LoadingState";
import { ErrorState } from "../../admin/src/components/common/ErrorState";
import { EmptyState } from "../../admin/src/components/common/EmptyState";
import { fetchStelaraiBlueprint, fetchStelaraiWorkspaces } from "../api";
import type { StelaraiBlueprintResponse, StelaraiWorkspace } from "../types";

export function DashboardView() {
  const [blueprint, setBlueprint] = useState<StelaraiBlueprintResponse | null>(null);
  const [workspaces, setWorkspaces] = useState<StelaraiWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([fetchStelaraiBlueprint(), fetchStelaraiWorkspaces()])
      .then(([blueprintData, workspaceData]) => {
        if (!active) return;
        setBlueprint(blueprintData);
        setWorkspaces(workspaceData.workspaces);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unable to load the StelarAI dashboard.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!blueprint) return <EmptyState message="No StelarAI configuration found." icon={Orbit} />;

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-surface">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center bg-primary/10 text-primary shadow-sm">
              <Orbit size={20} strokeWidth={1.7} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold uppercase tracking-tight text-on-surface">
                StelarAI Dashboard
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">
                {blueprint.product.positioning}
              </p>
            </div>
          </div>
        </header>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="glass-panel p-6 border-l-2 border-primary">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Active Workflows</p>
            <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-on-surface">
              {workspaces.reduce((acc, w) => acc + w.workflow_count, 0)}
            </p>
          </div>
          <div className="glass-panel p-6 border-l-2 border-secondary">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">Connected Sources</p>
            <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-on-surface">
              {workspaces.reduce((acc, w) => acc + w.connected_source_count, 0)}
            </p>
          </div>
          <div className="glass-panel p-6 border-l-2 border-tertiary">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary">Production Jobs</p>
            <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-on-surface">
              0
            </p>
          </div>
          <div className="glass-panel p-6 border-l-2 border-primary">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Provider Tier</p>
            <p className="mt-3 font-display text-lg font-semibold tracking-tight text-on-surface uppercase">
              Balanced
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <section className="glass-panel overflow-hidden">
            <div className="border-b border-outline-variant/10 bg-surface-container-low px-6 py-5 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-primary">Available Modules</h2>
              <Zap size={16} className="text-primary" />
            </div>
            <div className="divide-y divide-outline-variant/10">
              {blueprint.modules.map((module) => (
                <div key={module.module_key} className="grid gap-4 px-6 py-5 md:grid-cols-[180px_100px_1fr]">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{module.module_label}</p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-on-surface-variant">
                      {module.module_key}
                    </p>
                  </div>
                  <div>
                    <StatusBadge
                      status={
                        module.delivery_status === "planned"
                          ? "default"
                          : module.delivery_status === "scaffolded"
                            ? "configured"
                            : "active"
                      }
                    />
                  </div>
                  <p className="text-xs leading-5 text-on-surface-variant">{module.pathway_summary}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-8">
            <section className="glass-panel overflow-hidden">
              <div className="border-b border-outline-variant/10 bg-surface-container-low px-6 py-5 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-primary">Intelligence</h2>
                <TrendingUp size={16} className="text-primary" />
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded">
                  <TrendingUp size={18} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-on-surface">Digital IT Girl</p>
                    <p className="text-[11px] text-on-surface-variant mt-1">Predictive Niche Engine is active and scanning for trend clusters.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-secondary/5 rounded">
                  <Cpu size={18} className="text-secondary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-on-surface">Public Beta</p>
                    <p className="text-[11px] text-on-surface-variant mt-1">Software Tracker is monitoring 12 watchlists.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="glass-panel overflow-hidden">
              <div className="border-b border-outline-variant/10 bg-surface-container-low px-6 py-5 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-primary">System</h2>
                <Activity size={16} className="text-primary" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">API Status</span>
                  <StatusBadge status="active" />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Provider Lane</span>
                  <span className="text-xs font-bold text-on-surface">Balanced</span>
                </div>
                <div className="pt-4 border-t border-outline-variant/10">
                  <p className="text-[10px] text-on-surface-variant leading-relaxed">
                    StelarAI productionJobs are isolated per workspace and routed via the primary fs-ai gateway.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
