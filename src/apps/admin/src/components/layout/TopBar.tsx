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
    <div className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between bg-surface px-10 outline outline-1 -outline-offset-1 outline-outline-variant/10">
      <div className="flex items-center gap-6">
        <div className="bg-surface-container-high px-4 py-3 outline outline-1 -outline-offset-1 outline-outline-variant/15">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Surface</p>
          <p className="mt-1 font-display text-sm font-semibold uppercase tracking-wide text-on-surface">{surface.title}</p>
        </div>

        <div className="flex items-center gap-2.5 bg-surface-container-low px-3 py-1.5 outline outline-1 -outline-offset-1 outline-emerald-500/25">
          <div className="h-1.5 w-1.5 animate-pulse bg-emerald-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/90">Runtime shell</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="bg-surface-container-high px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant outline outline-1 -outline-offset-1 outline-outline-variant/15">
          {sessionLabel}
        </div>
        <div className="bg-surface-container-high px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant outline outline-1 -outline-offset-1 outline-outline-variant/15">
          {runtime.apiBaseUrl || "same-origin api"}
        </div>
        {runtime.arkham.enabled && (
          <div className="bg-surface-container-high px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant outline outline-1 -outline-offset-1 outline-outline-variant/15">
            {runtime.arkham.label} sidecar
          </div>
        )}
      </div>
    </div>
  );
}
