import React from "react";
import { ReviewItem } from "../../../../../types";
import { cn } from "../common/StatusBadge";

export const WorkflowMetricStrip = ({ items }: { items: ReviewItem[] }) => {
  const metrics = [
    { label: "Pending Review", value: items.filter(i => i.status === "pending").length, color: "text-pastel-orange" },
    { label: "Ready to Execute", value: items.filter(i => i.status === "approved").length, color: "text-rose-500" },
    { label: "Executed Today", value: items.filter(i => i.status === "executed").length, color: "text-orange-500" },
    { label: "Delivered", value: items.filter(i => i.status === "delivered").length, color: "text-emerald-500" },
  ];

  return (
    <div className="grid grid-cols-4 gap-8 mb-12">
      {metrics.map((m, i) => (
        <div key={i} className="glass-panel p-8">
          <p className="text-[10px] font-bold text-pastel-pink uppercase tracking-[0.2em] mb-2">{m.label}</p>
          <p className={cn("text-xl font-display font-semibold tracking-tighter", m.color)}>{m.value}</p>
        </div>
      ))}
    </div>
  );
};
