import React from "react";
import { AlertCircle } from "lucide-react";

export const DecisionTracePanel = ({ trace }: { trace: string }) => (
  <div className="space-y-6">
    <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Decision Path</label>
    <div className="border border-outline-variant/15 bg-surface-container-low p-5 font-mono text-[11px] leading-relaxed text-on-surface-variant">
      {trace}
    </div>
    <div className="flex items-start gap-4 border border-primary/20 bg-primary/5 p-4">
      <AlertCircle size={18} className="mt-0.5 text-primary" />
      <p className="text-xs font-medium leading-relaxed text-on-surface-variant">
        This action was triggered based on high-intent signals from the last 24 hours.
      </p>
    </div>
  </div>
);
