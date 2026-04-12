import React from "react";
import { ReviewItem } from "../../../../../types";
import { cn } from "../common/StatusBadge";

export const WorkflowMetricStrip = ({ items }: { items: ReviewItem[] }) => {
  const metrics = [
    {
      label: "Pending Review",
      value: items.filter((i) => i.status === "pending").length,
      color: "text-primary",
    },
    {
      label: "Ready to Execute",
      value: items.filter((i) => i.status === "approved").length,
      color: "text-rose-300",
    },
    {
      label: "Executed Today",
      value: items.filter((i) => i.status === "executed").length,
      color: "text-orange-300",
    },
    {
      label: "Delivered",
      value: items.filter((i) => i.status === "delivered").length,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="mb-12 grid grid-cols-4 gap-8">
      {metrics.map((m, i) => (
        <div key={i} className="glass-panel p-8">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{m.label}</p>
          <p className={cn("font-display text-xl font-semibold tracking-tight", m.color)}>{m.value}</p>
        </div>
      ))}
    </div>
  );
};
