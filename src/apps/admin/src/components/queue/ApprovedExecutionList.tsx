import React from "react";
import { ReviewItem } from "../../../../../types";
import { Play, ChevronRight } from "lucide-react";

export const ApprovedExecutionList = ({ items, onSelect }: { items: ReviewItem[], onSelect: (item: ReviewItem) => void }) => {
  const approvedItems = items.filter(i => i.status === "approved");

  if (approvedItems.length === 0) return null;

  return (
    <div className="mb-12">
      <h3 className="text-[10px] font-bold text-pastel-pink uppercase tracking-[0.2em] mb-4">Ready for Execution</h3>
      <div className="grid grid-cols-2 gap-4">
        {approvedItems.map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelect(item)}
            className="glass-panel p-4 flex items-center justify-between hover:border-pastel-purple transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-pastel-purple/5 flex items-center justify-center text-pastel-purple border border-pastel-purple/10">
                <Play size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-midnight">{item.workflowName}</p>
                <p className="text-[10px] text-pastel-pink uppercase tracking-widest">{item.id}</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-200 group-hover:translate-x-1 transition-transform" />
          </div>
        ))}
      </div>
    </div>
  );
};
