import React from "react";
import { CheckCircle2 } from "lucide-react";

export const ApproveRejectControls = ({ onApprove, onReject, onNeedsFix, disabled }: { onApprove: () => void, onReject: () => void, onNeedsFix: () => void, disabled?: boolean }) => (
  <div className="flex gap-3">
    <button 
      onClick={onApprove}
      disabled={disabled}
      className="flex-1 btn-primary flex items-center justify-center gap-2"
    >
      <CheckCircle2 size={18} /> Approve
    </button>
    <button 
      onClick={onReject}
      disabled={disabled}
      className="btn-minimal text-rose-500 hover:bg-rose-500/10 disabled:opacity-30"
    >
      Reject
    </button>
    <button 
      onClick={onNeedsFix}
      disabled={disabled}
      className="btn-minimal text-slate-500 disabled:opacity-30"
    >
      Needs Fix
    </button>
  </div>
);
