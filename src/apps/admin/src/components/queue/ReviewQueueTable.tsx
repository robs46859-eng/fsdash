import React from "react";
import { ReviewItem } from "../../../../../types";
import { StatusBadge, cn } from "../common/StatusBadge";
import { ActorTenantMeta } from "../common/ActorTenantMeta";
import { FlaskConical, Inbox } from "lucide-react";
import { EmptyState } from "../common/EmptyState";
import { LoadingState } from "../common/LoadingState";

export const ReviewRow = ({ item, onClick }: { item: ReviewItem, onClick: () => void, key?: string }) => {
  return (
    <tr 
      onClick={onClick}
      className="group hover:bg-white/40 cursor-pointer transition-all"
    >
      <td className="px-8 py-6">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-bold text-midnight">{item.workflowName}</p>
            <p className="text-[10px] text-pastel-pink uppercase tracking-widest mt-1">{item.stage}</p>
          </div>
          {item.metadata.dryRunFlag && (
            <div className="px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded-full flex items-center gap-1.5 border border-amber-500/20 shadow-sm animate-in fade-in zoom-in duration-300">
              <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
              <FlaskConical size={10} strokeWidth={2.5} />
              <span className="text-[9px] font-black uppercase tracking-tighter">Dry Run Mode</span>
            </div>
          )}
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-2.5 h-2.5 rounded-full ring-4 ring-opacity-30",
            item.score > 90 ? "bg-emerald-500 ring-emerald-500" : item.score > 80 ? "bg-orange-500 ring-orange-500" : "bg-rose-600 ring-rose-600"
          )} />
          <span className="text-sm font-bold text-midnight">{item.score}</span>
        </div>
      </td>
      <td className="px-8 py-6">
        <StatusBadge status={item.status} />
      </td>
      <td className="px-8 py-6">
        <p className="text-sm text-pastel-purple truncate max-w-[200px] font-medium">{item.preview}</p>
      </td>
      <td className="px-8 py-6">
        <ActorTenantMeta actor={item.actor} tenant={item.tenant} />
      </td>
      <td className="px-8 py-6">
        <p className="text-xs text-pastel-orange font-bold">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
      </td>
    </tr>
  );
};

export const ReviewQueueTable = ({ items, onRowClick, loading }: { items: ReviewItem[], onRowClick: (item: ReviewItem) => void, loading: boolean }) => {
  return (
    <div className="glass-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/10">
              <th className="px-8 py-4 text-[10px] font-bold text-pastel-pink uppercase tracking-[0.2em]">Workflow</th>
              <th className="px-8 py-4 text-[10px] font-bold text-pastel-pink uppercase tracking-[0.2em]">Score</th>
              <th className="px-8 py-4 text-[10px] font-bold text-pastel-pink uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-4 text-[10px] font-bold text-pastel-pink uppercase tracking-[0.2em]">Preview</th>
              <th className="px-8 py-4 text-[10px] font-bold text-pastel-pink uppercase tracking-[0.2em]">Actor</th>
              <th className="px-8 py-4 text-[10px] font-bold text-pastel-pink uppercase tracking-[0.2em]">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/50">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-0">
                  <LoadingState />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-0">
                  <EmptyState 
                    message="Review Queue is Clear" 
                    icon={Inbox} 
                  />
                  <p className="text-center text-[10px] text-pink-300 uppercase tracking-widest pb-12 font-bold">
                    All outbound actions have been governed.
                  </p>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <ReviewRow key={item.id} item={item} onClick={() => onRowClick(item)} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
