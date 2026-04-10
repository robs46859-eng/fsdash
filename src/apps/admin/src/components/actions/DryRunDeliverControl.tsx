import React from "react";
import { Send } from "lucide-react";

export const DryRunDeliverControl = ({ onDeliver, disabled }: { onDeliver: () => void, disabled?: boolean }) => (
  <button 
    onClick={onDeliver}
    disabled={disabled}
    className="w-full btn-primary bg-purple-600 shadow-purple-600/20 flex items-center justify-center gap-2"
  >
    <Send size={18} /> Dry-Run Deliver
  </button>
);
