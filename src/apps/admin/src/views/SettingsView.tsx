import React from "react";
import { Globe, LockKeyhole, Shield, Waypoints } from "lucide-react";
import { RuntimeConfig } from "../../../../lib/runtime";

interface SettingsViewProps {
  runtime: RuntimeConfig;
}

export function SettingsView({ runtime }: SettingsViewProps) {
  const sections = [
    {
      title: "Deployment assumptions",
      icon: Globe,
      items: [
        `Public host: ${runtime.publicBaseUrl}`,
        `App base path: ${runtime.appBaseUrl}`,
        `Platform API base: ${runtime.apiBaseUrl || "same-origin / reverse proxy"}`,
      ],
    },
    {
      title: "Authentication posture",
      icon: LockKeyhole,
      items: [
        `Auth mode: ${runtime.authMode}`,
        `Trust upstream auth: ${runtime.trustUpstreamAuth ? "true" : "false"}`,
        `Session probe: ${runtime.sessionProbePath ?? "not configured"}`,
      ],
    },
    {
      title: "Arkham sidecar",
      icon: Waypoints,
      items: [
        `Enabled: ${runtime.arkham.enabled ? "true" : "false"}`,
        `Base URL: ${runtime.arkham.baseUrl ?? "same host / not configured"}`,
        `Health path: ${runtime.arkham.healthPath ?? "not configured"}`,
      ],
    },
    {
      title: "Governance notes",
      icon: Shield,
      items: [
        "No operator controls are rendered unless a backend route exists to support them.",
        "Arkham remains a sidecar module and does not replace FullStack product identity.",
        "Production operator flows are bearer-first; cookie compatibility is documented but not the primary auth path.",
        "Reverse proxy and CORS assumptions are documented in DEPLOYMENT_NOTES.md.",
      ],
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12">
          <h1 className="mb-3 font-display text-2xl font-semibold uppercase tracking-tight text-on-surface">Settings</h1>
          <p className="font-medium text-on-surface-variant">Runtime and deployment posture for the FullStack operator shell.</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <div key={section.title} className="glass-panel p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center bg-surface-container-low text-primary outline outline-1 -outline-offset-1 outline-outline-variant/15">
                <section.icon size={22} strokeWidth={1.6} />
              </div>
              <h2 className="font-display text-lg font-semibold uppercase tracking-tight text-on-surface">{section.title}</h2>
              <div className="mt-4 space-y-3">
                {section.items.map((item) => (
                  <div
                    key={item}
                    className="bg-surface-container-low px-4 py-4 text-sm leading-6 text-on-surface-variant outline outline-1 -outline-offset-1 outline-outline-variant/15"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
