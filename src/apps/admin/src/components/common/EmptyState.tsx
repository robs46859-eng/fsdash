import React from "react";
import { LayoutDashboard } from "lucide-react";

export const EmptyState = ({
  message = "No items found",
  icon: Icon = LayoutDashboard,
}: {
  message?: string;
  icon?: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}) => (
  <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
    <Icon size={48} strokeWidth={1} className="mb-4 opacity-40" />
    <p className="font-display text-sm font-bold uppercase tracking-widest">{message}</p>
  </div>
);
