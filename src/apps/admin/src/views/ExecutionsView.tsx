import React, { useState, useEffect } from "react";
import { Play, Zap, Filter, MoreHorizontal, FlaskConical } from "lucide-react";
import { ReviewItem } from "../../../../types";
import { api } from "../api";
import { StatusBadge, cn } from "../components/common/StatusBadge";
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
        // Filter for items that are executed or delivered
        setExecutions(data.filter(i => i.status === "executed" || i.status === "delivered"));
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
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-2xl font-display font-semibold tracking-tighter mb-3 text-midnight">Executions</h1>
          <p className="text-pastel-purple font-medium">Real-time monitoring of outbound action execution.</p>
        </header>

        <div className="glass-panel overflow-hidden">
          <div className="p-5 border-b border-slate-200/50 flex items-center justify-between bg-white/20">
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-pink-400 hover:bg-pink-50 rounded-xl transition-all">
                <Filter size={16} /> Filter
              </button>
            </div>
            <button className="p-2.5 text-pink-300 hover:bg-pink-50 rounded-xl transition-all">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/10">
                  <th className="px-8 py-4 text-[10px] font-bold text-pastel-pink uppercase tracking-[0.2em]">Workflow</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-pastel-pink uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-pastel-pink uppercase tracking-[0.2em]">Actor</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-pastel-pink uppercase tracking-[0.2em]">Execution Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-0">
                      <LoadingState />
                    </td>
                  </tr>
                ) : executions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-0">
                      <EmptyState 
                        message="No Active Executions" 
                        icon={Zap} 
                      />
                      <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest pb-12 font-bold">
                        System is idle. No actions are currently in flight.
                      </p>
                    </td>
                  </tr>
                ) : (
                  executions.map((item) => (
                    <tr key={item.id} className="group hover:bg-white/40 transition-all">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-sm font-bold text-midnight">{item.workflowName}</p>
                            <p className="text-[10px] text-pastel-pink uppercase tracking-widest mt-1">{item.id}</p>
                          </div>
                          {item.metadata.dryRunFlag && (
                            <div className="px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded-full flex items-center gap-1 border border-amber-500/20">
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
                        <p className="text-xs text-pastel-orange font-bold">
                          {new Date(item.history.find(h => h.action === "executed")?.timestamp || item.timestamp).toLocaleString()}
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
