import React from "react";
import { RuntimeConfig } from "../../../../../lib/runtime";
import { SurfaceDefinition } from "../../data/surfaces";

interface TopBarProps {
  runtime: RuntimeConfig;
  surface: SurfaceDefinition;
  sessionLabel: string;
}

export function TopBar({ runtime, surface, sessionLabel }: TopBarProps) {
  return (
    <div className="sticky top-0 z-30 flex h-24 shrink-0 items-center justify-between border-b border-outline-variant/10 bg-surface/70 px-10 backdrop-blur-xl">
      <div className="flex items-center gap-6">
        <div className="glass-panel px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-secondary-accent">Surface</p>
          <p className="mt-1 font-display text-base font-semibold uppercase tracking-wide text-on-surface">{surface.title}</p>
        </div>

        <div className="rounded-full border border-secondary-accent/25 bg-secondary-accent/10 px-4 py-2">
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 animate-pulse rounded-full bg-secondary-accent" />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-secondary-accent">Runtime shell</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="glass-panel px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          {sessionLabel}
        </div>
        <div className="glass-panel px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          {runtime.apiBaseUrl || "same-origin api"}
        </div>
        {runtime.arkham.enabled && (
          <div className="glass-panel px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
            {runtime.arkham.label} sidecar
          </div>
        )}
      </div>
    </div>
  );
}
