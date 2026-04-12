import React from "react";
import { ReviewItem } from "../../../../../types";
import { StatusBadge, cn } from "../common/StatusBadge";
import { ActorTenantMeta } from "../common/ActorTenantMeta";
import { FlaskConical, Inbox } from "lucide-react";
import { EmptyState } from "../common/EmptyState";
import { LoadingState } from "../common/LoadingState";

export const ReviewRow = ({
  item,
  onClick,
}: {
  item: ReviewItem;
  onClick: () => void;
  key?: string;
}) => {
  return (
    <tr onClick={onClick} className="group cursor-pointer transition-colors duration-150 ease-[cubic-bezier(0,0,0.2,1)] hover:bg-surface-container-low/80">
      <td className="px-8 py-6">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-bold text-on-surface">{item.workflowName}</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-primary">{item.stage}</p>
          </div>
          {item.metadata.dryRunFlag && (
            <div className="flex items-center gap-1.5 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-200 outline outline-1 -outline-offset-1 outline-amber-500/20">
              <div className="h-1 w-1 animate-pulse bg-amber-400" />
              <FlaskConical size={10} strokeWidth={2.5} />
              <span className="text-[9px] font-black uppercase tracking-tighter">Dry Run Mode</span>
            </div>
          )}
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-2.5 w-2.5 outline outline-2 -outline-offset-2 outline-opacity-30",
              item.score > 90
                ? "bg-emerald-400 outline-emerald-400"
                : item.score > 80
                  ? "bg-orange-400 outline-orange-400"
                  : "bg-rose-500 outline-rose-500",
            )}
          />
          <span className="text-sm font-bold text-on-surface">{item.score}</span>
        </div>
      </td>
      <td className="px-8 py-6">
        <StatusBadge status={item.status} />
      </td>
      <td className="px-8 py-6">
        <p className="max-w-[200px] truncate text-sm font-medium text-on-surface-variant">{item.preview}</p>
      </td>
      <td className="px-8 py-6">
        <ActorTenantMeta actor={item.actor} tenant={item.tenant} />
      </td>
      <td className="px-8 py-6">
        <p className="text-xs font-bold text-primary">
          {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </td>
    </tr>
  );
};

export const ReviewQueueTable = ({
  items,
  onRowClick,
  loading,
}: {
  items: ReviewItem[];
  onRowClick: (item: ReviewItem) => void;
  loading: boolean;
}) => {
  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Workflow</th>
              <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Score</th>
              <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Status</th>
              <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Preview</th>
              <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Actor</th>
              <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-0">
                  <LoadingState />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-0">
                  <EmptyState message="Review Queue is Clear" icon={Inbox} />
                  <p className="pb-12 text-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    All outbound actions have been governed.
                  </p>
                </td>
              </tr>
            ) : (
              items.map((item) => <ReviewRow key={item.id} item={item} onClick={() => onRowClick(item)} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
