import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pending: "border-l-amber-400 bg-amber-500/10 text-amber-200",
    approved: "border-l-indigo-400 bg-indigo-500/10 text-indigo-200",
    rejected: "border-l-rose-400 bg-rose-500/10 text-rose-200",
    needs_fix: "border-l-orange-400 bg-orange-500/10 text-orange-200",
    executed: "border-l-sky-400 bg-sky-500/10 text-sky-200",
    delivered: "border-l-emerald-400 bg-emerald-500/10 text-emerald-200",
    active: "border-l-emerald-400 bg-emerald-500/10 text-emerald-200",
    configured: "border-l-indigo-400 bg-indigo-500/10 text-indigo-200",
    blocked: "border-l-rose-400 bg-rose-500/10 text-rose-200",
    loading: "border-l-outline-variant bg-surface-container-high text-on-surface-variant",
    unsupported: "border-l-outline-variant bg-surface-container-high text-on-surface-variant",
    unauthorized: "border-l-amber-400 bg-amber-500/10 text-amber-200",
    error: "border-l-rose-400 bg-rose-500/10 text-rose-200",
    empty: "border-l-outline-variant bg-surface-container-high text-on-surface-variant",
    live: "border-l-emerald-400 bg-emerald-500/10 text-emerald-200",
    degraded: "border-l-amber-400 bg-amber-500/10 text-amber-200",
    missing: "border-l-outline-variant bg-surface-container-high text-on-surface-variant",
  };

  return (
    <span
      className={cn(
        "inline-flex border-l-[3px] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest",
        styles[status] || "border-l-outline-variant bg-surface-container-high text-on-surface-variant",
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
};

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
      <span className="text-[9px] font-mono uppercase tracking-tight text-on-surface-variant">
        {tenant} {path && `• ${path}`}
      </span>
    </div>
  </div>
);

export const EmptyState = ({
  message = "No items found",
  icon: Icon,
}: {
  message?: string;
  icon?: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}) => (
  <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
    {Icon && <Icon size={48} strokeWidth={1} className="mb-4 opacity-40" />}
    <p className="font-display text-sm font-bold uppercase tracking-widest">{message}</p>
  </div>
);

export const LoadingState = () => (
  <div className="animate-pulse space-y-4 p-8">
    <div className="h-8 w-1/4 bg-surface-container-high" />
    <div className="h-32 w-full bg-surface-container-high" />
    <div className="h-32 w-full bg-surface-container-high" />
  </div>
);

export const ErrorState = ({ error }: { error: string }) => (
  <div className="border-l-[3px] border-l-rose-400 bg-rose-500/5 p-8 text-center">
    <p className="font-display text-xs font-bold uppercase tracking-widest text-rose-300">Error</p>
    <p className="mt-2 text-sm text-rose-200/90">{error}</p>
  </div>
);
