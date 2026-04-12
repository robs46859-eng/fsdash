import React, { useState, useEffect } from "react";
import { Zap, Filter, MoreHorizontal, FlaskConical } from "lucide-react";
import { ReviewItem } from "../../../../types";
import { api } from "../api";
import { StatusBadge } from "../components/common/StatusBadge";
import { ActorTenantMeta } from "../components/common/ActorTenantMeta";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingState } from "../components/common/LoadingState";

export const ExecutionsView = () => {
  const [executions, setExecutions] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExecutions = async () => {
      try {
        const data = await api.getReviewQueue();
        setExecutions(data.filter((i) => i.status === "executed" || i.status === "delivered"));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExecutions();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12">
          <h1 className="mb-3 font-display text-2xl font-semibold uppercase tracking-tight text-on-surface">Executions</h1>
          <p className="font-medium text-on-surface-variant">Real-time monitoring of outbound action execution.</p>
        </header>

        <div className="glass-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-outline-variant/15 bg-surface-container-low p-5">
            <div className="flex items-center gap-6">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary transition-colors duration-150 hover:bg-surface-container-high"
              >
                <Filter size={16} /> Filter
              </button>
            </div>
            <button
              type="button"
              className="p-2.5 text-on-surface-variant transition-colors duration-150 hover:bg-surface-container-high"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Workflow</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Actor</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Execution Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-0">
                      <LoadingState />
                    </td>
                  </tr>
                ) : executions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-0">
                      <EmptyState message="No Active Executions" icon={Zap} />
                      <p className="pb-12 text-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        System is idle. No actions are currently in flight.
                      </p>
                    </td>
                  </tr>
                ) : (
                  executions.map((item) => (
                    <tr key={item.id} className="group transition-colors duration-150 hover:bg-surface-container-low/60">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-sm font-bold text-on-surface">{item.workflowName}</p>
                            <p className="mt-1 text-[10px] uppercase tracking-widest text-primary">{item.id}</p>
                          </div>
                          {item.metadata.dryRunFlag && (
                            <div className="flex items-center gap-1 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-200 outline outline-1 -outline-offset-1 outline-amber-500/20">
                              <FlaskConical size={10} strokeWidth={2.5} />
                              <span className="text-[9px] font-black uppercase tracking-tighter">Dry Run</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-8 py-6">
                        <ActorTenantMeta actor={item.actor} tenant={item.tenant} />
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-primary">
                          {new Date(
                            item.history.find((h) => h.action === "executed")?.timestamp || item.timestamp,
                          ).toLocaleString()}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
