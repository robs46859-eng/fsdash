import React from "react";
import { Play } from "lucide-react";

export const ExecuteControl = ({ onExecute, disabled }: { onExecute: () => void, disabled?: boolean }) => (
  <button 
    onClick={onExecute}
    disabled={disabled}
    className="w-full btn-primary bg-indigo-600 shadow-indigo-600/20 flex items-center justify-center gap-2"
  >
    <Play size={18} /> Execute Action
  </button>
);
