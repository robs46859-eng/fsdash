import React from "react";
import { LayoutDashboard } from "lucide-react";

export const EmptyState = ({ message = "No items found", icon: Icon = LayoutDashboard }: { message?: string, icon?: any }) => (
  <div className="flex flex-col items-center justify-center py-20 text-slate-200">
    <Icon size={48} strokeWidth={1} className="mb-4" />
    <p className="text-sm font-bold uppercase tracking-widest">{message}</p>
  </div>
);
