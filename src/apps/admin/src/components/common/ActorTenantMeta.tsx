import React from "react";

export const ActorTenantMeta = ({
  actor,
  tenant,
  path,
}: {
  actor: string;
  tenant: string;
  path?: string;
}) => (
  <div className="flex items-center gap-3">
    <div className="flex h-6 w-6 items-center justify-center bg-surface-container-high text-[10px] font-bold text-on-surface-variant outline outline-1 -outline-offset-1 outline-outline-variant/15">
      {actor[0].toUpperCase()}
    </div>
    <div className="flex flex-col">
      <span className="text-xs font-semibold text-on-surface">{actor.split("@")[0]}</span>
      <span className="font-mono text-[9px] uppercase tracking-tight text-primary">
        {tenant} {path && `• ${path}`}
      </span>
    </div>
  </div>
);
