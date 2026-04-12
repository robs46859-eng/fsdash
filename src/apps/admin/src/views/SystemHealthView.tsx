import React, { useEffect, useState } from "react";
import { Activity, HeartPulse, ShieldCheck } from "lucide-react";
import { HealthProbe, probeHealthEndpoint } from "../../../../lib/platform";
import { RuntimeConfig } from "../../../../lib/runtime";
import { StatusBadge } from "../components/common/StatusBadge";

interface SystemHealthViewProps {
  runtime: RuntimeConfig;
}

export function SystemHealthView({ runtime }: SystemHealthViewProps) {
  const [probes, setProbes] = useState<HealthProbe[]>([]);

  useEffect(() => {
    let active = true;

    Promise.all([
      probeHealthEndpoint("Platform health", runtime.api.healthPath),
      probeHealthEndpoint("Platform readiness", runtime.api.readinessPath),
      runtime.arkham.enabled
        ? probeHealthEndpoint(
            `${runtime.arkham.label} sidecar`,
            runtime.arkham.healthPath,
            runtime.arkham.baseUrl,
          )
        : Promise.resolve({
            label: `${runtime.arkham.label} sidecar`,
            state: "missing" as const,
            message: "The Arkham sidecar is disabled in runtime configuration.",
          }),
    ]).then((nextProbes) => {
      if (active) {
        setProbes(nextProbes);
      }
    });

    return () => {
      active = false;
    };
  }, [runtime]);

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12">
          <h1 className="mb-3 font-display text-2xl font-semibold uppercase tracking-tight text-on-surface">System Health</h1>
          <p className="font-medium text-on-surface-variant">
            Live probes for the FullStack platform and the Arkham sidecar. No local mock health states are injected here.
          </p>
        </header>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Health endpoint",
              value: runtime.api.healthPath ?? "Not configured",
              icon: HeartPulse,
            },
            {
              title: "Readiness endpoint",
              value: runtime.api.readinessPath ?? "Not configured",
              icon: Activity,
            },
            {
              title: "Arkham sidecar",
              value: runtime.arkham.enabled ? "Enabled" : "Disabled",
              icon: ShieldCheck,
            },
          ].map((item) => (
            <div key={item.title} className="glass-panel p-6">
              <div className="mb-5 flex h-11 w-11 items-center justify-center bg-surface-container-low text-primary outline outline-1 -outline-offset-1 outline-outline-variant/15">
                <item.icon size={20} strokeWidth={1.7} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">{item.title}</p>
              <p className="mt-2 break-words font-mono text-sm text-on-surface">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="glass-panel overflow-hidden">
          <div className="border-b border-outline-variant/15 bg-surface-container-low px-6 py-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-primary">Probe results</h2>
          </div>
          <div className="divide-y divide-outline-variant/15">
            {probes.map((probe) => (
              <div key={probe.label} className="grid gap-4 px-6 py-5 md:grid-cols-[220px_120px_1fr]">
                <div>
                  <p className="text-sm font-semibold text-on-surface">{probe.label}</p>
                  <p className="mt-1 break-words text-[11px] font-mono text-on-surface-variant">
                    {probe.endpoint ?? "No endpoint configured"}
                  </p>
                </div>
                <div>
                  <StatusBadge status={probe.state} />
                </div>
                <div>
                  <p className="text-sm leading-6 text-on-surface-variant">{probe.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
