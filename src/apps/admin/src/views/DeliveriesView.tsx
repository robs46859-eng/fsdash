import React, { useState, useEffect } from "react";
import { Send, Filter, MoreHorizontal, ShieldCheck } from "lucide-react";
import { Delivery } from "../../../../types";
import { api } from "../api";
import { StatusBadge, cn } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingState } from "../components/common/LoadingState";

export const DeliveriesView = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const data = await api.getDeliveries();
        setDeliveries(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveries();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-2xl font-display font-semibold tracking-tighter mb-3 text-midnight">Deliveries</h1>
          <p className="text-pastel-purple font-medium">Tracking and verification of delivered payloads.</p>
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
                  <th className="px-8 py-4 text-[10px] font-bold text-pastel-pink uppercase tracking-[0.2em]">Delivery ID</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-pastel-pink uppercase tracking-[0.2em]">Provider</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-pastel-pink uppercase tracking-[0.2em]">Type</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-pastel-pink uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-pastel-pink uppercase tracking-[0.2em]">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-0">
                      <LoadingState />
                    </td>
                  </tr>
                ) : deliveries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-0">
                      <EmptyState 
                        message="No Deliveries Recorded" 
                        icon={Send} 
                      />
                      <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest pb-12 font-bold">
                        Governance logs are empty. No payloads have been dispatched.
                      </p>
                    </td>
                  </tr>
                ) : (
                  deliveries.map((delivery) => (
                    <tr key={delivery.id} className="group hover:bg-white/40 transition-all">
                      <td className="px-8 py-6">
                        <p className="text-sm font-mono font-bold text-midnight">{delivery.id}</p>
                        <p className="text-[10px] text-pastel-pink uppercase tracking-widest mt-1">Item: {delivery.itemId}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={14} className="text-emerald-500" />
                          <span className="text-sm font-semibold text-midnight">{delivery.provider}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border",
                          delivery.dryRun ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        )}>
                          {delivery.dryRun ? "Dry Run" : "Live"}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge status={delivery.status} />
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs text-pastel-orange font-bold">{new Date(delivery.timestamp).toLocaleString()}</p>
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
