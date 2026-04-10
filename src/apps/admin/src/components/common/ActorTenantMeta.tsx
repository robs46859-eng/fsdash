import React from "react";

export const ActorTenantMeta = ({ actor, tenant, path }: { actor: string, tenant: string, path?: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-6 h-6 rounded-lg bg-white border border-pink-100 shadow-sm flex items-center justify-center text-[10px] font-bold text-pink-300">
      {actor[0].toUpperCase()}
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-midnight font-semibold">{actor.split("@")[0]}</span>
      <span className="text-[9px] text-pastel-pink font-mono uppercase tracking-tight">{tenant} {path && `• ${path}`}</span>
    </div>
  </div>
);
