import React from "react";
import { Send } from "lucide-react";

export const DryRunDeliverControl = ({ onDeliver, disabled }: { onDeliver: () => void; disabled?: boolean }) => (
  <button type="button" onClick={onDeliver} disabled={disabled} className="btn-primary flex w-full items-center justify-center gap-2">
    <Send size={18} /> Dry-Run Deliver
  </button>
);
