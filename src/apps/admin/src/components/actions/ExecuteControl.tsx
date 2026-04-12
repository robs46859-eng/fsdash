import React from "react";
import { Play } from "lucide-react";

export const ExecuteControl = ({ onExecute, disabled }: { onExecute: () => void; disabled?: boolean }) => (
  <button type="button" onClick={onExecute} disabled={disabled} className="btn-primary flex w-full items-center justify-center gap-2">
    <Play size={18} /> Execute Action
  </button>
);
