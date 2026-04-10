import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    approved: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    rejected: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    needs_fix: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    executed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    delivered: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  };

  return (
    <span className={cn(
      "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border",
      styles[status] || "bg-gray-100 text-gray-500 border-gray-200"
    )}>
      {status.replace("_", " ")}
    </span>
  );
};

export const ActorTenantMeta = ({ actor, tenant, path }: { actor: string, tenant: string, path?: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-400">
      {actor[0].toUpperCase()}
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-slate-600 font-semibold">{actor.split("@")[0]}</span>
      <span className="text-[9px] text-slate-400 font-mono uppercase tracking-tight">{tenant} {path && `• ${path}`}</span>
    </div>
  </div>
);

export const EmptyState = ({ message = "No items found", icon: Icon }: { message?: string, icon?: any }) => (
  <div className="flex flex-col items-center justify-center py-20 text-slate-300">
    {Icon && <Icon size={48} strokeWidth={1} className="mb-4" />}
    <p className="text-sm font-bold uppercase tracking-widest">{message}</p>
  </div>
);

export const LoadingState = () => (
  <div className="animate-pulse space-y-4 p-8">
    <div className="h-8 bg-slate-200/50 rounded-xl w-1/4" />
    <div className="h-32 bg-slate-200/50 rounded-2xl w-full" />
    <div className="h-32 bg-slate-200/50 rounded-2xl w-full" />
  </div>
);

export const ErrorState = ({ error }: { error: string }) => (
  <div className="p-8 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-center">
    <p className="text-rose-600 font-bold uppercase tracking-widest text-xs">Error</p>
    <p className="text-rose-500 text-sm mt-2">{error}</p>
  </div>
);
