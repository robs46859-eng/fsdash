import React from "react";
import {
  ArrowRight,
  Layers3,
  Shield,
  Activity,
  ServerCog,
  Route,
} from "lucide-react";
import { RuntimeConfig } from "../../../../lib/runtime";

interface LandingPageProps {
  runtime: RuntimeConfig;
  onOpenAccess: () => void;
  onOpenApp: () => void;
}

const landingPoints = [
  {
    title: "Operator-first control plane",
    description:
      "FullStack runs as the primary UI and control surface for platform operations, tenancy, policy, and runtime health.",
    icon: Layers3,
  },
  {
    title: "Governed platform boundaries",
    description:
      "Every surface stays honest about backend support. If fs-ai does not provide a route yet, the UI shows that boundary directly.",
    icon: Shield,
  },
  {
    title: "Live deployment posture",
    description:
      "Host assumptions, API origin wiring, readiness probes, and Arkham sidecar posture are exposed without fake metrics.",
    icon: Activity,
  },
];

export function LandingPage({
  runtime,
  onOpenAccess,
  onOpenApp,
}: LandingPageProps) {
  const canOpenApp = runtime.authMode === "none" || runtime.trustUpstreamAuth;

  return (
    <div className="min-h-screen px-6 py-8 md:px-10">
      <div className="ds-glass mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col outline outline-1 -outline-offset-1 outline-outline-variant/15">
        <header className="flex items-center justify-between border-b border-outline-variant/15 px-8 py-6 md:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-surface-container-high font-display text-sm font-bold text-on-surface outline outline-1 -outline-offset-1 outline-outline-variant/15">
              F
            </div>
            <div>
              <p className="font-display text-xl font-semibold uppercase tracking-tight text-on-surface">
                FullStack
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Operator Runtime</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn-minimal text-xs font-bold uppercase tracking-[0.22em] text-primary"
              onClick={onOpenAccess}
            >
              Access
            </button>
            {canOpenApp && (
              <button type="button" className="btn-primary text-xs font-bold uppercase tracking-[0.22em]" onClick={onOpenApp}>
                Open Dashboard
              </button>
            )}
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-10 px-8 py-10 md:px-10 md:py-12">
          <section className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="glass-panel overflow-hidden p-8 md:p-10">
              <div className="mb-8 flex flex-wrap items-center gap-3">
                <span className="bg-surface-container-low px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-primary outline outline-1 -outline-offset-1 outline-primary/25">
                  {new URL(runtime.publicBaseUrl).host}
                </span>
                <span className="bg-surface-container-low px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant outline outline-1 -outline-offset-1 outline-outline-variant/15">
                  Arkham Sidecar Ready
                </span>
              </div>

              <h1 className="max-w-3xl font-display text-4xl font-semibold uppercase tracking-tight text-on-surface md:text-6xl">
                FullStack is the operator UI for the fs-ai platform.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-on-surface-variant md:text-lg">
                The public landing experience and the authenticated control panel share the same design system, route shell,
                and deployment posture. Arkham stays modular and operationally adjacent instead of overtaking the product
                identity.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-primary inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em]"
                  onClick={onOpenAccess}
                >
                  Operator Access
                  <ArrowRight size={14} />
                </button>
                {runtime.demoRequestUrl && (
                  <a
                    className="btn-secondary inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em]"
                    href={runtime.demoRequestUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Request Demo
                    <ArrowRight size={14} />
                  </a>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="glass-panel p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="bg-surface-container-low p-3 text-primary outline outline-1 -outline-offset-1 outline-outline-variant/15">
                    <ServerCog size={22} strokeWidth={1.6} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Platform</span>
                </div>
                <p className="text-sm font-semibold text-on-surface">Primary backend</p>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                  fs-ai is treated as the source of truth. This frontend will not invent routes or data when the platform
                  repo does not provide them.
                </p>
              </div>

              <div className="glass-panel p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="bg-surface-container-low p-3 text-primary outline outline-1 -outline-offset-1 outline-outline-variant/15">
                    <Route size={22} strokeWidth={1.6} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">Runtime</span>
                </div>
                <p className="text-sm font-semibold text-on-surface">Deployment target</p>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                  Public host: <span className="font-mono text-primary">{runtime.publicBaseUrl}</span>
                </p>
                <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                  App route: <span className="font-mono text-primary">{runtime.appBaseUrl}</span>
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {landingPoints.map((point) => (
              <div key={point.title} className="glass-panel p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center bg-surface-container-low text-primary outline outline-1 -outline-offset-1 outline-outline-variant/15">
                  <point.icon size={22} strokeWidth={1.6} />
                </div>
                <h2 className="font-display text-lg font-semibold uppercase tracking-tight text-on-surface">{point.title}</h2>
                <p className="mt-3 text-sm leading-6 text-on-surface-variant">{point.description}</p>
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}
