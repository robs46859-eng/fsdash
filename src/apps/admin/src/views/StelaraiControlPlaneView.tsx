import React, { useEffect, useState } from "react";
import { Orbit, WalletCards } from "lucide-react";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { LoadingState } from "../components/common/LoadingState";
import { StatusBadge } from "../components/common/StatusBadge";
import { fetchStelaraiBlueprint, fetchStelaraiWorkspaces } from "../../../stelarai/api";
import type { StelaraiBlueprintResponse, StelaraiWorkspace } from "../../../stelarai/types";

export function StelaraiControlPlaneView() {
  const [blueprint, setBlueprint] = useState<StelaraiBlueprintResponse | null>(null);
  const [workspaces, setWorkspaces] = useState<StelaraiWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([fetchStelaraiBlueprint(), fetchStelaraiWorkspaces()])
      .then(([blueprintData, workspaceData]) => {
        if (!active) {
          return;
        }
        setBlueprint(blueprintData);
        setWorkspaces(workspaceData.workspaces);
      })
      .catch((err: unknown) => {
        if (!active) {
          return;
        }
        setError(err instanceof Error ? err.message : "Unable to load the StelarAI control plane.");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <LoadingState />;
  }
  if (error) {
    return <ErrorState error={error} />;
  }
  if (!blueprint) {
    return <EmptyState message="No StelarAI blueprint is available yet." icon={Orbit} />;
  }

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-accent/12 text-secondary-accent outline outline-1 -outline-offset-1 outline-secondary-accent/20">
              <Orbit size={20} strokeWidth={1.7} />
            </div>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-secondary-accent">Control plane</p>
              <h1 className="font-display text-3xl font-semibold uppercase tracking-tight text-on-surface">
                StelarAI Control Plane
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">
                {blueprint.product.positioning}
              </p>
            </div>
          </div>
        </header>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="glass-panel p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Primary domain</p>
            <p className="mt-3 font-display text-lg font-semibold tracking-tight text-on-surface">
              {blueprint.product.primary_domain}
            </p>
          </div>
          <div className="glass-panel p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Modules</p>
            <p className="mt-3 font-display text-lg font-semibold tracking-tight text-on-surface">
              {blueprint.modules.length}
            </p>
          </div>
          <div className="glass-panel p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Provider lanes</p>
            <p className="mt-3 font-display text-lg font-semibold tracking-tight text-on-surface">
              {blueprint.provider_lanes.length}
            </p>
          </div>
          <div className="glass-panel p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Workspaces</p>
            <p className="mt-3 font-display text-lg font-semibold tracking-tight text-on-surface">
              {workspaces.length}
            </p>
          </div>
        </div>

        <section className="mb-8 glass-panel overflow-hidden">
          <div className="border-b border-outline-variant/15 bg-surface-container-low px-6 py-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-primary">Provider strategy</h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              Anthropic is open, business and personal accounts are allowed, and every workflow must have a cheap or free execution path.
            </p>
          </div>
          <div className="grid gap-4 p-6 md:grid-cols-2">
            {blueprint.provider_lanes.map((lane) => (
              <div
                key={lane.lane}
                className="border border-outline-variant/15 bg-surface-container-low p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                    {lane.lane}
                  </p>
                  <StatusBadge
                    status={
                      lane.lane === "free"
                        ? "configured"
                        : lane.lane === "premium"
                          ? "active"
                          : "default"
                    }
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-on-surface-variant">{lane.description}</p>
                <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.16em] text-on-surface-variant">
                  {lane.providers.join(" • ")}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 glass-panel overflow-hidden">
          <div className="border-b border-outline-variant/15 bg-surface-container-low px-6 py-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-primary">Module rollout</h2>
          </div>
          <div className="divide-y divide-outline-variant/15">
            {blueprint.modules.map((module) => (
              <div key={module.module_key} className="grid gap-4 px-6 py-5 md:grid-cols-[220px_140px_1fr]">
                <div>
                  <p className="text-sm font-semibold text-on-surface">{module.module_label}</p>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-on-surface-variant">
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
                <p className="text-sm leading-6 text-on-surface-variant">{module.pathway_summary}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-outline-variant/15 bg-surface-container-low px-6 py-5">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-primary">Workspace inventory</h2>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                This is the first persisted StelarAI slice. It tracks rollout posture before builder and execution UI land.
              </p>
            </div>
            <WalletCards size={18} className="text-primary" />
          </div>
          {workspaces.length === 0 ? (
            <EmptyState
              message="No StelarAI workspaces have been created yet."
              icon={WalletCards}
            />
          ) : (
            <div>
              {workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className="grid gap-4 border-t border-outline-variant/15 px-6 py-5 md:grid-cols-[1.6fr_0.8fr_1fr_1fr]"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-on-surface">{workspace.name}</p>
                      <StatusBadge status={workspace.status === "active" ? "active" : "default"} />
                    </div>
                    <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-on-surface-variant">
                      {workspace.slug}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                      {workspace.target_domain || "No target domain mapped yet."}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Model lane</p>
                    <p className="mt-2 text-sm text-on-surface">{workspace.primary_model_tier}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Counts</p>
                    <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                      Modules {workspace.module_count}
                      <br />
                      Sources {workspace.connected_source_count}
                      <br />
                      Accounts {workspace.connected_account_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Workflows</p>
                    <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                      {workspace.workflow_count} draft or active workflows
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
