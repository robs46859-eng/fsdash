import React from "react";
import { ReviewItem } from "../../../../../types";
import { Play, ChevronRight } from "lucide-react";

export const ApprovedExecutionList = ({
  items,
  onSelect,
}: {
  items: ReviewItem[];
  onSelect: (item: ReviewItem) => void;
}) => {
  const approvedItems = items.filter((i) => i.status === "approved");

  if (approvedItems.length === 0) return null;

  return (
    <div className="mb-12">
      <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Ready for Execution</h3>
      <div className="grid grid-cols-2 gap-4">
        {approvedItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            className="glass-panel group flex cursor-pointer items-center justify-between p-4 text-left transition-colors duration-150 ease-[cubic-bezier(0,0,0.2,1)] hover:outline hover:-outline-offset-1 hover:outline-primary/30"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center bg-primary/10 text-primary outline outline-1 -outline-offset-1 outline-primary/25">
                <Play size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">{item.workflowName}</p>
                <p className="text-[10px] uppercase tracking-widest text-primary">{item.id}</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-on-surface-variant transition-transform duration-150 group-hover:translate-x-1" />
          </button>
        ))}
      </div>
    </div>
  );
};
