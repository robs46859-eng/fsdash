import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    approved: "bg-indigo-100 text-indigo-700 border-indigo-200",
    rejected: "bg-rose-100 text-rose-700 border-rose-200",
    needs_fix: "bg-orange-100 text-orange-700 border-orange-200",
    executed: "bg-blue-100 text-blue-700 border-blue-200",
    delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
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
