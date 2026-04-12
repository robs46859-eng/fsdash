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
