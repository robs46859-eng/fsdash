import React from "react";
import { Activity, Cable, Globe, ShieldCheck } from "lucide-react";
import { RuntimeConfig } from "../../../../lib/runtime";
import { SurfaceDefinition } from "../data/surfaces";
import { StatusBadge } from "../components/common/StatusBadge";

interface OverviewViewProps {
  runtime: RuntimeConfig;
  surfaces: SurfaceDefinition[];
}

function mappingStatus(surface: SurfaceDefinition, runtime: RuntimeConfig) {
  if (!surface.routeKey) {
    return {
      label: "shell",
      tone: "configured",
      detail: "This surface is runtime-driven and does not require a dedicated fs-ai route.",
    };
  }

  const value = runtime.api[surface.routeKey];
  if (value) {
    return {
      label: "mapped",
      tone: "active",
      detail: `Configured endpoint: ${value}`,
    };
  }

  return {
    label: "blocked",
    tone: "blocked",
    detail: "No matching route exists in the current fs-ai repo snapshot.",
  };
}

export function OverviewView({ runtime, surfaces }: OverviewViewProps) {
  const mappedSurfaces = surfaces.filter(
    (surface) => surface.routeKey && runtime.api[surface.routeKey],
  ).length;

  const overviewCards = [
    {
      title: "Public host",
      value: runtime.publicBaseUrl,
      detail: "Target production hostname for the landing page and dashboard.",
      icon: Globe,
    },
    {
      title: "Platform API origin",
      value: runtime.apiBaseUrl || "Same-origin / reverse proxy",
      detail: "All data flows through this base URL when routes are configured.",
      icon: Cable,
    },
    {
      title: "Mapped backend surfaces",
      value: `${mappedSurfaces}/${surfaces.filter((surface) => surface.routeKey).length}`,
      detail: "Only configured or implemented surfaces are treated as live.",
      icon: Activity,
    },
    {
      title: "Auth posture",
      value: runtime.authMode === "none" ? "Local shell" : "External session",
      detail: "Production should prefer upstream auth or bootstrap bearer auth over cookie-dependent operator flows.",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12">
          <h1 className="mb-3 font-display text-2xl font-semibold uppercase tracking-tight text-on-surface">Overview</h1>
          <p className="font-medium text-on-surface-variant">
            FullStack is the primary operator surface. This overview reflects actual runtime configuration instead of
            placeholder telemetry.
          </p>
        </header>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((card) => (
            <div key={card.title} className="glass-panel p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center bg-surface-container-low text-primary outline outline-1 -outline-offset-1 outline-outline-variant/15">
                  <card.icon size={20} strokeWidth={1.7} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Runtime</span>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">{card.title}</p>
              <p className="mt-2 break-words font-display text-lg font-semibold tracking-tight text-on-surface">{card.value}</p>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">{card.detail}</p>
            </div>
          ))}
        </div>

        <div className="glass-panel overflow-hidden">
          <div className="border-b border-outline-variant/15 bg-surface-container-low px-6 py-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-primary">Surface readiness</h2>
          </div>
          <div className="divide-y divide-outline-variant/15">
            {surfaces.map((surface) => {
              const status = mappingStatus(surface, runtime);
              return (
                <div key={surface.id} className="grid gap-4 px-6 py-5 md:grid-cols-[220px_120px_1fr]">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{surface.title}</p>
                    <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-on-surface-variant">
                      {surface.path}
                    </p>
                  </div>
                  <div>
                    <StatusBadge status={status.tone} />
                  </div>
                  <div>
                    <p className="text-sm leading-6 text-on-surface-variant">{status.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
