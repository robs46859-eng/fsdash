import React from "react";
import { Play, CheckCircle2 } from "lucide-react";

export const ExecutionPanel = ({ status, onExecute }: { status: string, onExecute: () => void }) => {
  if (status !== "approved") return null;

  return (
    <div className="p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
          <Play size={24} />
        </div>
        <div>
          <p className="text-sm font-bold text-indigo-900">Ready for Execution</p>
          <p className="text-[11px] text-indigo-600 font-medium">Governance check passed. Awaiting manual trigger.</p>
        </div>
      </div>
      <button 
        onClick={onExecute}
        className="w-full btn-primary bg-indigo-600 shadow-indigo-600/20 flex items-center justify-center gap-2"
      >
        <Play size={18} /> Execute Action
      </button>
    </div>
  );
};
