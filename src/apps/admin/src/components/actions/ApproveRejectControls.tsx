import React from "react";
import { CheckCircle2 } from "lucide-react";

export const ApproveRejectControls = ({
  onApprove,
  onReject,
  onNeedsFix,
  disabled,
}: {
  onApprove: () => void;
  onReject: () => void;
  onNeedsFix: () => void;
  disabled?: boolean;
}) => (
  <div className="flex gap-3">
    <button
      type="button"
      onClick={onApprove}
      disabled={disabled}
      className="btn-primary flex flex-1 items-center justify-center gap-2"
    >
      <CheckCircle2 size={18} /> Approve
    </button>
    <button
      type="button"
      onClick={onReject}
      disabled={disabled}
      className="btn-secondary text-rose-300 outline-rose-500/30 hover:bg-rose-500/10 disabled:opacity-30"
    >
      Reject
    </button>
    <button
      type="button"
      onClick={onNeedsFix}
      disabled={disabled}
      className="btn-minimal text-on-surface-variant disabled:opacity-30"
    >
      Needs Fix
    </button>
  </div>
);
