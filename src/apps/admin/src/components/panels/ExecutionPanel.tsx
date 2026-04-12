import React from "react";
import { Play } from "lucide-react";

export const ExecutionPanel = ({ status, onExecute }: { status: string; onExecute: () => void }) => {
  return (
    <div className="flex flex-col gap-4 border border-indigo-500/20 bg-indigo-500/5 p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center border border-indigo-500/25 bg-indigo-500/10 text-indigo-300">
          <Play size={24} />
        </div>
        <div>
          <p className="text-sm font-bold text-on-surface">Execution Status</p>
          <p className="text-xs text-on-surface-variant">{status}</p>
        </div>
      </div>
      <button type="button" onClick={onExecute} className="btn-primary w-full">
        Trigger Execution
      </button>
    </div>
  );
};
