import React from "react";
import { AlertCircle } from "lucide-react";

export const DecisionTracePanel = ({ trace }: { trace: string }) => (
  <div className="space-y-6">
    <label className="text-[10px] font-bold text-pastel-pink uppercase tracking-widest">Decision Path</label>
    <div className="p-5 bg-slate-50/50 rounded-2xl font-mono text-[11px] text-slate-600 leading-relaxed border border-slate-100">
      {trace}
    </div>
    <div className="flex items-start gap-4 p-4 bg-pastel-purple/5 rounded-2xl border border-pastel-purple/10">
      <AlertCircle size={18} className="text-pastel-purple mt-0.5" />
      <p className="text-xs text-pastel-purple/80 leading-relaxed font-medium">This action was triggered based on high-intent signals from the last 24 hours.</p>
    </div>
  </div>
);
